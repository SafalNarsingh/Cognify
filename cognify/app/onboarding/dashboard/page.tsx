"use client";

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import congnifyLogo from '../../../public/cognify_logo.png';

type ChatMessage = { role: 'user' | 'model'; content: string };

const toText = (c: any): string => {
  if (c == null) return '';
  if (typeof c === 'string') return c;
  if (Array.isArray(c)) {
    const parts = c.map((p: any) => p?.text || p?.content || (typeof p === 'string' ? p : '')).filter(Boolean);
    return parts.join('\n').trim();
  }
  return c.text || c.message || JSON.stringify(c);
};

const normalizeMessage = (msg: any): ChatMessage => {
  const roleKey = String(msg.role ?? msg.type ?? '').toLowerCase();
  const role: 'user' | 'model' =
    roleKey === 'ai' || roleKey === 'assistant' || roleKey === 'model'
      ? 'model'
      : 'user';
  return { role, content: toText(msg.content) };
};

// --- TYPEWRITER COMPONENT ---
// This handles the "appearing one by one" effect for new assistant messages
function TypewriterMessage({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 15); // Adjust speed here (lower is faster)
    return () => clearInterval(interval);
  }, [text]);

  return <div className="whitespace-pre-wrap">{displayedText}</div>;
}
// --- CHAT ASSISTANT COMPONENT ---
function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom whenever history or loading status changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    
    setLoading(true);
    setInput('');
    const newHistory: ChatMessage[] = [...history, { role: 'user', content: text }];
    setHistory(newHistory);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, history: newHistory }),
      });
      const json = await res.json();
      
      const assistantText = toText(json?.response ?? json);
      setHistory([...newHistory, { role: 'model', content: assistantText }]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false); // This removes the dots once the output is fetched
    }
  };

  return (
    <>
      {/* CSS for the "Messenger style" bouncing dots */}
      <style>{`
        @keyframes medicalBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
        .dot {
          width: 4px;
          height: 4px;
          background-color: #5F7A7B;
          border-radius: 50%;
          display: inline-block;
          animation: medicalBounce 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
      `}</style>

      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 p-4 bg-[#5F7A7B] text-white rounded-full shadow-lg hover:scale-110 transition-all z-[60]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      )}

      {isOpen && (
        <div className={`fixed transition-all duration-500 z-[60] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col border border-gray-100/50 ${isFullScreen ? 'inset-4 rounded-[2.5rem]' : 'bottom-6 right-6 w-[380px] h-[580px] rounded-[2.5rem]'}`}>
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white rounded-t-[2.5rem]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-[13px] font-semibold text-gray-800 tracking-tight">Clinical Support</h3>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.15em]">Cognify Framework</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsFullScreen(!isFullScreen)} className="text-gray-300 hover:text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6" strokeWidth={1.5}/></svg>
              </button>
              <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-gray-500 text-xl">&times;</button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            {history.length === 0 && (
              <div className="text-center py-10 space-y-3">
                <p className="text-[13px] text-gray-600 font-medium">Your Private Health Space</p>
                <p className="text-[11px] text-gray-400 font-light px-6 leading-relaxed">I'm here to provide evidence-based insights into your cognitive progress. How can I support your wellbeing today?</p>
              </div>
            )}
            
            {history.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] text-[12px] leading-relaxed px-4 py-3 shadow-sm ${m.role === 'user' ? 'bg-[#5F7A7B] text-white rounded-2xl rounded-tr-none' : 'bg-[#F8FAFA] text-gray-700 border border-gray-100 rounded-2xl rounded-tl-none font-light'}`}>
                  {m.role === 'model' && <div className="text-[9px] font-bold text-[#5F7A7B] uppercase tracking-widest mb-1.5 opacity-80">Your Assistant</div>}
                  
                  {/* If it's the last message in history and from the model, use typewriter effect */}
                  {m.role === 'model' && i === history.length - 1 ? (
                    <TypewriterMessage text={m.content} />
                  ) : (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Bouncing dots shown only during fetch */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F8FAFA] border border-gray-100 px-5 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-gray-50 rounded-b-[2.5rem]">
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Describe your symptoms..." 
                className="flex-1 text-[13px] outline-none text-gray-800 font-light placeholder:text-gray-300" 
              />
              <button onClick={sendMessage} className="p-2 text-[#5F7A7B] hover:bg-[#F9F9F7] rounded-full transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TaskWindow({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const tasks = [
    {
      id: 1,
      title: "N-Back Memory Test",
      disorder: "Dementia / Cognitive Decline",
      description: "A continuous performance task used to measure working memory and memory capacity. Identify if the current stimulus matches the one from 'n' steps earlier.",
      image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800", // Representative brain/memory image
      time: "8 mins"
    },
    {
      id: 2,
      title: "Stroop Color Match",
      disorder: "Attention Deficit / Executive Function",
      description: "Assess your ability to inhibit cognitive interference. Name the color of the word rather than reading the word itself.",
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=800",
      time: "5 mins"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-4 z-[70] bg-[#F9F9F7] shadow-2xl rounded-[2rem] border border-gray-100 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 bg-white border-b border-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-light text-gray-800 tracking-tight">Clinical Assessments</h2>
              <p className="text-sm text-gray-400 mt-1">Select a task to begin your cognitive profiling.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-3xl text-gray-400">&times;</button>
          </div>

          {/* Task List (Horizontal Cards) */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-5xl mx-auto w-full">
            {tasks.map((task) => (
              <motion.div 
                key={task.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row h-auto md:h-64 group cursor-pointer"
              >
                {/* Reference Image */}
                <div className="w-full md:w-1/3 h-48 md:h-full relative overflow-hidden">
                  <img 
                    src={task.image} 
                    alt={task.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Content */}
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold text-[#5F7A7B] uppercase tracking-[0.2em]">{task.disorder}</span>
                      <span className="text-[10px] text-gray-400">{task.time}</span>
                    </div>
                    <h3 className="text-2xl font-medium text-gray-800 mb-3">{task.title}</h3>
                    <p className="text-gray-500 text-sm font-light leading-relaxed line-clamp-3">
                      {task.description}
                    </p>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <button className="px-6 py-2 bg-[#5F7A7B] text-white rounded-full text-xs font-medium hover:bg-[#4A6364] transition-all">
                      Begin Assessment
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


// --- JOURNAL COMPONENT --- (Unchanged)
function JournalWindow({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId: string | undefined }) {
  const [journalText, setJournalText] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const [analysis, setAnalysis] = useState<any | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const analyzeJournals = async (textOverride?: string) => {
  setAnalysis(null);
  setAnalysisError(null);
  setAnalyzing(true);
  try {
    const entries = [
      (textOverride ?? journalText?.trim() ?? ''),
      ...history.map((h) => String(h.content || '')).filter(Boolean),
    ].filter(Boolean).slice(0, 10);

    const textPayload = entries.join('\n\n');

    const res = await fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textPayload }),
    });

    const raw = await res.text();
    let data: any;
    try { data = JSON.parse(raw); } catch { data = raw; }

    if (!res.ok) {
      const detail = (data && (data.detail ?? data)) ?? 'Analysis failed';
      const normalizeDetail = (d: any): string => {
        if (typeof d === 'string') return d;
        if (Array.isArray(d)) {
          return d.map((e: any) => {
            const loc = Array.isArray(e?.loc) ? e.loc.join('.') : e?.loc;
            return [e?.msg, loc ? `@ ${loc}` : '', e?.type ? `(${e.type})` : '']
              .filter(Boolean)
              .join(' ');
          }).join('\n');
        }
        if (typeof d === 'object') {
          if (typeof d.msg === 'string') {
            const loc = Array.isArray(d?.loc) ? d.loc.join('.') : d?.loc;
            return [d.msg, loc ? `@ ${loc}` : '', d?.type ? `(${d.type})` : '']
              .filter(Boolean)
              .join(' ');
          }
          return JSON.stringify(d);
        }
        return String(d);
      };
      setAnalysisError(normalizeDetail(detail));
      return;
    }
    setAnalysis(data);
  } catch (e: any) {
    setAnalysisError(String(e?.message ?? e));
  } finally {
    setAnalyzing(false);
  }
};

  useEffect(() => { if (isOpen && userId) fetchHistory(); }, [isOpen, userId]);

  const fetchHistory = async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('journals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (!error && data) setHistory(data);
  };

  const saveJournal = async () => {
  const text = journalText.trim();
  if (!text || !userId) return;

  setIsLoading(true);
  const { error } = await supabase.from('journals').insert([{ user_id: userId, content: text }]);
  setIsLoading(false);

  if (!error) {
    setJournalText("");
    fetchHistory();
    // Auto-run sentiment analysis on the saved entry
    analyzeJournals(text);
  }
};


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 z-[70] bg-white shadow-2xl rounded-[2rem] border border-gray-100 flex overflow-hidden">
          <div className="w-72 bg-[#F9F9F7] border-r border-gray-100 flex flex-col p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">History</h3>
            <div className="flex-1 overflow-y-auto space-y-3">
              {history.map((entry) => (
                <button key={entry.id} onClick={() => setJournalText(entry.content)} className="w-full text-left p-4 rounded-2xl bg-white border border-gray-50 hover:border-[#5F7A7B] transition-all">
                  <p className="text-[10px] text-[#5F7A7B] font-bold mb-1">{new Date(entry.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{entry.content}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="p-8 flex justify-between items-center">
              <h2 className="text-2xl font-light text-gray-800 tracking-tight">Daily Reflection</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-2xl text-gray-400">&times;</button>
            </div>
            <textarea value={journalText} onChange={(e) => setJournalText(e.target.value)} placeholder="What's on your mind?" className="flex-1 px-10 py-4 text-gray-700 outline-none resize-none bg-transparent font-light text-xl leading-relaxed" />
            <div className="p-8 border-t border-gray-50 flex justify-end">
              <button onClick={saveJournal} disabled={isLoading || !journalText.trim()} className="px-10 py-3 bg-[#5F7A7B] text-white rounded-full text-sm font-medium">
                {isLoading ? "Holding this for you..." : "Secure Reflection"}
              </button>
            </div>
          </div>
          <div className="p-8 border-t border-gray-50 flex justify-end gap-3">
  <button
    onClick={analyzeJournals}
    disabled={analyzing || (!journalText.trim() && history.length === 0)}
    className="px-10 py-3 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium hover:bg-[#F9F9F7] disabled:opacity-50"
  >
    {analyzing ? 'Analyzing…' : 'Analyze'}
  </button>
  <button
    onClick={saveJournal}
    disabled={isLoading || !journalText.trim()}
    className="px-10 py-3 bg-[#5F7A7B] text-white rounded-full text-sm font-medium"
  >
    {isLoading ? 'Holding this for you...' : 'Secure Reflection'}
  </button>
</div>
                {(analysis || analysisError) && (
        <div className="px-10 pb-4">
          <div className="rounded-2xl border border-gray-100 bg-[#F9F9F7] p-4 text-xs text-gray-700">
            <div className="uppercase text-[10px] tracking-widest opacity-60 mb-2">Analysis</div>
            {!analysisError ? (
              <pre className="whitespace-pre-wrap break-words">
                {typeof analysis === 'string' ? analysis : JSON.stringify(analysis, null, 2)}
              </pre>
            ) : (
              <div className="text-red-500">{analysisError}</div>
            )}
          </div>
        </div>
      )}
        </motion.div>
      )}
    </AnimatePresence>
    
  );
}

// --- MAIN DASHBOARD ---
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState<any>(null);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  
useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);

      // Fetch the screening results
      const { data } = await supabase
        .from('result_q')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setResults(data);
    };
    getData();
  }, [router, supabase]);

  const getStatus = () => {
    if (!results) return "Analyzing profile...";
    const scores = [
      { l: "Depression Risk", v: results.phq9_score },
      { l: "Anxiety Risk", v: results.gad7_score },
      { l: "Executive Function", v: results.asrs_score }
    ];
    const top = scores.sort((a, b) => b.v - a.v)[0];
    return top.v > 50 ? top.l : "Baseline Stable";
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col relative">
      <nav className="fixed left-0 right-0 z-50 flex justify-center px-6 bottom-5 md:bottom-auto md:top-6">
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg rounded-full px-6 py-2 flex items-center justify-between w-full max-w-2xl gap-3">
          <div className="hidden sm:block">
            <Image src={congnifyLogo} alt="Logo" width={55} height={55} className="opacity-80" />
          </div>
          <div className="flex flex-1 justify-around md:justify-center items-center gap-1 md:gap-8">
            <NavItem label="Overview" active icon={<path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />} />
            
            {/* Task Link */}
            <button onClick={() => setIsTaskOpen(true)}>
              <NavItem label="Tasks" icon={<path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />} />
            </button>

            <button onClick={() => setIsJournalOpen(true)}>
              <NavItem label="Journal" icon={<path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />} />
            </button>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="p-1.5 text-gray-400 hover:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </nav>

      <main className="flex-1 p-6 md:p-12 mt-12 md:mt-24 max-w-7xl mx-auto w-full pb-32">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-light text-gray-800 tracking-tight">Welcome, {user?.email?.split('@')[0]}</h1>
            <p className="text-gray-400 font-light mt-1 text-sm italic">"Focus is the anchor of clarity."</p>
          </div>
          <div className="bg-white px-6 py-2 rounded-full border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Status</p>
            <p className="text-[#5F7A7B] font-medium text-sm">{getStatus()}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-50 shadow-sm h-72">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Cognitive Index</h3>
            <div className="flex items-end justify-between h-32 gap-3 px-4">
              {[40, 70, 45, 90, 65, 80, 50, 60, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-[#F8FAFA] rounded-full transition-all hover:bg-[#5F7A7B]" style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>

          <div className="bg-[#5F7A7B] p-10 rounded-[2.5rem] text-white flex flex-col justify-between shadow-lg">
            <p className="text-[10px] opacity-60 uppercase tracking-widest">Priority Task</p>
            <p className="text-xl font-light leading-snug">Complete your first Stroop assessment to baseline attention.</p>
            <button onClick={() => setIsTaskOpen(true)} className="mt-6 w-fit px-8 py-2.5 bg-white text-[#5F7A7B] rounded-full text-xs font-bold transition-all hover:shadow-xl active:scale-95">Start Now</button>
          </div>

          <MetricCard title="Streak" value="1" sub="Day 1 Started" />
          <MetricCard title="Journal" value="+" sub="Update Daily" onClick={() => setIsJournalOpen(true)} />
          <MetricCard 
            title="Severity" 
            value={results ? results.phq9_severity.charAt(0).toUpperCase() : "P"} 
            sub={results ? `${results.phq9_severity} risk` : "Awaiting Data"} 
          />
        </div>

        <section className="mt-5 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <h4 className="text-2xl font-light text-gray-800">Mindfulness & Tools</h4>
            <p className="text-sm text-gray-400 font-light mt-1">Access clinical audio guides and focus enhancers.</p>
          </div>
          <button className="p-5 bg-[#F9F9F7] rounded-full hover:bg-[#5F7A7B] group transition-all">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#5F7A7B] group-hover:text-white transition-colors" strokeWidth="1.5">
               <path d="M9 18l6-6-6-6"/>
             </svg>
          </button>
        </section>
      </main>

      <ChatAssistant />
      <TaskWindow isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)} />
      <JournalWindow isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} userId={user?.id} />
    </div>
  );
}


function NavItem({ label, icon, active = false }: { label: string, icon: React.ReactNode, active?: boolean }) {
  return (
    <div className={`flex flex-col md:flex-row items-center gap-1 md:gap-2.5 transition-all group px-2 py-1 ${active ? 'text-[#5F7A7B]' : 'text-gray-400 hover:text-[#5F7A7B]'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">{icon}</svg>
      <span className="text-[8px] md:text-[13px] font-medium tracking-wide uppercase">{label}</span>
    </div>
  );
}


function MetricCard({ title, value, sub, onClick }: { title: string, value: string, sub: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="bg-white p-10 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col items-center justify-center space-y-2 hover:bg-[#F8FAFA] transition-all cursor-pointer group">
      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{title}</p>
      <p className="text-5xl font-light text-gray-800 group-hover:text-[#5F7A7B] transition-colors">{value}</p>
      <p className="text-[10px] text-[#5F7A7B] font-bold uppercase tracking-widest">{sub}</p>
    </div>
  );
}
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
      <nav className="fixed left-0 right-0 z-50 flex justify-center px-6 bottom-5 md:top-6 h-fit">
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg rounded-full px-6 py-2 flex items-center w-full max-w-2xl justify-between">
          <Image src={congnifyLogo} alt="Logo" width={50} height={50} className="opacity-80" />
          <div className="flex gap-8">
            <button className="text-[#5F7A7B] text-[11px] font-bold uppercase tracking-widest">Overview</button>
            <button onClick={() => setIsTaskOpen(true)} className="text-gray-400 text-[11px] font-bold uppercase tracking-widest hover:text-[#5F7A7B]">Tasks</button>
            <button onClick={() => setIsJournalOpen(true)} className="text-gray-400 text-[11px] font-bold uppercase tracking-widest hover:text-[#5F7A7B]">Journal</button>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-gray-400 hover:text-red-400">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
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
      {/* Existing TaskWindow and JournalWindow components should be placed here */}
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
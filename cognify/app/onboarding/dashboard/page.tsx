"use client";

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import congnifyLogo from '../../../public/cognify_logo.png';

type ChatMessage = { role: 'user' | 'model'; content: string };

// --- CHAT ASSISTANT COMPONENT ---
function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const constraintsRef = useRef(null);
  const controls = useAnimation();
  const isDragging = useRef(false);

  // Chat state
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const apiBase = 'http://localhost:8000';

  const toggleChat = () => {
    if (!isDragging.current) setIsOpen(!isOpen);
  };



  const handleDragStart = () => { isDragging.current = false; };
  const handleDrag = () => {
    isDragging.current = true;
    if (isOpen) setIsOpen(false);
  };

  const handleDragEnd = (event: any, info: any) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const mouseX = info.point.x;
    const mouseY = info.point.y;

    const targetX = mouseX < width / 2 ? -(width - 80) : 0;
    const targetY = mouseY < height / 2 ? -(height - 100) : 0;

    controls.start({
      x: targetX,
      y: targetY,
      transition: { type: "spring", stiffness: 400, damping: 30 }
    });
  };

   const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setLoading(true);
    setInput('');

    try {
      const res = await fetch(`${apiBase}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          history, // [{role:'user'|'model', content:'...'}]
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('Chat API error:', json?.detail || json);
        // Optimistically append the user message so it’s visible, even on error
        setHistory((h) => [...h, { role: 'user', content: text }]);
        return;
      }

      // API returns { response, history: [...existing, user, model] }
      if (Array.isArray(json?.history)) {
        setHistory(json.history as ChatMessage[]);
      } else {
        // Fallback if only response is returned
        setHistory((h) => [
          ...h,
          { role: 'user', content: text },
          { role: 'model', content: String(json?.response ?? '') },
        ]);
      }
    } catch (e) {
      console.error('Chat request failed:', e);
      setHistory((h) => [...h, { role: 'user', content: text }]);
    } finally {
      setLoading(false);
      // Scroll to bottom after update
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[60]">
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        animate={controls}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9, cursor: 'grabbing' }}
        className="pointer-events-auto absolute bottom-6 right-6 cursor-grab active:cursor-grabbing"
      >
        <button
          onClick={toggleChat}
          className="p-4 bg-[#5F7A7B] text-white rounded-full shadow-2xl flex items-center justify-center relative group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: -20 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-full right-0 mb-4 w-[320px] h-[450px] bg-white shadow-2xl rounded-[2rem] border border-gray-100 flex flex-col overflow-hidden pointer-events-auto"
            >
              <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-[#F9F9F7]">
                <span className="text-sm font-medium text-gray-800">Assistant</span>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 p-2">&times;</button>
              </div>
              {/* Messages area: preserves existing container classes */}
              <div ref={scrollRef} className="flex-1 p-4 text-xs text-gray-400 italic overflow-y-auto">
                {history.length === 0 && !loading && (
                  <div>How can I help you today?</div>
                )}
                {history.length > 0 && (
                  <div className="space-y-2 not-italic text-gray-600">
                    {history.map((m, idx) => (
                      <div key={idx}>
                        <span className="uppercase text-[10px] tracking-widest text-gray-400">
                          {m.role === 'user' ? 'You' : 'Assistant'}
                        </span>
                        <div className="mt-0.5">{m.content}</div>
                      </div>
                    ))}
                  </div>
                )}
                {loading && <div className="mt-2 text-gray-400 italic">Assistant is typing…</div>}
              </div>

              <div className="p-4 border-t border-gray-50">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={loading}
                  className="w-full bg-[#F9F9F7] px-4 py-2 rounded-xl text-xs outline-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// --- JOURNAL COMPONENT ---
function JournalWindow({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId: string | undefined }) {
  const [journalText, setJournalText] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Crucial: Only fetch if we have a valid userId
    if (isOpen && userId) {
      fetchHistory();
    }
  }, [isOpen, userId]);

  const fetchHistory = async () => {
    if (!userId) return;
    
    // Updated Query: Filter by current user_id
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', userId) // Filter for specific user
      .order('created_at', { ascending: false });

    if (!error && data) setHistory(data);
  };

  const startNewEntry = () => setJournalText("");

  const saveJournal = async () => {
    if (!journalText.trim() || !userId) return;
    setIsLoading(true);
    
    const { error } = await supabase
      .from('journals')
      .insert([{ user_id: userId, content: journalText }]);

    if (!error) {
      setJournalText("");
      fetchHistory();
    }
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-4 z-[70] bg-white shadow-2xl rounded-[2rem] border border-gray-100 flex overflow-hidden"
        >
          {/* History Sidebar */}
          <div className="w-72 bg-[#F9F9F7] border-r border-gray-100 flex flex-col p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">History</h3>
              <button 
                onClick={startNewEntry}
                className="p-2 bg-[#5F7A7B] text-white rounded-lg hover:bg-[#4A6364] transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {history.length > 0 ? (
                history.map((entry) => (
                  <button key={entry.id} onClick={() => setJournalText(entry.content)} className="w-full text-left p-4 rounded-2xl bg-white border border-gray-50 hover:border-[#5F7A7B] transition-all">
                    <p className="text-[10px] text-[#5F7A7B] font-bold mb-1">{new Date(entry.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{entry.content}</p>
                  </button>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic text-center mt-10">No personal entries yet.</p>
              )}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col">
            <div className="p-8 flex justify-between items-center">
              <h2 className="text-2xl font-light text-gray-800 tracking-tight">Daily Reflection</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-2xl text-gray-400">&times;</button>
            </div>
            <textarea 
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 px-10 py-4 text-gray-700 outline-none resize-none bg-transparent font-light text-xl leading-relaxed"
            />
            <div className="p-8 border-t border-gray-50 flex justify-end">
              <button 
                onClick={saveJournal} 
                disabled={isLoading || !journalText.trim()} 
                className="px-10 py-3 bg-[#5F7A7B] text-white rounded-full text-sm font-medium hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isLoading ? "Holding this for you..." : "Secure Reflection"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- MAIN DASHBOARD ---
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isJournalOpen, setIsJournalOpen] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push('/auth/login');
      else setUser(data.user);
    };
    getUser();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col relative">
      <nav className="fixed left-0 right-0 z-50 flex justify-center px-6 bottom-5 md:bottom-auto md:top-6">
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg rounded-full px-6 py-2 flex items-center justify-between w-full max-w-2xl gap-3">
          <div className="hidden sm:block">
            <Image src={congnifyLogo} alt="Logo" width={55} height={55} className="opacity-80" />
          </div>
          <div className="flex flex-1 justify-around md:justify-center items-center gap-1 md:gap-8">
            <NavItem label="Overview" active icon={<path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />} />
            <NavItem label="Tasks" icon={<path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />} />
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

      <main className="flex-1 p-6 md:p-12 mt-8 md:mt-20 max-w-7xl mx-auto w-full overflow-y-auto pb-32">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-light text-gray-800 tracking-tight">Welcome, {user?.email?.split('@')[0]}</h1>
            <p className="text-gray-400 font-light mt-1 text-sm italic">"Focus is the anchor of clarity."</p>
          </div>
          <div className="bg-white/60 px-6 py-2 rounded-full border border-gray-100 shadow-sm">
            <p className="text-[#5F7A7B] font-medium text-sm">Profiling in progress</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-72 flex flex-col justify-between">
            <h3 className="text-sm font-medium text-gray-600">Cognitive Trends</h3>
            <div className="flex items-end justify-between h-32 px-4 gap-2">
              {[40, 70, 45, 90, 65, 80, 50, 60, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-[#F0F4F4] rounded-full transition-all hover:bg-[#5F7A7B]" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-tighter text-center">Weekly Index</p>
          </div>

          <div className="bg-[#5F7A7B] p-8 rounded-[2.5rem] shadow-sm text-white flex flex-col justify-between">
            <h3 className="text-sm opacity-80 uppercase tracking-widest">Next Step</h3>
            <p className="text-xl font-light leading-snug">Complete your first Stroop assessment to baseline attention.</p>
            <button className="mt-6 px-6 py-2 bg-white text-[#5F7A7B] rounded-full text-xs font-medium hover:shadow-lg transition-all active:scale-95">Start Now</button>
          </div>

          <MetricCard title="Daily Streak" value="1" sub="Day Started" />
          <div onClick={() => setIsJournalOpen(true)} className="cursor-pointer">
            <MetricCard title="Journaling" value="+" sub="Tap to write entry" />
          </div>
          <MetricCard title="Severity" value="P" sub="Pending Review" />
        </div>
      </main>

      <ChatAssistant />
      <JournalWindow 
        isOpen={isJournalOpen} 
        onClose={() => setIsJournalOpen(false)} 
        userId={user?.id} 
      />
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

function MetricCard({ title, value, sub }: { title: string, value: string, sub: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-2 hover:bg-[#F9F9F7] transition-colors group">
      <p className="text-xs text-gray-400 uppercase tracking-widest">{title}</p>
      <p className="text-5xl font-light text-gray-800 group-hover:text-[#5F7A7B] transition-colors">{value}</p>
      <p className="text-[10px] text-[#5F7A7B] uppercase tracking-tighter">{sub}</p>
    </div>
  );
}
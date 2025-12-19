"use client";

import { useEffect, useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import congnifyLogo from '../../../public/cognify_logo.png';

// --- TASK WINDOW COMPONENT ---
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

// --- CHAT ASSISTANT COMPONENT ---
function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [message, setMessage] = useState("");

  const toggleChat = () => setIsOpen(!isOpen);
  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  return (
    <>
      {/* FLOATING ICON */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 p-4 bg-[#5F7A7B] text-white rounded-full shadow-2xl hover:scale-110 transition-all z-[60] group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
          </svg>
        </button>
      )}

      {/* CHAT WINDOW */}
      {isOpen && (
        <div 
          className={`fixed transition-all duration-500 ease-in-out z-[60] bg-white shadow-2xl flex flex-col border border-gray-100
            ${isFullScreen 
              ? 'inset-4 rounded-[2rem]' 
              : 'bottom-6 right-6 w-[350px] h-[500px] rounded-[2rem]'
            }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-[#F9F9F7] rounded-t-[2rem]">
            <div>
              <h3 className="text-sm font-medium text-gray-800">Cognify AI</h3>
              <p className="text-[10px] text-[#5F7A7B] uppercase tracking-widest">Assistant</p>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleFullScreen} className="p-1.5 hover:bg-gray-200 rounded-md transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                </svg>
              </button>
              <button onClick={toggleChat} className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-400">&times;</button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="bg-[#F9F9F7] p-3 rounded-2xl rounded-tl-none max-w-[85%] text-xs text-gray-600 leading-relaxed">
              Hello! How can I assist with your cognitive tasks or journal analysis today?
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-50">
            <div className="flex items-center gap-2 bg-[#F9F9F7] px-4 py-2 rounded-2xl">
              <label className="cursor-pointer p-1 text-gray-400 hover:text-[#5F7A7B]">
                <input type="file" className="hidden" />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32a1.5 1.5 0 0 1-2.121-2.121l10.517-10.517" />
                </svg>
              </label>
              <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent border-none text-xs outline-none text-gray-700"
              />
              <button className="text-[#5F7A7B] disabled:opacity-30" disabled={!message}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- JOURNAL COMPONENT --- (Unchanged)
function JournalWindow({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId: string | undefined }) {
  const [journalText, setJournalText] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  useEffect(() => { if (isOpen && userId) fetchHistory(); }, [isOpen, userId]);

  const fetchHistory = async () => {
    if (!userId) return;
    const { data, error } = await supabase.from('journals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (!error && data) setHistory(data);
  };

  const saveJournal = async () => {
    if (!journalText.trim() || !userId) return;
    setIsLoading(true);
    const { error } = await supabase.from('journals').insert([{ user_id: userId, content: journalText }]);
    if (!error) { setJournalText(""); fetchHistory(); }
    setIsLoading(false);
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
  const [isTaskOpen, setIsTaskOpen] = useState(false); // New state

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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

  // Helper to get primary status string
  const getStatus = () => {
    if (!results) return "Profiling in progress";
    const scores = [
      { label: "Depression Risk", val: results.phq9_score },
      { label: "Neurodivergence", val: results.srs_score },
      { label: "Cognitive Risk", val: results.moca_score }
    ];
    const top = scores.sort((a, b) => b.val - a.val)[0];
    return top.val > 15 ? top.label : "Baseline Stable";
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

      <main className="flex-1 p-6 md:p-12 mt-8 md:mt-20 max-w-7xl mx-auto w-full overflow-y-auto pb-32">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-light text-gray-800 tracking-tight">Welcome, {user?.email?.split('@')[0]}</h1>
            <p className="text-gray-400 font-light mt-1 text-sm italic">"Focus is the anchor of clarity."</p>
          </div>
          <div className="bg-white/60 px-6 py-2 rounded-full border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none mb-1">Current Status</p>
            <p className="text-[#5F7A7B] font-medium text-sm">{getStatus()}</p>
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
            <button onClick={() => setIsTaskOpen(true)} className="mt-6 px-6 py-2 bg-white text-[#5F7A7B] rounded-full text-xs font-medium hover:shadow-lg transition-all active:scale-95">Start Now</button>
          </div>

          <MetricCard title="Daily Streak" value="1" sub="Day Started" />
          <div onClick={() => setIsJournalOpen(true)} className="cursor-pointer">
            <MetricCard title="Journaling" value="+" sub="Tap to write entry" />
          </div>
          <MetricCard 
            title="Severity" 
            value={results ? results.phq9_severity.charAt(0).toUpperCase() : "P"} 
            sub={results ? `${results.phq9_severity} Risk Detected` : "Pending Review"} 
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

function MetricCard({ title, value, sub }: { title: string, value: string, sub: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-2 hover:bg-[#F9F9F7] transition-colors group">
      <p className="text-xs text-gray-400 uppercase tracking-widest">{title}</p>
      <p className="text-5xl font-light text-gray-800 group-hover:text-[#5F7A7B] transition-colors">{value}</p>
      <p className="text-[10px] text-[#5F7A7B] uppercase tracking-tighter">{sub}</p>
    </div>
  );
}
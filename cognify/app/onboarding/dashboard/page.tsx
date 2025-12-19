"use client";

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import congnifyLogo from '../../../public/cognify_logo.png';

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

// --- MAIN DASHBOARD ---
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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
      
      {/* 0.8x SCALED ADAPTIVE FLOATING NAV BAR */}
      <nav className="fixed left-0 right-0 z-50 flex justify-center px-6 
                      bottom-5 md:bottom-auto md:top-6 animate-in slide-in-from-bottom md:slide-in-from-top duration-700">
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg 
                        rounded-full px-6 py-2 flex items-center justify-between 
                        w-full max-w-2xl gap-3 md:gap-10 transition-all duration-500">
          
          <div className="hidden sm:block">
            <Image src={congnifyLogo} alt="Logo" width={55} height={55} className="opacity-80" />
          </div>

          <div className="flex flex-1 justify-around md:justify-center items-center gap-1 md:gap-8">
            <NavItem label="Overview" active icon={<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />} />
            <NavItem label="Tasks" icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />} />
            <NavItem label="Journal" icon={<path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />} />
          </div>

          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push('/'))}
            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 mt-8 md:mt-20 max-w-7xl mx-auto w-full overflow-y-auto pb-32 md:pb-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-light text-gray-800 tracking-tight">Welcome, {user?.email?.split('@')[0]}</h1>
            <p className="text-gray-400 font-light mt-1 text-sm italic">"Focus is the anchor of clarity."</p>
          </div>
          <div className="bg-white/60 px-6 py-2 rounded-full border border-gray-100">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-none mb-1">Current Status</p>
            <p className="text-[#5F7A7B] font-medium text-sm">Profiling in progress</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 ">
          <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm h-72 flex flex-col justify-between">
            <h3 className="text-sm font-medium text-gray-600">Cognitive Trends</h3>
            <div className="flex items-end justify-between h-32 px-4 gap-2">
              {[40, 70, 45, 90, 65, 80, 50, 60, 85].map((h, i) => (
                <div key={i} className="flex-1 bg-[#F0F4F4] rounded-full transition-all hover:bg-[#5F7A7B]" style={{ height: `${h}%` }}></div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-tighter text-center">Weekly Cognitive Performance Index</p>
          </div>

          <div className="bg-[#5F7A7B] p-8 rounded-[2.5rem] shadow-sm text-white flex flex-col justify-between">
            <h3 className="text-sm opacity-80 uppercase tracking-widest">Next Step</h3>
            <div>
              <p className="text-xl font-light leading-snug">Complete your first Stroop assessment to baseline attention.</p>
              <button className="mt-6 px-6 py-2 bg-white text-[#5F7A7B] rounded-full text-xs font-medium hover:shadow-lg transition-all active:scale-95">
                Start Now
              </button>
            </div>
          </div>

          <MetricCard title="Daily Streak" value="1" sub="Day Started" />
          <MetricCard title="Journaling" value="0" sub="No entries today" />
           
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-2">
             <p className="text-xs text-gray-400 uppercase tracking-widest">Severity</p>
             <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className="w-1/3 h-full bg-[#5F7A7B] rounded-full"></div>
             </div>
             <p className="text-[10px] text-gray-400 uppercase mt-2">Evaluation Pending</p>
          </div>
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

      {/* FLOATING CHAT ASSISTANT */}
      <ChatAssistant />
    </div>
  );
}

function NavItem({ label, icon, active = false }: { label: string, icon: React.ReactNode, active?: boolean }) {
  return (
    <button className={`flex flex-col md:flex-row items-center gap-1 md:gap-2.5 transition-all group px-2 py-1
      ${active ? 'text-[#5F7A7B]' : 'text-gray-400 hover:text-[#5F7A7B]'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        {icon}
      </svg>
      <span className="text-[8px] md:text-[13px] font-medium tracking-wide uppercase md:capitalize">{label}</span>
    </button>
  );
}

function MetricCard({ title, value, sub }: { title: string, value: string, sub: string }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-2">
      <p className="text-xs text-gray-400 uppercase tracking-widest">{title}</p>
      <p className="text-5xl font-light text-gray-800">{value}</p>
      <p className="text-[10px] text-[#5F7A7B] uppercase tracking-tighter">{sub}</p>
    </div>
  );
}
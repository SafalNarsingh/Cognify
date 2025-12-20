"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA STRUCTURE ---
const MINDFULNESS_DATA = [
  {
    id: "intro",
    title: "Introduction to Meditation",
    description: "The foundations of mindful practice.",
    topics: ["Welcome", "What is mindfulness", "What is meditation", "Is it for me?", "Setup"]
  },
  {
    id: "beginner",
    title: "Beginner Meditation Course",
    description: "Start your journey into presence.",
    topics: ["Your first session", "Mindfulness", "Vipassana", "Non-judgment", "Mindful Living", "Science of meditation", "The present moment", "Negative emotions", "Sounds"]
  },
  {
    id: "intermediate",
    title: "Intermediate Meditation Course",
    description: "Deepen your understanding of self.",
    topics: ["Introduction", "Spontaneity of thoughts", "The self", "Consciousness", "Anxiety", "Minimal living", "Ego Dissolution", "Stress", "Open Awareness", "Free will"]
  },
  {
    id: "stress",
    title: "Meditation for Stress & Anxiety",
    description: "Tools for finding peace in chaos.",
    topics: ["Meditation for stress & anxiety", "Managing anxiety", "Managing stress", "Labelling thoughts & feelings", "Finding peace in the present moment", "Recognising unhelpful thoughts", "Dealing with stressful situations", "Labelling physical sensations", "Understanding anxiety", "Negative emotions"]
  },
  {
    id: "sleep",
    title: "Meditation for Sleep",
    description: "Restorative guides for rest.",
    topics: ["Gradual muscle relaxation", "Mindful breathing", "Visualisation", "Body Scan", "Mantra for Sleep"]
  },
  {
    id: "work",
    title: "Work Life Meditation Pack",
    description: "Focus and productivity at work.",
    topics: ["Managing Conflict", "Managing Stress", "Productivity", "Confidence", "Creativity", "Focus", "Work-life balance", "Motivation", "Dealing with change", "Prioritization"]
  },
  {
    id: "walking",
    title: "Walking Meditation",
    description: "Mindfulness in motion.",
    topics: ["Walking Inside", "Walking Outside"]
  },
  {
    id: "thinkers",
    title: "Meditating with Great Thinkers",
    description: "Wisdom from history's minds.",
    topics: ["William James", "Rene Descartes", "William Shakespeare", "Alan Watts", "William Blake"]
  },
  {
    id: "bodyscan",
    title: "Body Scan Meditation",
    description: "Connect with physical sensations.",
    topics: ["Your first body scan", "Positions", "Sensations", "Body scan meditation by UCLA", "Simple body scan 1", "Simple body scan 2", "Simple body scan 3", "Body scan for sleep"]
  },
  {
    id: "mantra",
    title: "Mantra Meditation",
    description: "Channeling focus through sound.",
    topics: ["Your first mantra", "Choose your own mantra", "Simple mantra 1", "Simple mantra 2", "Mantra for Sleep"]
  },
  {
    id: "lovingkindness",
    title: "Loving Kindness Meditation",
    description: "Developing compassion for all.",
    topics: ["Self compassion", "Compassion for others", "Compassion for all", "Loving kindness by UCLA", "Loving Kindness by Giovanni Dienstmann"]
  }
];

export function MindfulnessWindow({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [view, setView] = useState<'list' | 'topics' | 'player'>('list');
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const resetAndClose = () => {
    onClose();
    setTimeout(() => { setView('list'); setSelectedPack(null); }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <div>
                <button 
                  onClick={() => view === 'player' ? setView('topics') : view === 'topics' ? setView('list') : null}
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 transition-all ${view === 'list' ? 'text-gray-300' : 'text-[#5F7A7B] hover:opacity-70'}`}
                >
                  {view === 'list' ? 'Mindfulness & Tools' : '← Back'}
                </button>
                <h3 className="text-2xl font-light text-gray-800 tracking-tight">
                  {view === 'list' ? 'Clinical Audio Library' : selectedPack?.title}
                </h3>
              </div>
              <button onClick={resetAndClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">&times;</button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
              {view === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MINDFULNESS_DATA.map((pack) => (
                    <button 
                      key={pack.id}
                      onClick={() => { setSelectedPack(pack); setView('topics'); }}
                      className="p-6 text-left bg-[#F9F9F7] hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 rounded-3xl transition-all group"
                    >
                      <h4 className="font-medium text-gray-800 group-hover:text-[#5F7A7B]">{pack.title}</h4>
                      <p className="text-xs text-gray-400 font-light mt-1">{pack.description}</p>
                    </button>
                  ))}
                </div>
              )}

              {view === 'topics' && (
                <div className="space-y-2">
                  {selectedPack?.topics.map((topic: string) => (
                    <button 
                      key={topic}
                      onClick={() => { setSelectedTopic(topic); setView('player'); }}
                      className="w-full p-5 text-left border-b border-gray-50 hover:bg-[#F9F9F7] transition-all flex justify-between items-center group"
                    >
                      <span className="text-sm font-light text-gray-600 group-hover:text-gray-900">{topic}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-300 group-hover:text-[#5F7A7B]"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                  ))}
                </div>
              )}

              {view === 'player' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="w-48 h-48 bg-[#F9F9F7] rounded-[2rem] flex items-center justify-center shadow-inner">
                    <div className="w-24 h-24 bg-[#5F7A7B]/10 rounded-full flex items-center justify-center animate-pulse">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5F7A7B" strokeWidth="1" className="opacity-50">
                            <path d="M12 1v22M17 5v14M7 5v14M2 9v6M22 9v6"/>
                        </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium text-gray-800">{selectedTopic}</h4>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mt-2">{selectedPack?.title}</p>
                  </div>
                  
                  {/* Spotify-style Controls */}
                  <div className="flex items-center gap-10">
                    <button className="text-gray-300 hover:text-gray-600 transition-colors"><svg width="24" height="24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6L18 18V6z"/></svg></button>
                    <button className="w-16 h-16 bg-[#5F7A7B] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                      <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                    <button className="text-gray-300 hover:text-gray-600 transition-colors"><svg width="24" height="24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
                  </div>

                  <div className="w-full max-w-xs bg-gray-100 h-1 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "40%" }} className="bg-[#5F7A7B] h-full" />
                  </div>
                  <div className="flex justify-between w-full max-w-xs text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>02:45</span>
                    <span>10:00</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
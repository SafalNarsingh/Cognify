"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

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

interface MindfulnessProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: (trackName: string, packName: string) => void;
  audioState?: {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    activeTrack: string | null;
  };
  onTogglePlay?: () => void;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

export function MindfulnessWindow({ 
  isOpen, 
  onClose, 
  onPlay, 
  audioState,
  onTogglePlay,
  audioRef
}: MindfulnessProps) {
  const [view, setView] = useState<'list' | 'topics' | 'player'>('list');
  const [selectedPack, setSelectedPack] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
   const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMeditationComplete = async (minutes: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

  // Normalize: 20 mins = 100%
  const normalizedMed = Math.min(100, (minutes / 20) * 100);
  
  // Save raw log for history
  await supabase.from('meditation_logs').insert({ 
    user_id: user.id, 
    duration_minutes: minutes,
    session_type: 'Breathing' 
  });

  // Update daily progress summary
  await updateDailyProgress('meditation', normalizedMed);
};

/**
 * Helper to update the holistic progress entry without overwriting existing data.
 * @param type - 'cognitive' or 'meditation'
 * @param score - The normalized 0-100 score
 */
const updateDailyProgress = async (type: 'cognitive' | 'meditation', score: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch existing entry for today
  const { data: existingEntry } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single();

  // 2. Prepare merged values
  // If entry exists, use existing values; otherwise start at 0
  let cognitive = existingEntry?.cognitive_score || 0;
  let meditation = existingEntry?.meditation_score || 0;

  if (type === 'cognitive') cognitive = score;
  if (type === 'meditation') meditation = score;

  // 3. Calculate Weighted Improvement Index
  // Logic: 60% Cognitive + 40% Meditation
  const improvementIndex = (cognitive * 0.6) + (meditation * 0.4);

  // 4. Upsert the merged record
  const { error } = await supabase
    .from('progress_entries')
    .upsert({
      user_id: user.id,
      date: today,
      cognitive_score: cognitive,
      meditation_score: meditation,
      improvement_index: Math.round(improvementIndex),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, date' });

  if (error) console.error("Error updating daily index:", error.message);
};
  const resetAndClose = () => {
    onClose();
    setTimeout(() => { 
      setView('list'); 
      setSelectedPack(null); 
      setSelectedTopic(null);
    }, 300);
  };

  const handleSeek = (newTime: number) => {
    if (audioRef?.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleForward = () => {
    if (audioRef?.current) {
      audioRef.current.currentTime += 10;
    }
  };

  const handleBackward = () => {
    if (audioRef?.current) {
      audioRef.current.currentTime -= 10;
    }
  };

  // Logic to determine if the track in the player view is the one currently playing
  const isCurrentTrackActive = audioState?.activeTrack === selectedTopic;
  const progressPercent = audioState?.duration 
    ? (audioState.currentTime / audioState.duration) * 100 
    : 0;

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
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 transition-all ${view === 'list' ? 'text-gray-300 pointer-events-none' : 'text-[#5F7A7B] hover:opacity-70'}`}
                >
                  {view === 'list' ? 'Mindfulness & Tools' : '← Back'}
                </button>
                <h3 className="text-2xl font-light text-gray-800 tracking-tight">
                  {view === 'list' ? 'Clinical Audio Library' : selectedPack?.title}
                </h3>
              </div>
              <button onClick={resetAndClose} className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400 text-2xl">&times;</button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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
                      className="w-full p-5 text-left border-b border-gray-50 hover:bg-[#F9F9F7] transition-all flex justify-between items-center group rounded-xl"
                    >
                      <span className="text-sm font-light text-gray-600 group-hover:text-gray-900">{topic}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-gray-300 group-hover:text-[#5F7A7B]"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                  ))}
                </div>
              )}

              {view === 'player' && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="w-48 h-48 bg-[#F9F9F7] rounded-[3rem] flex items-center justify-center shadow-inner relative overflow-hidden">
                    <div className={`w-24 h-24 bg-[#5F7A7B]/10 rounded-full flex items-center justify-center ${audioState?.isPlaying && isCurrentTrackActive ? 'animate-pulse' : ''}`}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5F7A7B" strokeWidth="1" className="opacity-50">
                            <path d="M12 1v22M17 5v14M7 5v14M2 9v6M22 9v6"/>
                        </svg>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-2xl font-light text-gray-800 tracking-tight">{selectedTopic}</h4>
                    <p className="text-xs text-[#5F7A7B] font-bold uppercase tracking-[0.2em] mt-3">{selectedPack?.title}</p>
                  </div>
                  
                  <div className="flex flex-col items-center w-full max-w-sm gap-8">
                    <div className="flex items-center gap-10">
                      <button 
                        onClick={handleBackward}
                        className="text-gray-300 hover:text-gray-600 transition-colors">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                          <text x="12" y="15.5" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none" fontWeight="bold">10</text>
                        </svg>
                      </button>
                      
                      <button 
                        onClick={() => {
                          if (isCurrentTrackActive && onTogglePlay) {
                            onTogglePlay();
                          } else {
                            onPlay(selectedTopic!, selectedPack!.title);
                          }
                        }}
                        className="w-20 h-20 bg-[#5F7A7B] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                      >
                        {audioState?.isPlaying && isCurrentTrackActive ? (
                          <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                        ) : (
                          <svg width="36" height="36" fill="currentColor" viewBox="0 0 24 24" className="ml-1"><path d="M8 5v14l11-7z"/></svg>
                        )}
                      </button>
                      
                      <button 
                        onClick={handleForward}
                        className="text-gray-300 hover:text-gray-600 transition-colors">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                          <path d="M21 3v5h-5" />
                          <text x="12" y="15.5" fontSize="7" textAnchor="middle" fill="currentColor" stroke="none" fontWeight="bold">10</text>
                        </svg>
                      </button>
                    </div>

                    <div className="w-full space-y-2">
                      <input 
                        type="range"
                        min="0"
                        max={audioState?.duration || 0}
                        value={audioState?.currentTime || 0}
                        onChange={(e) => handleSeek(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#5F7A7B]"
                      />
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <span>{isCurrentTrackActive ? formatTime(audioState?.currentTime || 0) : "00:00"}</span>
                        <span>{isCurrentTrackActive ? formatTime(audioState?.duration || 0) : "--:--"}</span>
                      </div>
                    </div>
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
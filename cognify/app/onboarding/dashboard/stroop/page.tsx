"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// --- TYPES ---
type BlockType = 'neutral' | 'emotional';
type ColorKey = 'red' | 'green' | 'blue' | 'purple';

type Trial = {
  block: BlockType;
  word: string;
  inkColor: ColorKey;
};

export type StroopTrialRecord = {
  timestampISO: string;
  block: BlockType;
  trialIndex: number;
  word: string;
  inkColor: ColorKey;
  selectedColor: ColorKey | null;
  correct: boolean;
  rtMs: number | null;
};

// --- CONFIGURATION ---
const COLORS: { key: ColorKey; label: string; textClass: string }[] = [
  { key: 'red',    label: 'R', textClass: 'text-red-600' },
  { key: 'green',  label: 'G', textClass: 'text-green-600' },
  { key: 'blue',   label: 'B', textClass: 'text-blue-600' },
  { key: 'purple', label: 'P', textClass: 'text-purple-600' },
];

const NEUTRAL_WORDS = ['Table', 'Path', 'Chair', 'Street', 'Window', 'Paper', 'Garden', 'Bottle'];
const EMOTIONAL_WORDS = ['Death', 'Kill', 'Shame', 'Murder', 'Fear', 'Trauma', 'Pain', 'Grief'];

// --- UTILITIES ---
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function randomColor(): ColorKey {
  return COLORS[Math.floor(Math.random() * COLORS.length)].key;
}

export default function EmotionalStroopPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'intro' | 'test' | 'summary'>('intro');
  const [trialIndex, setTrialIndex] = useState(0);
  const [records, setRecords] = useState<StroopTrialRecord[]>([]);
  const [current, setCurrent] = useState<Trial | null>(null);
  const [startTs, setStartTs] = useState<number | null>(null);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [iti, setIti] = useState(false);
  const [posted, setPosted] = useState(false);

  const totalTrials = 8;

  const randomizedTrials = useMemo(() => {
    const n = shuffle(NEUTRAL_WORDS).slice(0, 4).map(w => ({ block: 'neutral' as BlockType, word: w, inkColor: randomColor() }));
    const e = shuffle(EMOTIONAL_WORDS).slice(0, 4).map(w => ({ block: 'emotional' as BlockType, word: w, inkColor: randomColor() }));
    return shuffle([...n, ...e]);
  }, []);

  const handleBackToDashboard = () => {
    router.push('/onboarding/dashboard?open=tasks');
  };

  // --- TASK LOGIC ---
  const startTask = () => {
    setPhase('test');
    setTrialIndex(0);
    setRecords([]);
    scheduleNextTrial(0);
  };

  const scheduleNextTrial = (idx: number) => {
    setIti(true);
    setAwaitingResponse(false);
    setCurrent(null);
    setTimeout(() => {
      setCurrent(randomizedTrials[idx]);
      setIti(false);
      setAwaitingResponse(true);
      setStartTs(performance.now());
    }, 600);
  };

  const handleResponse = useCallback((selected: ColorKey) => {
    if (!awaitingResponse || !current) return;
    const rt = startTs ? performance.now() - startTs : 0;
    
    const rec: StroopTrialRecord = {
      timestampISO: new Date().toISOString(),
      block: current.block,
      trialIndex,
      word: current.word,
      inkColor: current.inkColor,
      selectedColor: selected,
      correct: selected === current.inkColor,
      rtMs: rt,
    };

    setRecords(prev => [...prev, rec]);
    setAwaitingResponse(false);

    if (trialIndex + 1 < totalTrials) {
      setTrialIndex(prev => prev + 1);
      scheduleNextTrial(trialIndex + 1);
    } else {
      setPhase('summary');
    }
  }, [awaitingResponse, current, trialIndex, startTs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const map: Record<string, ColorKey> = { r: 'red', g: 'green', b: 'blue', p: 'purple' };
      if (map[k]) handleResponse(map[k]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleResponse]);

  // --- METRICS ---
  const getStats = (type: BlockType) => {
    const group = records.filter(r => r.block === type);
    const correctCount = group.filter(r => r.correct).length;
    const avgRT = group.length > 0 
      ? group.reduce((acc, r) => acc + (r.rtMs || 0), 0) / group.length 
      : 0;
    
    return {
      accuracy: group.length > 0 ? Math.round((correctCount / group.length) * 100) : 0,
      correctCount,
      avgRT: Math.round(avgRT)
    };
  };

  const neutralStats = getStats('neutral');
  const emotionalStats = getStats('emotional');
  const interference = emotionalStats.avgRT - neutralStats.avgRT;

  // --- API SYNC ---
  useEffect(() => {
    if (phase === 'summary' && !posted) {
      const postSummary = async () => {
        try {
          await fetch('/api/task/stroop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              summary: {
                rtNeutralMs: neutralStats.avgRT,
                rtEmotionalMs: emotionalStats.avgRT,
                accuracyNeutralPct: neutralStats.accuracy,
                accuracyEmotionalPct: emotionalStats.accuracy,
                interferenceMs: interference,
              },
            }),
          });
          setPosted(true);
        } catch (e) {
          console.warn('Stroop save error:', e);
        }
      };
      postSummary();
    }
  }, [phase, posted, neutralStats, emotionalStats, interference]);

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center space-y-8 bg-white p-12 rounded-[3rem] shadow-sm border border-gray-50"
          >
            <div>
              <h2 className="text-3xl font-light text-gray-800">Emotional Stroop</h2>
              <p className="text-[10px] text-[#5F7A7B] font-bold uppercase tracking-[0.2em]">Inhibitory Control & Emotional Regulation</p>
            </div>

            <div className="max-w-md mx-auto space-y-4 text-left border-y border-gray-50 py-6">
              <p className="text-sm text-gray-500 font-light leading-relaxed">
                Identify the <b>ink color</b> of the word shown. Ignore the meaning of the word itself.
              </p>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold text-gray-400">
                <div className="p-2 border border-gray-100 rounded-lg">KEY [R]<br/><span className="text-red-600">RED</span></div>
                <div className="p-2 border border-gray-100 rounded-lg">KEY [G]<br/><span className="text-green-600">GREEN</span></div>
                <div className="p-2 border border-gray-100 rounded-lg">KEY [B]<br/><span className="text-blue-600">BLUE</span></div>
                <div className="p-2 border border-gray-100 rounded-lg">KEY [P]<br/><span className="text-purple-600">PURPLE</span></div>
              </div>
            </div>

            <div className="pt-4 flex flex-col items-center gap-4">
              <button 
                onClick={startTask}
                className="px-12 py-4 bg-[#5F7A7B] text-white rounded-full text-sm font-bold hover:shadow-xl transition-all"
              >
                Begin Randomized Assessment
              </button>
              <button onClick={handleBackToDashboard} className="text-[10px] text-gray-400 uppercase tracking-widest hover:text-[#5F7A7B]">
                Return to Dashboard
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'test' && (
          <motion.div 
            key="test"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12 text-center"
          >
            <div className="flex justify-between items-center mb-12">
              <button onClick={handleBackToDashboard} className="text-[#5F7A7B] text-xs font-bold uppercase flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Exit
              </button>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Trial {trialIndex + 1} / {totalTrials}</div>
            </div>

            <div className="h-64 flex items-center justify-center bg-white rounded-[3rem] shadow-sm border border-gray-50">
              <AnimatePresence mode="wait">
                {iti ? (
                  <motion.div key="iti" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="text-6xl text-gray-200">+</motion.div>
                ) : current && (
                  <motion.div 
                    key={current.word}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-7xl md:text-8xl font-light tracking-tight ${COLORS.find((c) => c.key === current.inkColor)?.textClass}`}
                  >
                    {current.word}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Identify Ink Color: [R] [G] [B] [P]</p>
          </motion.div>
        )}

        {phase === 'summary' && (
          <motion.div 
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-10"
          >
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Interference Score</p>
              <h3 className="text-7xl font-light text-[#5F7A7B]">{interference}ms</h3>
              <p className="text-[10px] text-gray-400 mt-4 max-w-xs mx-auto leading-relaxed">A higher score suggests increased emotional sensitivity affecting focus.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <ResultCard label="Neutral RT" value={`${neutralStats.avgRT}ms`} sub={`${neutralStats.accuracy}% Acc`} />
              <ResultCard label="Emotional RT" value={`${emotionalStats.avgRT}ms`} sub={`${emotionalStats.accuracy}% Acc`} />
            </div>

            <div className="flex flex-col items-center gap-4 pt-6">
              <button 
                onClick={() => { setPhase('intro'); setTrialIndex(0); setRecords([]); setPosted(false); }}
                className="px-12 py-3 bg-[#5F7A7B] text-white rounded-full text-xs font-bold"
              >
                Retake Assessment
              </button>
              <button onClick={handleBackToDashboard} className="text-xs text-gray-400 hover:text-[#5F7A7B]">
                Finish & Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultCard({ label, value, sub }: { label: string, value: string | number, sub: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm">
      <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">{label}</p>
      <p className="text-2xl text-gray-800">{value}</p>
      <p className="text-[9px] text-[#5F7A7B] font-bold mt-1 uppercase tracking-tighter">{sub}</p>
    </div>
  );
}
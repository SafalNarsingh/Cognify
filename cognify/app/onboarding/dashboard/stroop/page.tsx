'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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

const COLORS: { key: ColorKey; label: string; textClass: string }[] = [
  { key: 'red',    label: 'R', textClass: 'text-red-600' },
  { key: 'green',  label: 'G', textClass: 'text-green-600' },
  { key: 'blue',   label: 'B', textClass: 'text-blue-600' },
  { key: 'purple', label: 'P', textClass: 'text-purple-600' },
];

const NEUTRAL_WORDS = ['Table', 'Path', 'Chair', 'Street', 'Window', 'Paper', 'Garden', 'Bottle'];
const EMOTIONAL_WORDS = ['Death', 'Kill', 'Shame', 'Murder', 'Fear', 'Trauma', 'Pain', 'Grief'];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function randomColor(): ColorKey {
  return COLORS[Math.floor(Math.random() * COLORS.length)].key;
}

export default function EmotionalStroopPage() {
  const [phase, setPhase] = useState<'intro' | 'test' | 'summary'>('intro');
  const [trialIndex, setTrialIndex] = useState(0);
  const [records, setRecords] = useState<StroopTrialRecord[]>([]);
  const [current, setCurrent] = useState<Trial | null>(null);
  const [startTs, setStartTs] = useState<number | null>(null);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [iti, setIti] = useState(false);
  const wordRef = useRef<HTMLDivElement | null>(null);

  // Interleave 4 Neutral and 4 Emotional trials randomly
  const randomizedTrials = useMemo(() => {
    const n = shuffle(NEUTRAL_WORDS).slice(0, 4).map(w => ({ block: 'neutral' as BlockType, word: w, inkColor: randomColor() }));
    const e = shuffle(EMOTIONAL_WORDS).slice(0, 4).map(w => ({ block: 'emotional' as BlockType, word: w, inkColor: randomColor() }));
    return shuffle([...n, ...e]);
  }, []);

  const totalTrials = 8;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!awaitingResponse) return;
      const k = e.key.toLowerCase();
      const map: Record<string, ColorKey> = { r: 'red', g: 'green', b: 'blue', p: 'purple' };
      if (map[k]) handleResponse(map[k]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [awaitingResponse, startTs, current]);

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

  const handleResponse = (selected: ColorKey) => {
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
  };

  // Metrics Logic
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

  // Auto-post summary to API when reaching summary (no UI changes)
  const [posted, setPosted] = useState(false);
  useEffect(() => {
    const postSummary = async () => {
      try {
        const payload = {
          summary: {
            rtNeutralMs: neutralStats.avgRT,
            rtEmotionalMs: emotionalStats.avgRT,
            accuracyNeutralPct: neutralStats.accuracy,
            accuracyEmotionalPct: emotionalStats.accuracy,
            interferenceMs: interference,
          },
        };
        const res = await fetch('/api/task/stroop', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        // Fail silently to avoid design changes
        if (!res.ok) {
          // Optionally log to console for debugging
          const err = await res.text();
          console.warn('Stroop save failed:', err);
        }
      } catch (e) {
        console.warn('Stroop save error:', e);
      } finally {
        setPosted(true);
      }
    };

    if (phase === 'summary' && !posted) {
      postSummary();
    }
  }, [phase, posted, neutralStats.avgRT, emotionalStats.avgRT, neutralStats.accuracy, emotionalStats.accuracy, interference]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9F7] via-[#FEFEFE] to-[#F5F5F3] flex flex-col">
      <nav className="fixed top-6 left-6 z-50">
        <Link href="/onboarding/dashboard" className="flex items-center gap-2 bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg rounded-full px-4 py-2 text-gray-700 hover:text-[#5F7A7B] transition-colors">
          <span className="text-xs font-medium">Back</span>
        </Link>
      </nav>

      <main className="flex-1 p-6 md:p-12 mt-16 md:mt-24 max-w-5xl mx-auto w-full pb-24">
        <header className="mb-8">
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">Emotional Stroop Task</h1>
            <p className="text-gray-500 italic mb-4">“Focus is the anchor of clarity.”</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Focus on the ink color, ignoring the word meaning.</li>
              <li>• Use ONLY your keyboard: <strong>R, G, B, P</strong>.</li>
            </ul>
          </div>
        </header>

        <section className="mt-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12 flex flex-col items-center justify-center min-h-[55vh]">
          <div className="w-full flex items-center justify-between mb-6">
            <div className="text-xs uppercase tracking-widest text-gray-400">
              {phase === 'intro' ? 'Ready' : phase === 'test' ? 'Randomized Phase' : 'Summary'}
            </div>
            <div className="text-xs text-[#5F7A7B] font-bold uppercase tracking-widest">
              {phase === 'test' ? `Trial ${trialIndex + 1} / ${totalTrials}` : ''}
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col items-center justify-center">
            {phase === 'intro' && (
              <button onClick={startTask} className="px-8 py-3 rounded-full bg-gradient-to-br from-[#5F7A7B] to-[#4D6364] text-white shadow hover:scale-[1.02] transition-transform">
                Start Randomized Assessment
              </button>
            )}

            {phase === 'test' && (
              <div className="flex flex-col items-center gap-8 w-full">
                <AnimatePresence mode="wait">
                  {iti ? (
                    <motion.div key="iti" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="text-5xl text-gray-300">+</motion.div>
                  ) : current && (
                    <motion.div key={current.word} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-6xl md:text-7xl font-light ${COLORS.find((c) => c.key === current.inkColor)?.textClass}`}>
                      {current.word}
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="text-sm font-medium text-gray-300 mt-10">Press R, G, B, or P</p>
              </div>
            )}

            {phase === 'summary' && (
              <div className="w-full space-y-8">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Neutral Stats */}
                  <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-3">Neutral Words</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-gray-500">Correct Responses</span>
                        <span className="text-xl font-light">{neutralStats.correctCount} / 4</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-gray-500">Accuracy</span>
                        <span className="text-xl font-light">{neutralStats.accuracy}%</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-gray-500">Avg RT</span>
                        <span className="text-xl font-light">{neutralStats.avgRT}ms</span>
                      </div>
                    </div>
                  </div>

                  {/* Emotional Stats */}
                  <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                    <p className="text-[10px] text-red-400 uppercase tracking-widest mb-3">Emotional Words</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-gray-500">Correct Responses</span>
                        <span className="text-xl font-light">{emotionalStats.correctCount} / 4</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-gray-500">Accuracy</span>
                        <span className="text-xl font-light">{emotionalStats.accuracy}%</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-gray-500">Avg RT</span>
                        <span className="text-xl font-light">{emotionalStats.avgRT}ms</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-dashed border-gray-100 p-8 rounded-[2rem] text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Interference Score</p>
                  <p className="text-5xl font-light text-gray-900 mb-4">{interference}ms</p>
                  <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                    A positive score indicates that processing emotional words (like "Trauma") took longer than neutral words, suggesting emotional interference in cognitive control.
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <button onClick={() => { setPhase('intro'); setTrialIndex(0); setRecords([]); setCurrent(null); setPosted(false); }} className="px-8 py-3 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Restart</button>
                  <Link href="/onboarding/dashboard" className="px-8 py-3 rounded-full bg-[#5F7A7B] text-white">Continue</Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
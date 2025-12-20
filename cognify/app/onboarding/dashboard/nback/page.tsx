"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// --- TYPES ---
interface Trial {
  letter: string;
  index: number;
  nValue: number;
  isTarget: boolean;
  userResponded: boolean;
  isCorrect: boolean | null;
  reactionTime: number | null;
  timestamp: number;
}

type GameState = 'intro' | 'playing' | 'results';

// --- CONFIGURATION ---
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LETTER_DISPLAY_MS = 1500;
const BLANK_GAP_MS = 500;
const TOTAL_TRIALS = 30;
const REMEMBER_DISPLAY_MS = 1200;
const REMEMBER_COUNT = 5;

// --- UTILITIES ---
function getRandomLetter(exclude?: string): string {
  let letter: string;
  do {
    letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  } while (exclude && letter === exclude);
  return letter;
}

function generateGameSequence(totalTrials: number, nValue: number, rememberCount: number) {
  const sequence: string[] = [];
  const rememberIndices: number[] = [];
  const minGap = nValue + 2;
  let currentPos = Math.floor(Math.random() * 3);
  
  for (let i = 0; i < rememberCount; i++) {
    if (currentPos + nValue < totalTrials) {
      rememberIndices.push(currentPos);
      currentPos += minGap + Math.floor(Math.random() * 3);
    }
  }
  
  for (let i = 0; i < totalTrials; i++) {
    const prevLetter = i > 0 ? sequence[i - 1] : undefined;
    const rememberIndex = rememberIndices.findIndex(idx => i === idx + nValue);
    
    if (rememberIndex !== -1) {
      sequence.push(sequence[rememberIndices[rememberIndex]]);
    } // Inside generateGameSequence function...
    // 
    else {
  // Explicitly type 'letter' as string here
  let letter: string; 
  let attempts = 0;
  do {
    letter = getRandomLetter(prevLetter);
    attempts++;
  } while (
    attempts < 10 &&
    rememberIndices.some(idx => i === idx + nValue && letter === sequence[idx])
  );
  sequence.push(letter);
}
  }
  return { sequence, rememberIndices };
}

function calculateMetrics(trials: Trial[]) {
  const targets = trials.filter((t) => t.isTarget);
  const nonTargets = trials.filter((t) => !t.isTarget);
  const hits = targets.filter((t) => t.userResponded && t.isCorrect).length;
  const misses = targets.filter((t) => !t.userResponded).length;
  const falsePositives = nonTargets.filter((t) => t.userResponded).length;
  const correctRejections = nonTargets.filter((t) => !t.userResponded).length;
  const accuracy = trials.length > 0 ? ((hits + correctRejections) / trials.length) * 100 : 0;
  const hitRTs = targets.filter((t) => t.userResponded && t.isCorrect && t.reactionTime !== null).map((t) => t.reactionTime as number);
  const avgRT = hitRTs.length > 0 ? hitRTs.reduce((a, b) => a + b, 0) / hitRTs.length : 0;

  return { accuracy: Math.round(accuracy), hits, misses, falsePositives, avgReactionTime: Math.round(avgRT), totalTargets: targets.length };
}

// --- MAIN COMPONENT ---
export default function NBackGame() {
  const [user, setUser] = useState<any>(null);
  const [gameState, setGameState] = useState<GameState>('intro');
  const [nValue, setNValue] = useState<number>(2);
  const [sequence, setSequence] = useState<string[]>([]);
  const [rememberIndices, setRememberIndices] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [showLetter, setShowLetter] = useState<boolean>(false);
  const [showRemember, setShowRemember] = useState<boolean>(false);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const hasSaved = useRef(false);

  const trialStartTime = useRef<number>(0);
  const hasResponded = useRef<boolean>(false);
  const router = useRouter();
  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

  const handleBackToDashboard = () => router.push('/onboarding/dashboard?open=tasks');

  const startGame = useCallback(() => {
    const randomN = [2, 3][Math.floor(Math.random() * 2)];
    const { sequence: newSeq, rememberIndices: newRem } = generateGameSequence(TOTAL_TRIALS, randomN, REMEMBER_COUNT);
    setNValue(randomN);
    setSequence(newSeq);
    setRememberIndices(newRem);
    setTrials([]);
    setCurrentIndex(-1);
    setGameState('playing');
    hasSaved.current = false;
  }, []);

  const sendDataToServer = async (metrics: any) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/game/nback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, user }),
      });
      if (!res.ok) throw new Error('Failed to send data');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const recordTrial = useCallback((responded: boolean, reactionTime: number | null) => {
    if (currentIndex < 0) return;
    const letter = sequence[currentIndex];
    const rememberIndex = rememberIndices.find(idx => currentIndex === idx + nValue);
    const isTarget = rememberIndex !== undefined && sequence[rememberIndex] === letter;
    const isCorrect = responded === isTarget;

    setTrials((prev) => [...prev, { letter, index: currentIndex, nValue, isTarget, userResponded: responded, isCorrect, reactionTime, timestamp: Date.now() }]);
  }, [currentIndex, sequence, rememberIndices, nValue]);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/auth/login');
      else setUser(user);
    };
    getData();
  }, [supabase, router]);

  useEffect(() => {
    if (gameState !== 'playing' || !showLetter || hasResponded.current) return;
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        hasResponded.current = true;
        recordTrial(true, Date.now() - trialStartTime.current);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, showLetter, recordTrial]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (currentIndex === -1) { setCurrentIndex(0); return; }
    if (currentIndex >= sequence.length) { setGameState('results'); return; }

    hasResponded.current = false;
    trialStartTime.current = Date.now();

    if (rememberIndices.includes(currentIndex)) {
      setShowRemember(true);
      setTimeout(() => setShowRemember(false), REMEMBER_DISPLAY_MS);
    }

    setShowLetter(true);
    const timer = setTimeout(() => {
      setShowLetter(false);
      if (!hasResponded.current) recordTrial(false, null);
      setTimeout(() => setCurrentIndex(prev => prev + 1), BLANK_GAP_MS);
    }, LETTER_DISPLAY_MS);

    return () => clearTimeout(timer);
  }, [gameState, currentIndex, sequence, recordTrial, rememberIndices]);

  useEffect(() => {
    if (gameState === 'results' && !hasSaved.current && trials.length > 0) {
      hasSaved.current = true;
      const m = calculateMetrics(trials);
      sendDataToServer(m);
    }
  }, [gameState, trials]);

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {gameState === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-center space-y-8 bg-white p-12 rounded-[3rem] shadow-sm border border-gray-50">
            <div>
              <h2 className="text-3xl font-light text-gray-800">N-Back Game</h2>
              <p className="text-[10px] text-[#5F7A7B] font-bold uppercase tracking-[0.2em]">Working Memory Assessment</p>
            </div>
            <div className="max-w-md mx-auto space-y-4 text-left border-y border-gray-50 py-6">
              <p className="text-sm text-gray-500 font-light leading-relaxed">1. Memorize letters when <b>REMEMBER</b> appears.</p>
              <p className="text-sm text-gray-500 font-light leading-relaxed">2. Press <b>SPACEBAR</b> when that letter reappears {nValue} steps later.</p>
            </div>
            <div className="pt-4 flex flex-col items-center gap-4">
              <button onClick={startGame} className="px-12 py-4 bg-[#5F7A7B] text-white rounded-full text-sm font-bold hover:shadow-xl transition-all">Start Test</button>
              <button onClick={handleBackToDashboard} className="text-[10px] text-gray-400 uppercase tracking-widest hover:text-[#5F7A7B]">Return to Dashboard</button>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 text-center">
            <div className="flex justify-between items-center mb-12">
              <button onClick={handleBackToDashboard} className="text-[#5F7A7B] text-xs font-bold uppercase flex items-center gap-2 hover:opacity-70 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Back to Dashboard
              </button>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Trial {currentIndex + 1} / {TOTAL_TRIALS}</div>
            </div>
            <div className="relative h-64 flex items-center justify-center">
              {showRemember && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute -top-10 text-[10px] font-bold text-[#5F7A7B] tracking-widest uppercase">Remember</motion.div>}
              <AnimatePresence>
                {showLetter && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-8xl font-light text-[#2a2a2a] bg-white w-48 h-48 flex items-center justify-center rounded-[2rem] shadow-sm border border-gray-50">
                    {sequence[currentIndex]}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Level: {nValue}-Back | Press Space for Match</p>
          </motion.div>
        )}

        {gameState === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
            {(() => {
              const m = calculateMetrics(trials);
              return (
                <>
                  <h3 className="text-7xl font-light text-[#5F7A7B]">{m.accuracy}%</h3>
                  <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <ResultCard label="Hits" value={m.hits} />
                    <ResultCard label="Misses" value={m.misses} />
                    <ResultCard label="False Positives" value={m.falsePositives} />
                    <ResultCard label="Avg Response" value={`${m.avgReactionTime}ms`} />
                  </div>
                </>
              );
            })()}
            <div className="flex flex-col items-center gap-4">
              <button onClick={startGame} className="px-10 py-3 bg-[#5F7A7B] text-white rounded-full text-xs font-bold hover:shadow-lg transition-all">Try Again</button>
              <button onClick={handleBackToDashboard} className="text-xs text-gray-400 hover:text-gray-600">Finish and Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="text-right">

          <h2 className="text-xl font-light text-gray-800">NBack Task</h2>

          <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Working Memory Assessment</p>

        </div>
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-50">
      <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">{label}</p>
      <p className="text-2xl text-gray-800">{value}</p>
    </div>
  );
}
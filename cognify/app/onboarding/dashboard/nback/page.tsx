'use client';

import router from 'next/router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';


// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// GAME CONFIGURATION
// ============================================================================

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LETTER_DISPLAY_MS = 1500;
const BLANK_GAP_MS = 500;
const TOTAL_TRIALS = 30; // Increased to accommodate 5 remember letters
const REMEMBER_DISPLAY_MS = 1200;
const REMEMBER_COUNT = 5; // Number of "REMEMBER" letters per session

// ============================================================================
// GAME LOGIC UTILITIES
// ============================================================================

/**
 * Generate a random letter that's different from the previous one
 */
function getRandomLetter(exclude?: string): string {
  let letter: string;
  do {
    letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  } while (exclude && letter === exclude);
  return letter;
}

/**
 * Generate sequence with embedded targets
 * Returns: { sequence, rememberIndices }
 */
function generateGameSequence(totalTrials: number, nValue: number, rememberCount: number) {
  const sequence: string[] = [];
  const rememberIndices: number[] = [];
  
  // Determine positions for REMEMBER letters
  // They should be spaced out and have room for the target to appear N steps later
  const minGap = nValue + 2; // Minimum gap between remember letters
  let currentPos = Math.floor(Math.random() * 3); // Start within first few positions
  
  for (let i = 0; i < rememberCount; i++) {
    if (currentPos + nValue < totalTrials) {
      rememberIndices.push(currentPos);
      currentPos += minGap + Math.floor(Math.random() * 3); // Add some randomness
    }
  }
  
  // Build the sequence
  for (let i = 0; i < totalTrials; i++) {
    const prevLetter = i > 0 ? sequence[i - 1] : undefined;
    
    // Check if this position should match a remember letter (is a target)
    const rememberIndex = rememberIndices.findIndex(idx => i === idx + nValue);
    
    if (rememberIndex !== -1) {
      // This is a target position - use the remember letter
      const rememberLetter = sequence[rememberIndices[rememberIndex]];
      sequence.push(rememberLetter);
    } else {
      // Generate a random letter
      // Make sure it doesn't accidentally match a previous remember letter at N positions back
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

/**
 * Calculate session metrics from trials
 */
function calculateMetrics(trials: Trial[]) {
  const targets = trials.filter((t) => t.isTarget);
  const nonTargets = trials.filter((t) => !t.isTarget);

  const hits = targets.filter((t) => t.userResponded && t.isCorrect).length;
  const misses = targets.filter((t) => !t.userResponded).length;
  const falsePositives = nonTargets.filter((t) => t.userResponded).length;
  const correctRejections = nonTargets.filter((t) => !t.userResponded).length;

  const totalCorrect = hits + correctRejections;
  const accuracy = trials.length > 0 ? (totalCorrect / trials.length) * 100 : 0;

  const hitReactionTimes = targets
    .filter((t) => t.userResponded && t.isCorrect && t.reactionTime !== null)
    .map((t) => t.reactionTime as number);

  const avgReactionTime =
    hitReactionTimes.length > 0
      ? hitReactionTimes.reduce((a, b) => a + b, 0) / hitReactionTimes.length
      : 0;

  return {
    accuracy: Math.round(accuracy),
    hits,
    misses,
    falsePositives,
    correctRejections,
    avgReactionTime: Math.round(avgReactionTime),
    totalTrials: trials.length,
    totalTargets: targets.length,
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function NBackGame() {
  // Game state
  const [user, setUser] = useState<any>(null);
  const [gameState, setGameState] = useState<GameState>('intro');
  const [nValue, setNValue] = useState<number>(2);
  const [sequence, setSequence] = useState<string[]>([]);
  const [rememberIndices, setRememberIndices] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [showLetter, setShowLetter] = useState<boolean>(false);
  const [showRemember, setShowRemember] = useState<boolean>(false);
  const [trials, setTrials] = useState<Trial[]>([]);

  // Refs for tracking
  const trialStartTime = useRef<number>(0);
  const hasResponded = useRef<boolean>(false);

  // ============================================================================
  // GAME CONTROL
  // ============================================================================

    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);


  const startGame = useCallback(() => {
    const randomN = [ 2, 3][Math.floor(Math.random() * 2)];
    const { sequence: newSequence, rememberIndices: newRememberIndices } = 
      generateGameSequence(TOTAL_TRIALS, randomN, REMEMBER_COUNT);

    setNValue(randomN);
    setSequence(newSequence);
    setRememberIndices(newRememberIndices);
    setTrials([]);
    setCurrentIndex(-1);
    setGameState('playing');
  }, []);

const sendDataToServer = async (metrics: any) => {
  try {
   const serverData={
        metrics,user
    }
    const res = await fetch('/api/game/nback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serverData),
    })

    if (!res.ok) {
      throw new Error('Failed to send N-back data')
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error('Error sending N-back metrics:', error)
  }
}


  const endGame = useCallback(() => {
    setGameState('results');
  }, []);

  // ============================================================================
  // TRIAL MANAGEMENT
  // ============================================================================

  const recordTrial = useCallback(
    (responded: boolean, reactionTime: number | null) => {
      const letter = sequence[currentIndex];
      
      // Check if this is a target: is there a remember letter N positions back?
      const rememberIndex = rememberIndices.find(idx => currentIndex === idx + nValue);
      const isTarget = rememberIndex !== undefined && sequence[rememberIndex] === letter;
      
      const isCorrect = responded === isTarget;

      const trial: Trial = {
        letter,
        index: currentIndex,
        nValue,
        isTarget,
        userResponded: responded,
        isCorrect,
        reactionTime,
        timestamp: Date.now(),
      };

      setTrials((prev) => [...prev, trial]);
    },
    [currentIndex, sequence, rememberIndices, nValue]
  );

  // ============================================================================
  // KEYBOARD HANDLER
  // ============================================================================

  useEffect(()=>{
         const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
      console.log(user)
    };
    getData();
  },[supabase])

  useEffect(() => {
    if (gameState !== 'playing' || !showLetter || hasResponded.current) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        hasResponded.current = true;
        const reactionTime = Date.now() - trialStartTime.current;
        recordTrial(true, reactionTime);
      }
    };



    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, showLetter, recordTrial]);

  // ============================================================================
  // TRIAL PROGRESSION
  // ============================================================================

  useEffect(() => {

    
    if (gameState !== 'playing') return;

 
    // Start first trial
    if (currentIndex === -1) {
      setCurrentIndex(0);
      return;
    }

    // End game if all trials complete
    if (currentIndex >= sequence.length) {
      endGame();
      return;
    }

    // Reset response tracking
    hasResponded.current = false;
    trialStartTime.current = Date.now();

    // Check if current position should show "REMEMBER"
    const shouldShowRemember = rememberIndices.includes(currentIndex);
    
    if (shouldShowRemember) {
      setShowRemember(true);
      setTimeout(() => setShowRemember(false), REMEMBER_DISPLAY_MS);
    }

    // Show letter
    setShowLetter(true);

    const letterTimer = setTimeout(() => {
      setShowLetter(false);

      // Record if no response during letter display
      if (!hasResponded.current) {
        recordTrial(false, null);
      }

      // Blank gap, then next trial
      const gapTimer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, BLANK_GAP_MS);

      return () => clearTimeout(gapTimer);
    }, LETTER_DISPLAY_MS);

    return () => clearTimeout(letterTimer);
  }, [gameState, currentIndex, sequence, nValue, recordTrial, endGame, rememberIndices]);

  // ============================================================================
  // RENDER: INTRO
  // ============================================================================

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f9f9f7] via-[#fefefe] to-[#f5f5f3] flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-2xl mb-16">
          <h1 className="text-4xl font-light text-[#2a2a2a] mb-6 tracking-tight">
            N-Back Game 
          </h1>
          <p className="text-base font-light text-[#6a6a6a] leading-relaxed mb-6">
            A cognitive memory task designed to assess working memory and attention. Commonly used
            in dementia and cognitive decline screening.
          </p>
          <div className="bg-[#5f7a7b]/5 p-6 rounded-lg mb-6">
            <p className="text-sm font-normal text-[#4d6364] leading-relaxed mb-3">
              <strong className="font-medium">How to play:</strong>
            </p>
            <ol className="text-sm font-light text-[#6a6a6a] leading-relaxed text-left space-y-2">
              <li>1. You'll see a sequence of letters, one at a time</li>
              <li>2. When you see "REMEMBER" above a letter, memorize it</li>
              <li>3. After N steps, that letter will appear again</li>
              <li>4. Press <strong className="font-medium text-[#4d6364]">SPACEBAR</strong> when you see the remembered letter reappear</li>
              <li>5. There will be 5 "REMEMBER" letters in each session</li>
            </ol>
          </div>
        </div>

        <button
          onClick={startGame}
          className="bg-[#5f7a7b] text-white px-12 py-4 text-base font-normal tracking-wide hover:bg-[#4d6364] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          Start Test
        </button>
      </div>
    );
  }

  // ============================================================================
  // RENDER: PLAYING
  // ============================================================================

  if (gameState === 'playing') {
    const currentLetter = sequence[currentIndex];
    const rememberedCount = rememberIndices.filter(idx => idx < currentIndex).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f9f9f7] via-[#fefefe] to-[#f5f5f3] flex flex-col">
        <div className="border-b border-[#5f7a7b]/10 py-10 px-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-light text-[#2a2a2a] mb-2 tracking-tight">
              N-Back Game
            </h1>
            <p className="text-sm font-light text-[#6a6a6a] leading-relaxed">
              Press <strong className="font-medium text-[#5f7a7b]">Spacebar</strong> when a remembered letter reappears
            </p>
          </div>
          <div className="flex justify-center items-center gap-12 text-xs font-normal text-[#6a6a6a] tracking-wide">
            <div className="text-[#5f7a7b]">Level: {nValue}-Back</div>
            <div>{currentIndex + 1} / {TOTAL_TRIALS}</div>
            <div>Remembered: {rememberedCount} / {REMEMBER_COUNT}</div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          {showLetter && (
            <div className="text-[12rem] font-light text-[#2a2a2a] tracking-tighter select-none">
              {currentLetter}
            </div>
          )}
          {showRemember && (
            <div className="absolute top-[calc(50%-10rem)] text-xs font-normal text-[#5f7a7b] tracking-[0.15em] uppercase animate-fade-in-out">
              REMEMBER
            </div>
          )}
        </div>

        <style jsx>{`
          @keyframes fade-in-out {
            0% { opacity: 0; transform: translateY(5px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-5px); }
          }
          .animate-fade-in-out {
            animation: fade-in-out 1.2s ease-in-out;
          }
        `}</style>
      </div>
    );
  }

  // ============================================================================
  // RENDER: RESULTS
  // ============================================================================

  if (gameState === 'results') {
    const metrics = calculateMetrics(trials);
    console.log(metrics)
    sendDataToServer(metrics)

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f9f9f7] via-[#fefefe] to-[#f5f5f3] flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-[#2a2a2a] mb-2 tracking-tight">
            Session Complete
          </h2>
          <p className="text-sm font-light text-[#6a6a6a]">
            {nValue}-Back Test Results
          </p>
        </div>

        <div className="flex flex-col items-center gap-10 max-w-2xl">
          <div className="text-center">
            <div className="text-7xl font-light text-[#5f7a7b] tracking-tight mb-2">
              {metrics.accuracy}%
            </div>
            <div className="text-xs font-normal text-[#6a6a6a] uppercase tracking-[0.1em]">
              Accuracy
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full">
            <div className="text-center">
              <div className="text-4xl font-light text-[#2a2a2a] tracking-tight mb-2">
                {metrics.hits}
              </div>
              <div className="text-xs font-normal text-[#6a6a6a] uppercase tracking-[0.1em]">
                Correct Hits
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-light text-[#2a2a2a] tracking-tight mb-2">
                {metrics.misses}
              </div>
              <div className="text-xs font-normal text-[#6a6a6a] uppercase tracking-[0.1em]">
                Misses
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-light text-[#2a2a2a] tracking-tight mb-2">
                {metrics.falsePositives}
              </div>
              <div className="text-xs font-normal text-[#6a6a6a] uppercase tracking-[0.1em]">
                False Positives
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-light text-[#2a2a2a] tracking-tight mb-2">
                {metrics.avgReactionTime > 0 ? `${metrics.avgReactionTime}ms` : 'N/A'}
              </div>
              <div className="text-xs font-normal text-[#6a6a6a] uppercase tracking-[0.1em]">
                Avg. Reaction Time
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <div className="text-sm font-light text-[#6a6a6a] mb-2">
              Targets Found: {metrics.hits} / {metrics.totalTargets}
            </div>
          </div>

          <button
            onClick={startGame}
            className="bg-[#5f7a7b] text-white px-10 py-3.5 text-base font-normal tracking-wide hover:bg-[#4d6364] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 mt-4"
          >
            Restart Test
          </button>
        </div>
      </div>
    );
  }

  return null;
}
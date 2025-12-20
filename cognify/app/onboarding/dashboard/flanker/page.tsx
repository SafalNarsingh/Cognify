"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface FlankerTaskProps {
  onBack: () => void;
}

export default function FlankerTask({ onBack }: FlankerTaskProps) {
  const [trialCount, setTrialCount] = useState(0);
  const [results, setResults] = useState({
    score: 0,
    misses: 0,
    falsePositives: 0,
    reactionTimes: [] as number[],
  });
  const [currentStimulus, setCurrentStimulus] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const router = useRouter();

  const totalTrials = 10;

  const generateTrial = useCallback(() => {
    const directions = ['<', '>'];
    const target = directions[Math.floor(Math.random() * 2)];
    const isCongruent = Math.random() > 0.5;
    let flanker = isCongruent ? target : (target === '<' ? '>' : '<');
    
    setCurrentStimulus(`${flanker}${flanker}${target}${flanker}${flanker}`);
    setStartTime(Date.now());
  }, []);

  const handleBackToDashboard = () => {
  // Redirect to dashboard with the 'open' parameter
  router.push('/onboarding/dashboard?open=tasks');
};

  useEffect(() => { generateTrial(); }, [generateTrial]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isFinished) return;
      const key = event.key;
      
      // We only care about < and > keys
      if (key !== '<' && key !== '>') return;

      const target = currentStimulus[2];
      const responseTime = Date.now() - startTime;
      const isCorrect = key === target;

      setResults(prev => ({
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        falsePositives: !isCorrect ? prev.falsePositives + 1 : prev.falsePositives,
        reactionTimes: [...prev.reactionTimes, responseTime]
      }));

      if (trialCount + 1 < totalTrials) {
        setTrialCount(prev => prev + 1);
        generateTrial();
      } else {
        setIsFinished(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStimulus, trialCount, isFinished, startTime, generateTrial]);

  // Calculate Metrics
  const avgRT = results.reactionTimes.length > 0 
    ? (results.reactionTimes.reduce((a, b) => a + b, 0) / results.reactionTimes.length).toFixed(0) 
    : 0;
  const accuracy = ((results.score / totalTrials) * 100).toFixed(0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* HEADER & BACK BUTTON */}
      <div className="flex justify-between items-center mb-12">
        <button 
          onClick={handleBackToDashboard}
          className="text-[#5F7A7B] text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Dashboard
        </button>
        <div className="text-right">
          <h2 className="text-xl font-light text-gray-800">Flanker Task</h2>
          <p className="text-[10px] text-gray-400 uppercase tracking-tighter">Inhibitory Control Assessment</p>
        </div>
      </div>

      {!isFinished ? (
        <div className="space-y-12 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-500 leading-relaxed font-light">
              Look at the <span className="font-bold text-gray-800">center character</span> of the string below. 
              Press <span className="font-bold">{"<"}</span> if it points left and <span className="font-bold">{">"}</span> if it points right. 
              Ignore the surrounding "flanker" characters.
            </p>
          </div>

          <motion.div 
            key={currentStimulus}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-7xl font-mono text-[#5F7A7B] tracking-[0.5em] bg-white py-16 rounded-[3rem] shadow-sm border border-gray-50"
          >
            {currentStimulus}
          </motion.div>

          <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
            Trial {trialCount + 1} / {totalTrials}
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Overall Accuracy</p>
            <h3 className="text-7xl font-light text-[#5F7A7B]">{accuracy}%</h3>
          </div>

          {/* 2x2 Matrix */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-white p-6 rounded-3xl border border-gray-50">
              <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Total Score</p>
              <p className="text-2xl text-gray-800">{results.score}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-50">
              <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Misses</p>
              <p className="text-2xl text-gray-800">{results.misses}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-50">
              <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">False Positives</p>
              <p className="text-2xl text-gray-800">{results.falsePositives}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-50">
              <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Avg Response</p>
              <p className="text-2xl text-gray-800">{avgRT}<span className="text-xs ml-1 text-gray-400">ms</span></p>
            </div>
          </div>

          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-3 bg-[#5F7A7B] text-white rounded-full text-xs font-bold hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
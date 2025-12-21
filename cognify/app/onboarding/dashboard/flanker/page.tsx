  "use client";

  import { useState, useEffect, useCallback, useRef } from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import { useRouter } from 'next/navigation';
  import { createBrowserClient } from '@supabase/ssr';

  interface FlankerTaskProps {
    onBack: () => void;
  }

  export default function FlankerTask({ onBack }: FlankerTaskProps) {
    const [hasStarted, setHasStarted] = useState(false); // New state for intro screen
    const [trialCount, setTrialCount] = useState(0);
    const [results, setResults] = useState({
      score: 0,
      misses: 0,
      falsePositives: 0,
      reactionTimes: [] as number[],
    });
    const [currentStimulus, setCurrentStimulus] = useState("");
    const [isFinished, setIsFinished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const hasSaved = useRef(false);
    const router = useRouter();

    const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
// Inside your N-Back or Flanker results logic
const saveDailyProgress = async (accuracy: number, rt: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  // Normalize RT: Suppose 1000ms is 0 and 200ms is 100
  const normalizedRT = Math.max(0, Math.min(100, (1000 - rt) / 8));
  const normalizedCognitive = (accuracy * 0.7) + (normalizedRT * 0.3);

  // Upsert into progress_entries
  const { error } = await supabase
    .from('progress_entries')
    .upsert({ 
      user_id: user.id, 
      date: new Date().toISOString().split('T')[0],
      cognitive_score: normalizedCognitive
    }, { onConflict: 'user_id, date' });
    
  // Note: Your improvement_index can be calculated here or via a Supabase Trigger
  };

  const handleTaskComplete = async (accuracy: number, avgRT: number) => {
  // Normalize RT: (e.g., 1000ms is slow/0, 300ms is fast/100)
  const normalizedRT = Math.max(0, Math.min(100, (1000 - avgRT) / 7));
  
  // Cognitive logic: 70% Accuracy + 30% Speed
  const normalizedCog = (accuracy * 0.7) + (normalizedRT * 0.3);

  // Update daily progress summary
  await updateDailyProgress('cognitive', normalizedCog);
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
  const saveResults = async (finalResults: typeof results) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const accuracy = (finalResults.score / totalTrials) * 100;
      const avgRT = finalResults.reactionTimes.length > 0 
        ? Math.round(finalResults.reactionTimes.reduce((a, b) => a + b, 0) / finalResults.reactionTimes.length) 
        : 0;

      await supabase.from('flanker_results').insert({
        user_id: user.id,
        score: finalResults.score,
        misses: finalResults.misses,
        false_positives: finalResults.falsePositives,
        accuracy,
        avg_reaction_time_ms: avgRT,
        reaction_times: finalResults.reactionTimes
      });
    } catch (error) {
      console.error("Error saving results:", error);
    } finally {
      setIsSaving(false);
    }
  };

    const totalTrials = 10;

    const generateTrial = useCallback((prevStimulus: string | null = null) => {
      const directions = ['<', '>'];
      let newStimulus = "";
      
      do {
        const target = directions[Math.floor(Math.random() * 2)];
        const isCongruent = Math.random() > 0.5;
        let flanker = isCongruent ? target : (target === '<' ? '>' : '<');
        newStimulus = `${flanker}${flanker}${target}${flanker}${flanker}`;
      } while (prevStimulus && newStimulus === prevStimulus);

      setCurrentStimulus(newStimulus);
      setStartTime(Date.now());
    }, []);

    const handleBackToDashboard = () => {
      router.push('/onboarding/dashboard?open=tasks');
    };

    // Only generate the first trial once the user clicks "Start"
    useEffect(() => { 
      if (hasStarted) {
        generateTrial(); 
      }
    }, [hasStarted, generateTrial]);

    // Trigger save when finished
  useEffect(() => {
    if (isFinished && !hasSaved.current) {
      hasSaved.current = true;
      saveResults(results);
    }
  }, [isFinished, results]);

    // Effect for trial timeout
    useEffect(() => {
      if (isFinished || !hasStarted) return; // Don't run timer if not started

      const timer = setTimeout(() => {
        setResults(prev => ({
          ...prev,
          misses: prev.misses + 1,
        }));

        if (trialCount + 1 < totalTrials) {
          setTrialCount(prev => prev + 1);
          generateTrial(currentStimulus);
        } else {
          setIsFinished(true);
        }
      }, 3000); 

      return () => clearTimeout(timer);
    }, [trialCount, isFinished, hasStarted, generateTrial, currentStimulus]);

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (isFinished || !hasStarted) return; // Ignore keys if intro is showing
        const key = event.key;
        
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
          generateTrial(currentStimulus);
        } else {
          setIsFinished(true);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentStimulus, trialCount, isFinished, hasStarted, startTime, generateTrial]);

    const avgRT = results.reactionTimes.length > 0 
      ? (results.reactionTimes.reduce((a, b) => a + b, 0) / results.reactionTimes.length).toFixed(0) 
      : 0;
    const accuracy = ((results.score / totalTrials) * 100).toFixed(0);

    return (
      <div className="max-w-4xl mx-auto p-6 min-h-[600px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            // --- INTRO / START PAGE ---
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center space-y-8 bg-white p-12 rounded-[3rem] shadow-sm border border-gray-50"
            >
              <div>
                <h2 className="text-3xl font-light text-gray-800 mb-2">Flanker Task</h2>
                <p className="text-[10px] text-[#5F7A7B] font-bold uppercase tracking-[0.2em]">Inhibitory Control Assessment</p>
              </div>

              <div className="max-w-md mx-auto space-y-6 text-left">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F9F9F7] flex items-center justify-center text-[#5F7A7B] font-bold text-xs shrink-0">1</div>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    A series of arrows will appear. Focus <span className="font-bold text-gray-800 underline decoration-[#5F7A7B]/30">only on the middle arrow</span>.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F9F9F7] flex items-center justify-center text-[#5F7A7B] font-bold text-xs shrink-0">2</div>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    Press <span className="font-bold">{"<"}</span> for left or <span className="font-bold">{">"}</span> for right. Ignore the outer arrows.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#F9F9F7] flex items-center justify-center text-[#5F7A7B] font-bold text-xs shrink-0">3</div>
                  <p className="text-sm text-gray-500 font-light leading-relaxed">
                    The test consists of <span className="font-bold">10 trials</span>. Each trial has a 3-second time limit.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col items-center gap-4">
                <button 
                  onClick={() => setHasStarted(true)}
                  className="px-12 py-4 bg-[#5F7A7B] text-white rounded-full text-sm font-bold hover:shadow-xl hover:scale-105 transition-all"
                >
                  Begin Assessment
                </button>
                <button onClick={handleBackToDashboard} className="text-[10px] text-gray-400 uppercase tracking-widest hover:text-[#5F7A7B] transition-colors">
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          ) : !isFinished ? (
            // --- GAME PLAY VIEW ---
            <motion.div 
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12 text-center"
            >
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


      <div className="space-y-12 text-center">

          <div className="max-w-md mx-auto">

            <p className="text-sm text-gray-500 leading-relaxed font-light">

              Look at the <span className="font-bold text-gray-800">center character</span> of the string below.

              Press <span className="font-bold">{"<"}</span> if it points left and <span className="font-bold">{">"}</span> if it points right.

              Ignore the surrounding "flanker" characters.

            </p>

          </div>

      </div>


              <motion.div 
                key={currentStimulus}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-7xl font-mono text-[#5F7A7B] tracking-[0.5em] bg-white py-20 rounded-[3rem] shadow-sm border border-gray-50"
              >
                {currentStimulus}
              </motion.div>
              
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Use keyboard {"<"} or {">"} keys</p>
            </motion.div>
          ) : (
            // --- RESULTS VIEW ---
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-center space-y-8"
            >
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">Overall Accuracy</p>
                <h3 className="text-7xl font-light text-[#5F7A7B]">{accuracy}%</h3>
              </div>

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

              <div className="flex flex-col items-center gap-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-10 py-3 bg-[#5F7A7B] text-white rounded-full text-xs font-bold hover:shadow-lg transition-all"
                >
                  Try Again
                </button>
                <button onClick={handleBackToDashboard} className="text-xs text-gray-400 hover:text-gray-600">
                  Finish and Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
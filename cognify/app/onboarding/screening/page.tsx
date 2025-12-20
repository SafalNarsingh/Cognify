"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import congnifyLogo from '../../../public/cognify_logo.png';
import { screeningData } from '../../components/screeningData';
import { BrainCircuitIcon } from "lucide-react";

export default function ScreeningPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Filters screeningData to only include MH (PHQ9), ASD (SRS), and ELD (MoCA) if needed
  // This assumes screeningData is already organized by these three categories
  const currentData = screeningData[step];
  const progress = ((step + 1) / screeningData.length) * 100;

  const handleAnswer = (qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleUntick = (qId: string) => {
    setAnswers(prev => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  const handleClearSection = () => {
    setAnswers(prev => {
      const next = { ...prev };
      currentData.questions.forEach(q => { delete next[q.id]; });
      return next;
    });
  };

  const nextStep = () => {
    if (step < screeningData.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleComplete = async () => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      // 1. Send answers to API
      // The backend now calculates scores for: phq9_score, srs_score, and moca_score
      const res = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save result_q');
      }
   
      // 2. Mark onboarding as completed
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        router.replace('/auth/login');
        return;
      }

      const { error: profileErr } = await supabase
        .from('user_profile')
        .upsert({ 
          user_id: auth.user.id, 
          onboarding_completed: true, 
          updated_at: new Date().toISOString() 
        }, { onConflict: 'user_id' });

      if (profileErr) throw profileErr;

      // 3. Success redirect
      router.push('/onboarding/profiling');
    } catch (e: any) {
      console.error('Screening Error:', e.message);
      alert(`Error: ${e.message}`); // Helpful for debugging database/auth issues
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-between items-end mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-xl flex flex-row gap-1"><BrainCircuitIcon></BrainCircuitIcon> Cognify</div>
            <span className="text-gray-400 font-light text-sm">Step {step + 1} of {screeningData.length}</span>
          </div>
          <span className="text-[#5F7A7B] text-xs font-semibold uppercase tracking-widest">
            {currentData.category}
          </span>
        </div>
        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5F7A7B] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-light text-gray-800">{currentData.description}</h2>
            <p className="text-sm text-gray-500 font-light mt-1">Select the most accurate response.</p>
          </div>
          <button 
            onClick={handleClearSection}
            className="text-sm text-gray-400 hover:text-[#5F7A7B] transition-colors"
          >
            Clear Section
          </button>
        </div>

        {currentData.questions.map((q) => (
          <div key={q.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:border-gray-200">
            <p className="text-lg text-gray-700 font-light mb-6">{q.text}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Not at all", "Rarely", "Frequently", "Always"].map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(q.id, option)}
                  className={`px-3 py-3 text-xs rounded-xl border transition-all duration-200
                    ${answers[q.id] === option
                      ? 'bg-[#5F7A7B] text-white border-[#5F7A7B] shadow-sm'
                      : 'bg-[#F9F9F7] text-gray-500 border-transparent hover:border-gray-200'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center pt-3">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className={`px-8 py-3 rounded-xl border border-gray-200 text-gray-500 font-light
              ${step === 0 ? 'opacity-0' : 'hover:bg-white cursor-pointer'}`}
          >
            Back
          </button>

          {step === screeningData.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={submitting}
              className="px-10 py-3 bg-[#5F7A7B] text-white rounded-xl font-medium hover:bg-[#4D6364] disabled:opacity-60 transition-all"
            >
              {submitting ? 'Calculating Scores...' : 'Finish Assessment'}
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-10 py-3 bg-[#5F7A7B] text-white rounded-xl font-medium hover:bg-[#4D6364] transition-all"
            >
              Next Section
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
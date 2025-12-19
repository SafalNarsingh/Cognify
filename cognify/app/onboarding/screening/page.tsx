"use client";
import { useState } from 'react';
import Image from 'next/image';
<<<<<<< HEAD
import { useRouter } from 'next/navigation';
=======
import { useRouter } from 'next/navigation'; // Changed from Link
import { createBrowserClient } from '@supabase/ssr';
>>>>>>> 356814b34aae52ecb09eaf5ffea78b5dd46fe878
import congnifyLogo from '../../../public/cognify_logo.png';
import { screeningData } from '../../components/screeningData';

export default function ScreeningPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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

<<<<<<< HEAD
  const handleComplete = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('Failed to save questionnaire_result:', err);
      }
      console.log('API: ', res);
      console.log('Answer:', answers);
    } catch (e) {
      console.error('Unexpected error saving questionnaire_result:', e);
    } finally {
      setSubmitting(false);
      router.push('/onboarding/dashboard');
    }
=======
  // HANDLES THE TRANSITION TO PROFILING
  const handleComplete = async () => {
    setIsSubmitting(true);
    
    // Logic to save answers to Supabase would go here
    // const { data: { user } } = await supabase.auth.getUser();
    // await supabase.from('screening_results').upsert({ id: user.id, answers });

    // Move to the next phase of onboarding
    router.push('/onboarding/profiling');
>>>>>>> 356814b34aae52ecb09eaf5ffea78b5dd46fe878
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-between items-end mb-4">
          <div className="flex items-center space-x-3">
            <Image src={congnifyLogo} alt="Cognify Logo" width={100} height={100} />
            <span className="text-gray-400 font-light text-sm">Step {step + 1} of 3</span>
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
            <p className="text-sm text-gray-500 font-light mt-1">Select the best description. Double-click to deselect.</p>
          </div>
<<<<<<< HEAD
          <button
=======
          <button 
>>>>>>> 356814b34aae52ecb09eaf5ffea78b5dd46fe878
            onClick={handleClearSection}
            className="text-sm text-gray-400 hover:text-white transition-colors border border-gray-200 hover:bg-[#5F7A7B] rounded-full px-4 py-2"
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
                  onDoubleClick={() => handleUntick(q.id)}
                  className={`px-3 py-3 text-xs rounded-xl border transition-all duration-200 select-none
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

<<<<<<< HEAD
        <div className="flex justify-between items-center pt-10">
=======
        <div className="flex justify-between items-center pt-3">
>>>>>>> 356814b34aae52ecb09eaf5ffea78b5dd46fe878
          <button
            onClick={prevStep}
            disabled={step === 0}
            className={`px-8 py-3 rounded-xl border border-gray-200 text-gray-500 font-light transition-all
              ${step === 0 ? 'opacity-0 cursor-default' : 'hover:bg-white hover:shadow-sm cursor-pointer'}`}
          >
            Back
          </button>

          {step === screeningData.length - 1 ? (
<<<<<<< HEAD
            <button
              onClick={handleComplete}
              disabled={submitting}
              className="px-10 py-3 bg-[#5F7A7B] text-white rounded-xl font-medium shadow-sm hover:bg-[#4D6364] transition-all cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Complete Assessment'}
=======
            <button 
              onClick={handleComplete}
              disabled={isSubmitting}
              className="px-10 py-3 bg-[#5F7A7B] text-white rounded-xl font-medium shadow-sm hover:bg-[#4D6364] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Complete Assessment"}
>>>>>>> 356814b34aae52ecb09eaf5ffea78b5dd46fe878
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-10 py-3 bg-[#5F7A7B] text-white rounded-xl font-medium shadow-sm hover:bg-[#4D6364] transition-all cursor-pointer"
            >
              Next Section
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
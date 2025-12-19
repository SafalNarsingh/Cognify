// app/onboarding/screening/page.tsx
"use client";
import Image from 'next/image';
import congnifyLogo from '../../../public/cognify_logo.png';

export default function ScreeningPage() {
  const questions = [
    { 
      id: "mh", 
      text: "How often have you felt overwhelmed by worry or sadness in the last two weeks?", 
      context: "Screens for Mental Health (Anxiety/Depression)" 
    },
    { 
      id: "elderly", 
      text: "Have you or loved ones noticed subtle changes in your memory or coordination?", 
      context: "Screens for Elderly/Neuro-degenerative conditions" 
    },
    { 
      id: "neuro", 
      text: "Do you experience persistent difficulty sustaining focus or managing time?", 
      context: "Screens for Neuro-developmental conditions (ADHD/Dyslexia)" 
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center py-16 px-6">
      <div className="w-full max-w-3xl space-y-12">
        <div className="flex flex-col items-center text-center">
          <Image src={congnifyLogo} alt="Cognify Logo" width={50} height={50} className="mb-4" />
          <h2 className="text-3xl font-light text-gray-800">Initial Assessment</h2>
          <p className="text-gray-500 font-light max-w-md mx-auto">These questions help direct you to the most effective clinical tools.</p>
        </div>

        <div className="space-y-6">
          {questions.map((q) => (
            <div key={q.id} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-all hover:border-[#5F7A7B]/20">
              <span className="text-[10px] font-semibold text-[#5F7A7B] uppercase tracking-widest">{q.context}</span>
              <p className="text-xl text-gray-700 font-light mt-3 mb-8">{q.text}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Never", "Rarely", "Frequently", "Always"].map((option) => (
                  <button key={option} className="px-4 py-3 text-sm rounded-xl border border-gray-100 bg-[#F9F9F7] hover:bg-[#5F7A7B] hover:text-white transition-all text-gray-500 font-light">
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <button className="px-12 py-4 bg-[#5F7A7B] text-white rounded-2xl text-lg font-light hover:bg-[#4D6364] shadow-sm transition-all">
            Finalize Triage
          </button>
        </div>
      </div>
    </div>
  );
}
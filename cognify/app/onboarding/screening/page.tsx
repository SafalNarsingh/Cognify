"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import congnifyLogo from '../../../public/cognify_logo.png';

export default function ScreeningPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const screeningData = [
    {
      category: "Mental Health",
      description: "Mood and Emotional Well-being",
      questions: [
        { id: "mh_1", text: "Little interest or pleasure in doing things you used to enjoy?" },
        { id: "mh_2", text: "Feeling nervous, anxious, or on edge more often than usual?" },
        { id: "mh_3", text: "Trouble falling or staying asleep, or sleeping too much?" }
      ]
    },
    {
      category: "Elderly & Neuro-degenerative",
      description: "Cognitive Decline and Motor Control",
      questions: [
        { id: "ed_1", text: "Have you noticed increased difficulty in remembering recent events or names?" },
        { id: "ed_2", text: "Do you experience tremors or stiffness that affects your movement?" },
        { id: "ed_3", text: "Have you had trouble navigating familiar routes or judging distances?" }
      ]
    },
    {
      category: "Neuro-developmental",
      description: "Attention and Learning Patterns",
      questions: [
        { id: "nd_1", text: "Do you often fail to give close attention to details or make careless mistakes?" },
        { id: "nd_2", text: "Do you find it difficult to stay focused on a single task for a long period?" },
        { id: "nd_3", text: "Do you struggle with reading speed or frequently reversing letters while writing?" }
      ]
    }
  ];

  const currentData = screeningData[step];
  const progress = ((step + 1) / screeningData.length) * 100;

  // Function to set an answer
  const handleAnswer = (qId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  // Function to untick an answer (on double click)
  const handleUntick = (qId: string) => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[qId];
      return newAnswers;
    });
  };

  // Function to clear all answers in the current section
  const handleClearSection = () => {
    setAnswers(prev => {
      const newAnswers = { ...prev };
      currentData.questions.forEach(q => {
        delete newAnswers[q.id];
      });
      return newAnswers;
    });
  };

  const nextStep = () => {
    if (step < screeningData.length - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center py-12 px-6">
      {/* Header & Progress */}
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

      {/* Questions Card */}
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-light text-gray-800">{currentData.description}</h2>
            <p className="text-sm text-gray-500 font-light mt-1">Select the best description. Double-click to deselect.</p>
          </div>
          {/* Clear All Option */}
          <button 
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

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-10">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className={`px-8 py-3 rounded-xl border border-gray-200 text-gray-500 font-light transition-all
              ${step === 0 ? 'opacity-0 cursor-default' : 'hover:bg-white hover:shadow-sm cursor-pointer'}`}
          >
            Back
          </button>

          {step === screeningData.length - 1 ? (
            <Link href="/dashboard">
              <button className="px-10 py-3 bg-[#5F7A7B] text-white rounded-xl font-medium shadow-sm hover:bg-[#4D6364] transition-all cursor-pointer">
                Complete Assessment
              </button>
            </Link>
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
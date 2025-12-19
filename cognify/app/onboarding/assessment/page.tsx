    "use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import congnifyLogo from '../../../public/cognify_logo.png';

export default function AssessmentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-center space-y-8">
        <Image src={congnifyLogo} alt="Cognify Logo" width={120} height={120} className="mx-auto opacity-80" />

        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-2xl font-light text-gray-800 tracking-tight">Cognitive Assessment</h2>
          
          <div className="p-6 bg-[#F9F9F7] rounded-2xl border border-dashed border-gray-300">
            <p className="text-[#5F7A7B] font-medium italic">Recommendations: On Progress...</p>
            <p className="text-[11px] text-gray-400 mt-2 uppercase tracking-widest">
              Curating interactive tasks
            </p>
          </div>

          <p className="text-sm text-gray-500 font-light leading-relaxed">
            We are preparing specific tasks like <strong>Flanker, Stroop, or N-back </strong> 
            to baseline your cognitive function and attentional control.
          </p>

          <div className="flex gap-4">
            <button 
              onClick={() => router.push('/onboarding/dashboard')}
              className="flex-1 bg-transparent border border-gray-200 text-gray-400 py-4 rounded-xl hover:bg-gray-50 transition-all font-light cursor-pointer"
            >
              Skip
            </button>
            <button 
              onClick={() => router.push('/onboarding/dashboard')}
              className="flex-1 bg-[#5F7A7B] text-white py-4 rounded-xl hover:bg-[#4D6364] transition-all font-medium cursor-pointer shadow-sm"
            >
              Next
              
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
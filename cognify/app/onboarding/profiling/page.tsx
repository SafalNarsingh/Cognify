"use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import congnifyLogo from '../../../public/cognify_logo.png';

export default function ProfilingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-center space-y-8">
        <Image src={congnifyLogo} alt="Cognify Logo" width={120} height={120} className="mx-auto opacity-80" />

        <div className="space-y-6 animate-in fade-in duration-700">
          <h2 className="text-2xl font-light text-gray-800 tracking-tight">Condition Profiling</h2>
          
          <div className="p-6 bg-[#F9F9F7] rounded-2xl border border-dashed border-gray-300">
            <p className="text-[#5F7A7B] font-medium italic">Your condition is: On Progress...</p>
            <p className="text-[11px] text-gray-400 mt-2 uppercase tracking-widest">
              Decoding screening data
            </p>
          </div>

          <p className="text-sm text-gray-500 font-light leading-relaxed">
            Our clinical engine is analyzing your responses and history to create a 
            <strong> Mental Condition Profile</strong>. This informs your personalized care path.
          </p>

          <button 
            onClick={() => router.push('/onboarding/assessment')}
            className="w-full bg-[#5F7A7B] text-white py-4 rounded-xl hover:bg-[#4D6364] transition-all font-medium cursor-pointer shadow-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
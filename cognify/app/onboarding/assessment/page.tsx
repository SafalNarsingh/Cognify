    "use client";

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import congnifyLogo from '../../../public/cognify_logo.png';

export default function AssessmentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center px-6 q">
        {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Horizontal Lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-pulse"></div>
        <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Vertical Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gray-300 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-gray-300 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Semi-circular animated elements */}
        <div className="absolute top-20 left-10 w-32 h-16 border-2 border-gray-300 rounded-t-full animate-float"></div>
        <div className="absolute top-1/3 right-20 w-40 h-20 border-2 border-gray-400 rounded-b-full animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-12 border-2 border-gray-300 rounded-t-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-28 h-14 border-2 border-gray-400 rounded-b-full animate-float-delayed" style={{ animationDelay: '1s' }}></div>
        
        {/* Additional decorative circles */}
        <div className="absolute top-40 right-40 w-20 h-20 border border-dashed border-gray-300 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-32 left-32 w-16 h-16 border border-dashed border-gray-400 rounded-full animate-spin-slow" style={{ animationDelay: '3s' }}></div>
      </div>
      <div className="w-full max-w-lg bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-center space-y-8 relative z-10">
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
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
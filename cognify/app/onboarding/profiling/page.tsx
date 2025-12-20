"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import congnifyLogo from '../../../public/cognify_logo.png';

export default function ProfilingPage() {
  const router = useRouter();
  const [condition, setCondition] = useState("Decoding screening data...");
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchCondition = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('result_q')
        .select('phq9_score, srs_score, moca_score')
        .eq('user_id', user.id)
        .single();

      if (data) {
        // Logic to determine primary condition based on highest score
        const scores = [
          { label: "Depressive Tendencies", value: data.phq9_score },
          { label: "Neurodivergent Patterns", value: data.srs_score },
          { label: "Cognitive Decline Risk", value: data.moca_score },
        ];
        
        const top = scores.sort((a, b) => b.value - a.value)[0];
        setCondition(top.value > 10 ? top.label : "General Wellness Baseline");
      }
      setLoading(false);
    };

    fetchCondition();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-lg bg-white p-10 rounded-3xl border border-gray-100 shadow-sm text-center space-y-8">
        <Image src={congnifyLogo} alt="Cognify Logo" width={120} height={120} className="mx-auto opacity-80" />

        <div className="space-y-6 animate-in fade-in duration-700">
          <h2 className="text-2xl font-light text-gray-800 tracking-tight">Condition Profiling</h2>
          
          <div className="p-6 bg-[#F9F9F7] rounded-2xl border border-dashed border-gray-300">
            <p className="text-[#5F7A7B] font-medium italic">
              {loading ? "Analyzing responses..." : `Your condition is: ${condition}`}
            </p>
            <p className="text-[11px] text-gray-400 mt-2 uppercase tracking-widest">
              {loading ? "Decoding screening data" : "Clinical Analysis Complete"}
            </p>
          </div>

          <p className="text-sm text-gray-500 font-light leading-relaxed">
            Our clinical engine has analyzed your responses to create a 
            <strong> Mental Condition Profile</strong>. This informs your personalized care path.
          </p>

          <button 
            onClick={() => router.push('/onboarding/dashboard')}
            className="w-full bg-[#5F7A7B] text-white py-4 rounded-xl hover:bg-[#4D6364] transition-all font-medium cursor-pointer shadow-sm"
          >
            Next to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
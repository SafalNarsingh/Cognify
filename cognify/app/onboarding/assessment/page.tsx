"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuitIcon, ArrowRight, Play, Sparkles, Activity, Target, ShieldAlert } from "lucide-react";

const TASK_RESOURCES = {
  stroop: {
    name: 'Emotional Stroop',
    path: '/onboarding/dashboard/stroop',
    desc: 'Emotional Regulation',
    benefit: 'Evaluates attentional bias toward emotional stimuli, often linked to depressive patterns.',
    image: 'https://images.unsplash.com/photo-1606167668584-78701c57f13d?auto=format&fit=crop&q=80&w=800'
  },
  flanker: {
    name: 'Flanker Task',
    path: '/onboarding/dashboard/flanker',
    desc: 'Inhibitory Control',
    benefit: 'Assesses the executive function of filtering out irrelevant environmental noise.',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800'
  },
  nback: {
    name: 'N-Back Game',
    path: '/onboarding/dashboard/nback',
    desc: 'Working Memory',
    benefit: 'A gold-standard task for measuring memory load capacity and cognitive flexibility.',
    image: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=800'
  }
};

export default function AssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<any>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchClinicalProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/auth/login');

// In your AssessmentPage useEffect
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('condition')
        .eq('id', user.id)
        .single();

      if (profile?.condition === 'Depressive Tendencies') {
        setRecommendation(TASK_RESOURCES.stroop); // Recommended for depression
      } else if (profile?.condition === 'Neurodivergent Patterns') {
        setRecommendation(TASK_RESOURCES.flanker); // Recommended for ADHD/Focus
      } else if (profile?.condition === 'Cognitive Decline Risk') {
        setRecommendation(TASK_RESOURCES.nback);   // Recommended for memory
      } else {
        setRecommendation(null); // General Wellness
      }
      } catch (err) {
        console.error("Logic Engine Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClinicalProfile();
  }, [supabase, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
      <div className="animate-pulse text-[#5F7A7B] text-[10px] font-bold uppercase tracking-widest">Consulting Profile...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white p-10 md:p-14 rounded-[3.5rem] border border-gray-100 shadow-sm relative z-10 space-y-10"
      >
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F9F9F7] rounded-full text-[#5F7A7B]">
            <Activity size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Clinical Recommendation</span>
          </div>
          <h2 className="text-3xl font-light text-gray-800">Targeted Assessment</h2>
        </header>

        <AnimatePresence mode="wait">
          {recommendation ? (
            <motion.div key="task" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="relative group overflow-hidden rounded-[2.5rem] border border-gray-100">
                <img src={recommendation.image} alt="" className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                  <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">{recommendation.desc}</p>
                  <h3 className="text-white text-3xl font-light">{recommendation.name}</h3>
                </div>
              </div>

              <div className="bg-[#F9F9F7] p-6 rounded-3xl border border-gray-50 flex gap-4">
                <ShieldAlert className="text-[#5F7A7B] shrink-0" size={20} />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Clinical Insight</p>
                  <p className="text-sm text-gray-600 font-light leading-relaxed">{recommendation.benefit}</p>
                </div>
              </div>

              <button 
                onClick={() => router.push(recommendation.path)}
                className="w-full py-5 bg-[#5F7A7B] text-white rounded-3xl text-sm font-bold uppercase tracking-widest hover:bg-[#4D6364] transition-all flex items-center justify-center gap-3"
              >
                Launch Assessment <ArrowRight size={16} />
              </button>
            </motion.div>
          ) : (
            <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 space-y-6">
              <div className="w-20 h-20 bg-[#F9F9F7] rounded-full flex items-center justify-center mx-auto">
                <Sparkles size={32} className="text-[#5F7A7B]" />
              </div>
              <div>
                <h3 className="text-xl font-light text-gray-800">Wellness Balance Achieved</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                  No specific cognitive impairments detected. We recommend starting with a mindfulness session to maintain your current baseline.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-8 border-t border-gray-50">
          <div className="bg-[#F9F9F7] p-6 rounded-[2rem] border border-dashed border-gray-200 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[#5F7A7B] font-medium italic">Mindfulness Support</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Pre-task Regulation</p>
            </div>
            <button 
              onClick={() => router.push('/onboarding/dashboard?open=meditation')}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100"
            >
              <Play size={18} fill="#5F7A7B" stroke="none" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
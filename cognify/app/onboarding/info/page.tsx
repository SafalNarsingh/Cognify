// app/onboarding/info/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// import congnifyLogo from "../../../public/cognify_logo.png";
import { createBrowserClient } from "@supabase/ssr";
import { BrainCircuitIcon } from "lucide-react";

export default function UserInfoPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState("");
  const [priorMentalHealth, setPriorMentalHealth] = useState("");
  const [dailyRoutine, setDailyRoutine] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setErrorMsg(null);
      setLoading(true);

      // Require auth
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      // Prefill if a profile already exists
      const { data: existing, error } = await supabase
        .from("user_profile")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && existing) {
        setFullName(existing.full_name ?? "");
        setAge(existing.age != null ? String(existing.age) : "");
        setGender(existing.gender ?? "");
        // IMPORTANT: Replace 'prior_mental_health_history' with your exact column name if different.
        setPriorMentalHealth(existing.prior_mental_health_history ?? existing.prior_mental_health ?? "");
        setDailyRoutine(existing.daily_routine ?? "");
      }

      setLoading(false);
    };

    load();
  }, [router]);

  const handleSaveAndContinue = async () => {
    setSaving(true);
    setErrorMsg(null);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const payload = {
        user_id: user.id,
        full_name: fullName || null,
        age: age ? Number(age) : null,
        gender: gender || null,
        // IMPORTANT: Ensure this key matches your DB column exactly.
        // If your column is 'prior_mental_health' instead, rename the key below.
        prior_mental_health_history: priorMentalHealth || null,
        daily_routine: dailyRoutine || null,
      };

      const { error } = await supabase
        .from("user_profile")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();

      if (error) throw error;

      router.push("/onboarding/screening");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center py-12 px-6 overflow-hidden relative">
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
      <div className="w-full max-w-xl space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center">
             <div className="p-8 flex justify-center relative z-10">
          <div className="text-xl flex flex-row gap-1"><BrainCircuitIcon></BrainCircuitIcon> Cognify</div>
      </div>
          <h1 className="text-3xl font-light text-gray-800 tracking-tight">Personal Profile</h1>
          <p className="text-gray-500 mt-2 font-light">
            Helping us tailor your journey to your unique needs.
          </p>
        </div>

        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm  flex flex-col">
          {errorMsg && (
            <p className="text-red-500 text-sm text-center font-light">{errorMsg}</p>
          )}

          <div className="space-y-2">
            <label className="text-sm text-gray-400 ml-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none placeholder-gray-400 text-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Age</label>
              <input
                type="number"
                placeholder="Years"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none placeholder-gray-400 text-gray-500"
              />
              <p className="text-[10px] text-gray-400 leading-tight">
                Used for age-specific screenings (e.g., child vs. adult tools).
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none text-gray-500 placeholder-gray-400"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <p className="text-[10px] text-gray-400 leading-tight">
                Assists in demographic personalization and NLP bias mitigation.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Prior Mental Health History</label>
            <textarea
              placeholder="E.g., History of Anxiety, ADHD, or no prior diagnosis"
              rows={2}
              value={priorMentalHealth}
              onChange={(e) => setPriorMentalHealth(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none resize-none placeholder-gray-400 text-gray-500"
            />
            <p className="text-[10px] text-gray-400 leading-tight">
              Informs initial profiling and specific task recommendations (e.g., Flanker vs. Stroop).
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Daily Routine</label>
            <textarea
              placeholder="Briefly describe your typical day"
              rows={2}
              value={dailyRoutine}
              onChange={(e) => setDailyRoutine(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none resize-none placeholder-gray-400 text-gray-500"
            />
            <p className="text-[10px] text-gray-400 leading-tight">
              Contextualizes journaling prompts and integrates relevant work/life stressors.
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSaveAndContinue}
              disabled={saving}
              className="w-full bg-[#5F7A7B] text-white py-4 rounded-xl hover:bg-[#4D6364] transition-all font-medium cursor-pointer disabled:opacity-60  "
            >
              {saving ? "Saving..." : "Continue to Screening"}
            </button>
          </div>
        </div>
      </div>

       <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

    </div>
  );
}
// app/onboarding/info/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import congnifyLogo from "../../../public/cognify_logo.png";
import { createBrowserClient } from "@supabase/ssr";

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
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-xl space-y-8">
        <div className="flex flex-col items-center text-center">
          <Image src={congnifyLogo} alt="Cognify Logo" width={200} height={200} className="mb-4" />
          <h1 className="text-3xl font-light text-gray-800 tracking-tight">Personal Profile</h1>
          <p className="text-gray-500 mt-2 font-light">
            Helping us tailor your journey to your unique needs.
          </p>
        </div>

        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8">
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
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none placeholder-gray-400"
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
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none placeholder-gray-400"
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
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none resize-none placeholder-gray-400"
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
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none resize-none placeholder-gray-400"
            />
            <p className="text-[10px] text-gray-400 leading-tight">
              Contextualizes journaling prompts and integrates relevant work/life stressors.
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={handleSaveAndContinue}
              disabled={saving}
              className="w-full bg-[#5F7A7B] text-white py-4 rounded-xl hover:bg-[#4D6364] transition-all font-medium cursor-pointer disabled:opacity-60"
            >
              {saving ? "Saving..." : "Continue to Screening"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
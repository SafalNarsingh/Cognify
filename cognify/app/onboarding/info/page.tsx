// app/onboarding/info/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import congnifyLogo from '../../../public/cognify_logo.png';

export default function UserInfoPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center py-12 px-6">
      <div className="w-full max-w-xl space-y-8">
        <div className="flex flex-col items-center text-center">
          <Image src={congnifyLogo} alt="Cognify Logo" width={200} height={200} className="mb-4" />
          <h1 className="text-3xl font-light text-gray-800 tracking-tight">Personal Profile</h1>
          <p className="text-gray-500 mt-2 font-light">Helping us tailor your journey to your unique needs.</p>
        </div>

        <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-sm space-y-8">
            <div className="space-y-2">
            <label className="text-sm text-gray-400 ml-1">Full Name</label>
            <input type="text" placeholder="e.g. John Doe" 
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none" />
          </div>    
          {/* Age & Gender Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Age</label>
              <input type="number" placeholder="Years" className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none" />
              <p className="text-[10px] text-gray-400 leading-tight">Used for age-specific screenings (e.g., child vs. adult tools).</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Gender</label>
              <select className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none text-gray-500">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <p className="text-[10px] text-gray-400 leading-tight">Assists in demographic personalization and NLP bias mitigation.</p>
            </div>
          </div>

          {/* Mental Health History */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Prior Mental Health History</label>
            <textarea 
              placeholder="E.g., History of Anxiety, ADHD, or no prior diagnosis" 
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none resize-none" 
            />
            <p className="text-[10px] text-gray-400 leading-tight">Informs initial profiling and specific task recommendations (e.g., Flanker vs. Stroop).</p>
          </div>

          {/* Daily Routine */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Daily Routine</label>
            <textarea 
              placeholder="Briefly describe your typical day" 
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border-none focus:ring-1 focus:ring-[#5F7A7B] outline-none resize-none" 
            />
            <p className="text-[10px] text-gray-400 leading-tight">Contextualizes journaling prompts and integrates relevant work/life stressors.</p>
          </div>

          <Link href="/onboarding/screening" className="block">
            <button className="w-full bg-[#5F7A7B] text-white py-4 rounded-xl hover:bg-[#4D6364] transition-all font-medium">
              <Link href="/onboarding/screening">Continue to Screening</Link>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
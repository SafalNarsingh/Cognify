// app/auth/signup/page.tsx
import Link from 'next/link';
import congnifyLogo from '../../../public/cognify_logo.png';
import Image from 'next/image';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center px-6">
          <div className="p-8 flex justify-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image
              src={congnifyLogo}
              alt="Description of the image" // 'alt' prop is required
              width={300} // Optional, but recommended for explicit sizing
              height={300} // Optional, but recommended for explicit sizing
            />
        </Link>
      </div>
      <div className="w-full max-w-md bg-white border border-gray-100 p-10 rounded-3xl shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl font-light text-gray-800">Create Account</h2>
        </div>

        <div className="space-y-4">
          <button className="w-full flex items-center justify-center space-x-3 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span className="text-gray-600 font-light">Sign up with Google</span>
          </button>

          <div className="relative py-2 flex items-center justify-center">
             <span className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></span>
             <span className="relative bg-white px-2 text-xs text-gray-400 uppercase">Or use email</span>
          </div>

         <input 
            type="email" 
            placeholder="Email Address" 
            className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent focus:border-[#5F7A7B] outline-none placeholder-gray-400" 
            />
        <input 
            type="password" 
            placeholder="Password" 
            className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent focus:border-[#5F7A7B] outline-none placeholder-gray-400" 
            />
          <Link href="/onboarding/info" className="block w-full">
            <button className="w-full bg-[#5F7A7B] text-white py-3 rounded-xl hover:bg-[#4D6364] transition-colors mt-2 cursor-pointer  ">
              Continue
            </button>
          </Link>

          <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account. <button className="text-[#96bcfa] hover:underline">
                <Link href="/auth">
                    Login
                </Link>
              </button>
            </p>
        </div>
      </div>
    </div>
  );
}
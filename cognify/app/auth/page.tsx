// app/auth/page.tsx
import Link from 'next/link';
import congnifyLogo from '../../public/cognify_logo.png';
import Image from 'next/image';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col">
      {/* Top Corner Logo */}
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

      {/* Auth Card */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm w-full max-w-md">
          <h2 className="text-2xl font-light text-center text-gray-800 mb-8">
            Welcome Back
          </h2>

          <div className="space-y-4">
            {/* Social Login */}
            <button className="w-full flex items-center justify-center space-x-3 border border-gray-200 
                             py-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              <span className="text-gray-600 font-light">Continue with Google</span>
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">Or email</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent 
                           focus:border-[#5F7A7B] focus:bg-white outline-none transition-all"
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent 
                           focus:border-[#5F7A7B] focus:bg-white outline-none transition-all"
              />
            </div>

            <button className="w-full bg-[#5F7A7B] text-white py-3 rounded-xl mt-4 
                             hover:shadow-md transition-shadow duration-200">
              <Link href='../onboarding/info/'>Sign In</Link>
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              New to Cognify? <button className="text-[#5F7A7B] hover:underline">
                <Link href="/auth/signup">
                    Create account
                </Link>
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
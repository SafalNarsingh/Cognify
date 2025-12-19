"use client";
import { useState } from 'react';
import Link from 'next/link';
import congnifyLogo from '../../../public/cognify_logo.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { createBrowserClient } from '@supabase/ssr';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  // Create the client inside the component or a separate lib file
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // EMAIL/PASSWORD SIGN IN
  const handleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || 'Failed to sign in');
    }
    console.log('Sign-in successful:', data);

    // Successful login - redirect to onboarding
    router.push('/onboarding/info');
  } catch (err: any) {
    setErrorMsg(err.message);
  } finally {
    setLoading(false);
  }
  };

    // GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // REMOVED "/auth" from the middle to match your folder structure
        redirectTo: `${window.location.origin}/callback?next=/onboarding/info`,
      },
    });

    if (error) console.error(error);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col">
      <div className="p-8 flex justify-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image src={congnifyLogo} alt="Cognify Logo" width={200} height={200} priority />
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm w-full max-w-md">
          <h2 className="text-2xl font-light text-center text-gray-800 mb-8">Welcome Back</h2>

          <div className="space-y-4">
            {/* FIXED: Changed from next-auth signIn to your handleGoogleLogin */}
            <button 
              onClick={handleGoogleLogin} 
              className="w-full flex items-center justify-center space-x-3 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              <span className="text-gray-600 font-light">Continue with Google</span>
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">Or email</span>
              </div>
            </div>

            {errorMsg && <p className="text-red-500 text-xs text-center">{errorMsg}</p>}

            <div className="space-y-4">
              <input 
                type="email" placeholder="Email Address" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent focus:border-[#5F7A7B] outline-none text-gray-500"
              />
              <input 
                type="password" placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent focus:border-[#5F7A7B] outline-none text-gray-500"
              />
            </div>

            <button 
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-[#5F7A7B] text-white py-3 rounded-xl mt-4 hover:shadow-md disabled:opacity-50 transition-all"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              New to Cognify? <Link href="/auth/signup" className="text-[#5F7A7B] hover:underline">Create account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
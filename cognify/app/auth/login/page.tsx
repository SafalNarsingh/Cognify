"use client";
import { useState } from 'react';
import Link from 'next/link';
import congnifyLogo from '../../../public/cognify_logo.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { createBrowserClient } from '@supabase/ssr';
import { Brain, BrainCircuitIcon } from "lucide-react";

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
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) throw new Error('No authenticated user after sign-in');

      console.log('Sign-in successful:', data);
      // Check onboarding completion flag
      const { data: profile, error: profileErr } = await supabase
        .from('user_profile')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileErr) {
        // If profile missing or query fails, send to info to create it
        console.warn('Profile fetch failed:', profileErr.message);
        router.push('/onboarding/info');
        return;
      }

      // Centralized redirect decision
      if (profile?.onboarding_completed) {
        router.push('/onboarding/dashboard');
      } else {
        router.push('/onboarding/info');
      }
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
        redirectTo: `${window.location.origin}/callback?next=/onboarding/info`,
      },
    });

    if (error) console.error(error);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal Lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-pulse"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Vertical Lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-gray-300 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-gray-300 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Semi-circular animated elements */}
        <div className="absolute top-20 left-10 w-32 h-16 border-2 border-gray-300 rounded-t-full animate-float opacity-40"></div>
        <div className="absolute top-1/3 right-16 w-40 h-20 border-2 border-[#5F7A7B] opacity-20 rounded-b-full animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-12 border-2 border-gray-300 rounded-t-full animate-float opacity-40" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-28 h-14 border-2 border-[#5F7A7B] opacity-20 rounded-b-full animate-float-delayed" style={{ animationDelay: '1s' }}></div>
        
        {/* Additional decorative circles */}
        <div className="absolute top-32 right-32 w-20 h-20 border border-dashed border-gray-300 rounded-full animate-spin-slow opacity-30"></div>
        <div className="absolute bottom-40 left-40 w-16 h-16 border border-dashed border-[#5F7A7B] opacity-20 rounded-full animate-spin-slow" style={{ animationDelay: '3s' }}></div>
        
        {/* Diagonal lines */}
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#5F7A7B] opacity-20 to-transparent transform rotate-12 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent transform -rotate-12 animate-pulse" style={{ animationDelay: '2.5s' }}></div>
      </div>

      <div className="p-8 flex justify-center relative z-10">
        <Link href="/" className="flex items-center space-x-2">
          <div className="text-xl flex flex-row gap-1 pt-20"><BrainCircuitIcon></BrainCircuitIcon> Cognify</div>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20 relative z-10">
        <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm w-full max-w-md relative">
          {/* Subtle decorative elements around the form */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-[#5F7A7B] opacity-20 rounded-tl-xl"></div>
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-[#5F7A7B] opacity-20 rounded-br-xl"></div>
          
          <h2 className="text-2xl font-light text-center text-gray-800 mb-8">Welcome Back</h2>

          <div className="space-y-4">
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
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent focus:border-[#5F7A7B] outline-none text-gray-500 transition-all"
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent focus:border-[#5F7A7B] outline-none text-gray-500 transition-all"
              />
            </div>

            <button 
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-[#5F7A7B] text-white py-3 rounded-xl mt-4 hover:shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              New to Cognify? <Link href="/auth/signup" className="text-[#5F7A7B] hover:underline">Create account</Link>
            </p>
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
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin 20s linear infinite;
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
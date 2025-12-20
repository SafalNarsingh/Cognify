"use client"; // Required for state and event handling

import { useState } from 'react';
import Link from 'next/link';
import congnifyLogo from '../../../public/cognify_logo.png';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    // Basic Validation
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      // Success: Redirect to onboarding or show check email message
      // Note: Supabase usually requires email verification by default
      alert("Registration successful! Please check your email for a verification link.");
      router.push('/auth'); // Redirect to sign-in page
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Redirects to your existing Google API route
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center px-6 relative overflow-hidden">
       <Link href="/" className="flex items-center space-x-2 pb-8">
            <Image
              src={congnifyLogo}
              alt="Cognify Logo"
              width={200}
              height={200}
            />
          </Link>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Horizontal Lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-linear-to-r from-transparent via-gray-300 to-transparent animate-pulse"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-linear-to-r from-transparent via-gray-300 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        
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

      <div className="w-full max-w-md bg-white border border-gray-100 p-10 rounded-3xl shadow-sm relative z-10">
        {/* Subtle decorative elements around the form */}
        <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-[#5F7A7B] opacity-20 rounded-tl-xl"></div>
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-[#5F7A7B] opacity-20 rounded-br-xl"></div>
        
        <div className="flex flex-col items-center mb-8">
         
          <h2 className="text-2xl font-light text-gray-800">Create Account</h2>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center space-x-3 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span className="text-gray-600 font-light">Sign up with Google</span>
          </button>

          <div className="relative py-2 flex items-center justify-center">
            <span className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></span>
            <span className="relative bg-white px-2 text-xs text-gray-400 uppercase">Or use email</span>
          </div>

          {/* Error Message Display */}
          {errorMsg && (
            <p className="text-red-500 text-sm text-center font-light">{errorMsg}</p>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent focus:border-[#5F7A7B] outline-none transition-all text-gray-500" 
            />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent focus:border-[#5F7A7B] outline-none transition-all text-gray-500" 
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent focus:border-[#5F7A7B] outline-none transition-all text-gray-500" 
            />

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#5F7A7B] text-white py-3 rounded-xl hover:bg-[#4D6364] transition-colors mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Creating Account..." : "Continue"}
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link href="/auth/login" className="text-[#5F7A7B] hover:underline">Sign In</Link>
          </p>
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
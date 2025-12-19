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
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md bg-white border border-gray-100 p-10 rounded-3xl shadow-sm">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={congnifyLogo}
              alt="Cognify Logo"
              width={300}
              height={300}
            />
          </Link>
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
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent focus:border-[#5F7A7B] outline-none transition-all" 
            />
            <input 
              type="password" 
              placeholder="Password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent focus:border-[#5F7A7B] outline-none transition-all" 
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F9F9F7] border border-transparent focus:border-[#5F7A7B] outline-none transition-all" 
            />

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-[#5F7A7B] text-white py-3 rounded-xl hover:bg-[#4D6364] transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Continue"}
            </button>
          </form>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link href="/auth/login" className="text-[#5F7A7B] hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
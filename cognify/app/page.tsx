"use client";

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import congnifyLogo from '../public/cognify_logo.png';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check login status on load to show/hide logout button
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkUser();
  }, [supabase]);

  const handleBegin = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('age')
        .eq('id', user.id)
        .single();

      if (profile?.age) {
        router.push('/onboarding/screening');
      } else {
        router.push('/onboarding/info');
      }
    } else {
      router.push('/auth/login');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.refresh(); // Refreshes server components and clears cache
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center px-6 relative">
      
      {/* Logout Button - Only shows if logged in */}
      {isLoggedIn && (
        <button 
          onClick={handleLogout}
          className="absolute top-8 right-8 text-sm text-gray-500 hover:text-red-500 transition-colors font-light cursor-pointer"
        >
          Sign Out
        </button>
      )}

      <div className="max-w-2xl text-center space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <Image
            src={congnifyLogo}
            alt="Cognify Logo"
            width={500}
            height={500}
            priority
          />
        </div>

        <p className="text-lg text-gray-600 leading-relaxed font-light">
          A gentle space for cognitive enhancement. Empowering your mental 
          well-being through structured, science-backed tools.
        </p>

        <button 
          onClick={handleBegin}
          className="mt-8 px-10 py-3 bg-[#5F7A7B] text-white rounded-full 
                     hover:bg-[#4D6364] hover:shadow-lg transition-all duration-300 
                     font-medium tracking-wide shadow-sm cursor-pointer border-none"
        >
          {isLoggedIn ? "Continue Journey" : "Begin Journey"}
        </button>
      </div>
      
      <footer className="absolute bottom-8 text-sm text-gray-400 font-light">
        Clinical Grade Tools • Secure • Private
      </footer>
    </div>
  );
}

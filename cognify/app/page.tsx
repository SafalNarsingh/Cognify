"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, BrainCircuitIcon } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
        .from("profiles")
        .select("age")
        .eq("id", user.id)
        .single();

      if (profile?.age) {
        router.push("/onboarding/screening");
      } else {
        router.push("/onboarding/info");
      }
    } else {
      router.push("/auth/login");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen w-full bg-[#e9e9e9] font-poppins text-black flex flex-col relative overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
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

      {/* Logout */}
      {isLoggedIn && (
        <button
          onClick={handleLogout}
          className="absolute top-8 right-8 text-sm text-gray-500 hover:text-red-500 z-10"
        >
          Sign Out
        </button>
      )}

      <div className="landing_container flex flex-col flex-1 pt-6 px-6 relative z-10">

        {/* Navbar */}
        <div className="flex justify-between items-center font-bold">
          <div className="text-xl flex flex-row gap-1"><BrainCircuitIcon></BrainCircuitIcon> Cognify</div>
          <Link
            href="/auth/login"
            className="text-white bg-black px-4 py-2 rounded-lg self-center hover:bg-gray-800 transition-colors"
          >
            Login
          </Link>
        </div>

        {/* Hero Text */}
        <div className='w-full pt-28 pb-5 flex flex-col justify-center items-center gap-5'> 
          <div className='text-3xl text-center'> 
            <span className='font-bold'> A gentle space </span> for cognitive enhancement.
            <div className='flex flex-row w-full gap-2 justify-center items-center'> 
              <div className='flex flex-row items-center gap-2'> 
                Empowering your mental <Brain/> 
              </div>
              well-being through
            </div> 
            structured, science-backed tools. 
          </div>
          <Button className='px-4 w-fit' onClick={handleBegin}>Get Started</Button>
        </div> 

        {/* Image Section (Below Text) */}
        <div className="w-full flex justify-center relative">
          {/* Lines going through the image */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-full max-w-5xl h-full">
              {/* Diagonal line top-left to bottom-right */}
              <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent transform rotate-12 animate-pulse"></div>
              
              {/* Diagonal line bottom-left to top-right */}
              <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent transform -rotate-12 animate-pulse" style={{ animationDelay: '0.7s' }}></div>
              
              {/* Vertical line through center */}
              <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-indigo-300 to-transparent animate-pulse" style={{ animationDelay: '1.2s' }}></div>
            </div>
          </div>
          
          <div className="relative w-full max-w-5xl h-55 sm:h-75 md:h-96">
            <Image
              src="/brainn.png"
              alt="Brain illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400 relative z-10">
        Clinical Grade Tools • Secure • Private
      </footer>

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
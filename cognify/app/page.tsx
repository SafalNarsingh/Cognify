// app/page.tsx
import Link from 'next/link';
import congnifyLogo from '../public/cognify_logo.png';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9F9F7] flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <Image
              src={congnifyLogo}
              alt="Description of the image" // 'alt' prop is required
              width={500} // Optional, but recommended for explicit sizing
              height={500} // Optional, but recommended for explicit sizing
            />
        </div>

        {/* Description */}
        <p className="text-lg text-gray-600 leading-relaxed font-light">
          A gentle space for cognitive enhancement. Empowering your mental 
          well-being through structured, science-backed tools.
        </p>

        {/* Action Button */}
        <Link href="/auth">
          <button className="mt-8 px-10 py-3 bg-[#5F7A7B] text-white rounded-full 
                           hover:bg-[#4D6364] transition-all duration-300 
                           font-medium tracking-wide shadow-sm cursor-pointer">
            Begin Journey
          </button>
        </Link>
      </div>
      
      {/* Footer subtle note */}
      <footer className="absolute bottom-8 text-sm text-gray-400 font-light">
        Clinical Grade Tools • Secure • Private
      </footer>
    </div>
  );
}
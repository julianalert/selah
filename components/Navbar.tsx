'use client';
import Link from 'next/link';

export const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] py-4 shadow-md">
      <nav className="flex justify-center items-center">
        <Link href="/">
          <img
            src="/candide.svg" // change this to your logo path or external URL
            alt="Candide - AI Movies"
            className="w-20 max-w-full h-auto object-contain"
          />
        </Link>
      </nav>
    </header>
  );
};

// Footer component
export const Footer = () => (
  <footer className="w-full bg-[#0a0a0a] text-gray-600 text-center py-4 mt-8">
    Made with <span role="img" aria-label="orange heart">🧡</span> by{' '}
    <a
      href="https://x.com/juliendvr"
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-orange-400 transition-colors"
    >
      JulienD
    </a>
  </footer>
);


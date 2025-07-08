'use client';
import Link from 'next/link';

export const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black py-4 shadow-md">
      <nav className="flex justify-center items-center">
        <Link href="/">
          <img
            src="/selah.svg" // change this to your logo path or external URL
            alt="Selah - AI Movies"
            className="w-20 max-w-full h-auto object-contain"
          />
        </Link>
      </nav>
    </header>
  );
};


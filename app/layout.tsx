import type { Metadata } from "next";
import { Navbar } from '../components/Navbar'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Watch AI Movies",
  description: "A curated collection of AI-generated short films.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-black">
        <Navbar />
        <div className="pt-20">{children}</div>
      </body>
    </html>
  );
}

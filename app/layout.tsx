import type { Metadata } from "next";
import { Navbar } from '../components/Navbar'
import "./globals.css";



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

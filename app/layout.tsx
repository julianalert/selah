import type { Metadata } from "next";
import { Navbar } from '../components/Navbar'
import Head from 'next/head';
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
      <Head>
        {/* ✅ Beam Analytics script */}
        <script
          src="https://beamanalytics.b-cdn.net/beam.min.js"
          data-token="7f2b903a-306b-4fa5-88f6-4562a121af28"
          async
        ></script>
      </Head>
      <body className="bg-white text-black">
        <Navbar />
        <div className="pt-20">{children}</div>
      </body>
    </html>
  );
}

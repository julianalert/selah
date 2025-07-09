import type { Metadata } from "next";
import { Navbar, Footer } from '../components/Navbar'
import { Inter } from 'next/font/google';
import "./globals.css";


const inter = Inter({ subsets: ['latin'] }); // ✅ already correct

export const metadata: Metadata = {
  title: "Watch AI Movies",
  description: "A curated collection of AI-generated short films.",
  openGraph: {
    title: "Watch AI Movies",
    description: "A curated collection of AI-generated short films.",
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "Watch AI Movies - AI-generated short films thumbnail"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch AI Movies",
    description: "A curated collection of AI-generated short films.",
    images: ["/thumbnail.jpg"]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Beam Analytics script */}
        <script
          src="https://beamanalytics.b-cdn.net/beam.min.js"
          data-token="7f2b903a-306b-4fa5-88f6-4562a121af28"
          async
        ></script>
      </head>
      <body className={inter.className}>
        <Navbar />
        <div className="pt-20">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

import ClientHomePage from './ClientHomePage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Watch AI Movies - Curated AI-Generated Short Films",
  description: "Discover short films made with artificial intelligence. Bold, surreal, beautiful AI-generated movies and series.",
  openGraph: {
    title: "Watch AI Movies - Curated AI-Generated Short Films",
    description: "Discover short films made with artificial intelligence. Bold, surreal, beautiful AI-generated movies and series.",
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
    title: "Watch AI Movies - Curated AI-Generated Short Films",
    description: "Discover short films made with artificial intelligence. Bold, surreal, beautiful AI-generated movies and series.",
    images: ["/thumbnail.png"]
  }
};

export default function HomePage() {
  return <ClientHomePage />;
}
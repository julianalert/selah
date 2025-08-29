import ClientSeriesGridPage from './ClientSeriesGridPage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Series - Watch AI-Generated Series',
  description: 'Discover episodic stories made with artificial intelligence. Bold, surreal, beautiful AI-generated series.',
  openGraph: {
    title: 'AI Series - Watch AI-Generated Series',
    description: 'Discover episodic stories made with artificial intelligence. Bold, surreal, beautiful AI-generated series.',
    images: [
      {
        url: "/thumbnail.png",
        width: 1200,
        height: 630,
        alt: "AI Series - AI-generated episodic content"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Series - Watch AI-Generated Series",
    description: "Discover episodic stories made with artificial intelligence. Bold, surreal, beautiful AI-generated series.",
    images: ["/thumbnail.png"]
  }
};

export default function SeriesPage() {
  return <ClientSeriesGridPage />;
}
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <meta name="robots" content="noindex, nofollow, noarchive" />
      <meta name="googlebot" content="noindex, nofollow, noarchive" />
      {children}
    </>
  );
} 
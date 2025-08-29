import { ClientGenrePage } from './ClientGenrePage';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const genre = decodeURIComponent(slug);
  return {
    title: `${genre} AI Movies`,
    description: `Watch the best AI-generated ${genre} short films.`,
    openGraph: {
      title: `${genre} AI Movies`,
      description: `Watch the best AI-generated ${genre} short films.`,
      images: [
        {
          url: "/thumbnail.png",
          width: 1200,
          height: 630,
          alt: `${genre} AI Movies - AI-generated short films thumbnail`
        }
      ],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${genre} AI Movies`,
      description: `Watch the best AI-generated ${genre} short films.`,
      images: ["/thumbnail.png"]
    }
  };
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ClientGenrePage slug={slug} />;
}
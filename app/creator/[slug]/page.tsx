import { ClientCreatorPage } from './ClientCreatorPage';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const creator = decodeURIComponent(slug);
  const capitalizedCreator = creator.charAt(0).toUpperCase() + creator.slice(1);
  
  return {
    title: `${capitalizedCreator} - AI Short Films`,
    description: `Watch all AI-generated short films created by ${capitalizedCreator}.`,
    openGraph: {
      title: `${capitalizedCreator} - AI Short Films`,
      description: `Watch all AI-generated short films created by ${capitalizedCreator}.`,
      images: [
        {
          url: "/thumbnail.png",
          width: 1200,
          height: 630,
          alt: `${capitalizedCreator} - AI Short Films`
        }
      ],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${capitalizedCreator} - AI Short Films`,
      description: `Watch all AI-generated short films created by ${capitalizedCreator}.`,
      images: ["/thumbnail.png"]
    }
  };
}

export default async function CreatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ClientCreatorPage slug={slug} />;
} 
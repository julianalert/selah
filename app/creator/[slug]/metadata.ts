export function generateMetadata({ params }: { params: { slug: string } }) {
  const creator = decodeURIComponent(params.slug);
  const capitalizedCreator = creator.charAt(0).toUpperCase() + creator.slice(1);
  
  return {
    title: `AI Films by ${capitalizedCreator} - AI Short Films`,
    description: `Watch all AI-generated short films created by ${capitalizedCreator}.`,
    openGraph: {
      title: `AI Films by ${capitalizedCreator}`,
      description: `Watch all AI-generated short films created by ${capitalizedCreator}.`,
      images: [
        {
          url: "/thumbnail.png",
          width: 1200,
          height: 630,
          alt: `AI Films by ${capitalizedCreator} - AI-generated short films thumbnail`
        }
      ],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Films by ${capitalizedCreator}`,
      description: `Watch all AI-generated short films created by ${capitalizedCreator}.`,
      images: ["/thumbnail.png"]
    }
  };
} 
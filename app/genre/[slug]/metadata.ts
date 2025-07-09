export function generateMetadata({ params }: { params: { slug: string } }) {
    const genre = decodeURIComponent(params.slug);
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
  
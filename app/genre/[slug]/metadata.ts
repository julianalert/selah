export function generateMetadata({ params }: { params: { slug: string } }) {
    const genre = decodeURIComponent(params.slug);
    return {
      title: `${genre} AI Movies`,
      description: `Watch the best AI-generated ${genre} short films.`,
    };
  }
  
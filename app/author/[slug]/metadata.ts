import movies from '../../../data/movies.json';

export function generateMetadata({ params }: { params: { slug: string } }) {
  const authorSlug = decodeURIComponent(params.slug).toLowerCase();
  const authorMovies = movies.filter(
    (movie) => movie.creator.toLowerCase().replace(/\s+/g, '-') === authorSlug
  );
  if (authorMovies.length === 0) return {};
  const authorName = authorMovies[0].creator;

  const title = `${authorName} AI Movies`;
  const description = `Browse the best AI movies from ${authorName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: '/thumbnail.png',
          width: 1200,
          height: 630,
          alt: `${authorName} AI Movies - AI-generated short films thumbnail`,
        },
      ],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/thumbnail.png'],
    },
  };
} 
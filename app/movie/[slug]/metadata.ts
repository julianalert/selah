import movies from '../../../data/movies.json';

export function generateMetadata({ params }: { params: { slug: string } }) {
  const movie = movies.find((m) => m.slug === params.slug);
  if (!movie) return {};

  return {
    title: `${movie.title} – AI Short Film`,
    description: movie.description,
    openGraph: {
      images: [movie.thumbnail],
    },
  };
}

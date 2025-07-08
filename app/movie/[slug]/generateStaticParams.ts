import movies from '../../../data/movies.json';

export function generateStaticParams() {
  return movies.map((movie) => ({
    slug: movie.slug,
  }));
}

import movies from '../../../data/movies.json';

export function generateStaticParams() {
  const genresSet = new Set<string>();

  movies.forEach((movie) => {
    movie.genre.forEach((g) => genresSet.add(g.toLowerCase()));
  });

  return Array.from(genresSet).map((slug) => ({ slug }));
}

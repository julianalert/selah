import { supabase } from '../../../lib/supabaseClient';

export async function generateStaticParams() {
  const { data: movies, error } = await supabase
    .from('movies')
    .select('genre');
  if (error || !movies) return [];
  const genresSet = new Set();
  movies.forEach((movie) => {
    if (Array.isArray(movie.genre)) {
      movie.genre.forEach((g) => genresSet.add(g.toLowerCase()));
    }
  });
  return Array.from(genresSet).map((slug) => ({ slug }));
}

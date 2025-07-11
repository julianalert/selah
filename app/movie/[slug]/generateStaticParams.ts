import { supabase } from '../../../lib/supabaseClient';

export async function generateStaticParams() {
  const { data: movies, error } = await supabase
    .from('movies')
    .select('slug');
  if (error || !movies) return [];
  return movies.map((movie) => ({ slug: movie.slug }));
}

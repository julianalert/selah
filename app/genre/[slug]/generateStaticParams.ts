import { supabase } from '../../../lib/supabaseClient';

export async function generateStaticParams() {
  const { data: genres, error } = await supabase
    .from('genres')
    .select('slug');
  if (error || !genres) return [];
  
  return genres.map((genre) => ({ slug: genre.slug }));
}

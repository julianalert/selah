import { supabase } from '../../../lib/supabaseClient';

export async function generateStaticParams() {
  const { data: movies, error } = await supabase
    .from('movies')
    .select('creator');
  if (error || !movies) return [];
  
  const creatorsSet = new Set<string>();
  movies.forEach((movie) => {
    if (Array.isArray(movie.creator)) {
      // Handle array of creators
      movie.creator.forEach((creator) => {
        const creatorSlug = creator.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        creatorsSet.add(creatorSlug);
      });
    } else if (movie.creator) {
      // Handle single creator
      const creatorSlug = movie.creator.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      creatorsSet.add(creatorSlug);
    }
  });
  
  return Array.from(creatorsSet).map((slug) => ({ slug }));
} 
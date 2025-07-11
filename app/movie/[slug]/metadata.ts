import { supabase } from '../../../lib/supabaseClient';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { data: movie, error } = await supabase
    .from('movies')
    .select('*')
    .eq('slug', params.slug)
    .single();
  if (error || !movie) return {};

  return {
    title: `${movie.title} – AI Short Film`,
    description: movie.description,
    openGraph: {
      images: [movie.thumbnail],
    },
  };
}

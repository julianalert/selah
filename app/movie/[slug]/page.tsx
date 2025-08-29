import { ClientMoviePage } from './ClientMoviePage';
import { supabase } from '../../../lib/supabaseClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: movie, error } = await supabase
    .from('movies')
    .select('*')
    .eq('slug', slug)
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

export default async function MoviePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ClientMoviePage slug={slug} />;
}
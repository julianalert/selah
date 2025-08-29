import ClientSeriesPage from './ClientSeriesPage';
import { supabase } from '../../../lib/supabaseClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: series, error } = await supabase
    .from('series')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error || !series) {
    return {
      title: 'Series Not Found - AI Short Films',
      description: 'The requested series could not be found.',
    };
  }

  return {
    title: `${series.title} - AI Series`,
    description: series.description || `Watch the AI-generated series ${series.title}.`,
    openGraph: {
      title: `${series.title} - AI Series`,
      description: series.description || `Watch the AI-generated series ${series.title}.`,
      images: series.thumbnail ? [series.thumbnail] : ["/thumbnail.png"],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: `${series.title} - AI Series`,
      description: series.description || `Watch the AI-generated series ${series.title}.`,
      images: series.thumbnail ? [series.thumbnail] : ["/thumbnail.png"]
    }
  };
}

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ClientSeriesPage slug={slug} />;
}
import { supabase } from '../../../lib/supabaseClient';

export async function generateStaticParams() {
  const { data: creators, error } = await supabase
    .from('creators')
    .select('slug');
  if (error || !creators) return [];
  
  return creators.map((creator) => ({ slug: creator.slug }));
} 
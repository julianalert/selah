'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from 'lib/supabaseClient';

interface Series {
  id: number;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  year?: number;
}

interface Episode {
  id: number;
  title: string;
  slug: string;
  description?: string;
  video_url: string;
  thumbnail?: string;
  year?: number;
  episode_number: number;
}

export default function SeriesPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : Array.isArray(params.slug) ? params.slug[0] : '';
  const [series, setSeries] = useState<Series | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Load series
      const { data: seriesData } = await supabase
        .from('series')
        .select('*')
        .eq('slug', slug)
        .single();
      setSeries(seriesData);
      // Load episodes
      if (seriesData) {
        const { data: episodesData } = await supabase
          .from('episodes')
          .select('*')
          .eq('series_id', seriesData.id)
          .order('episode_number');
        setEpisodes(episodesData || []);
      }
      setLoading(false);
    }
    if (slug) loadData();
  }, [slug]);

  if (loading) {
    return <main className="p-6 max-w-3xl mx-auto">Loading...</main>;
  }
  if (!series) {
    return <main className="p-6 max-w-3xl mx-auto">Series not found.</main>;
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-full md:w-1/3">
          {series.thumbnail ? (
            <Image
              src={series.thumbnail}
              alt={series.title}
              width={400}
              height={225}
              className="rounded-lg w-full object-cover"
            />
          ) : (
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-4xl text-gray-400">🎬</div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{series.title}</h1>
          <p className="text-gray-700 mb-2">{series.description}</p>
          <p className="text-sm text-gray-500">{series.year}</p>
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-4">Episodes</h2>
      <div className="grid grid-cols-1 gap-4">
        {episodes.map(ep => (
          <button
            key={ep.id}
            onClick={() => setSelectedEpisode(ep)}
            className="flex items-center rounded-lg overflow-hidden hover:shadow-lg transition group cursor-pointer"
          >
            <div className="w-32 h-20 relative bg-gray-100 flex-shrink-0 rounded-lg overflow-hidden">
              {ep.thumbnail ? (
                <Image
                  src={ep.thumbnail}
                  alt={ep.title}
                  fill
                  className="object-cover rounded-lg"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-2xl">🎬</div>
              )}
              {/* Play icon overlay on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.5)" />
                  <polygon points="20,16 34,24 20,32" fill="#fff" />
                </svg>
              </div>
            </div>
            <div className="flex-1 p-4 text-left">
              <div className="font-semibold">Ep {ep.episode_number}: {ep.title}</div>
              <div className="text-sm text-gray-500 line-clamp-2">{ep.description}</div>
            </div>
          </button>
        ))}
        {episodes.length === 0 && (
          <div className="text-center text-gray-400 py-8">No episodes yet.</div>
        )}
      </div>
      {/* Modal for episode */}
      {selectedEpisode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={e => {
            // Only close if clicking the backdrop, not the modal content
            if (e.target === e.currentTarget) setSelectedEpisode(null);
          }}
        >
          <div className="bg-gray-900 text-white rounded-lg max-w-xl w-full p-6 relative shadow-lg">
            <button
              onClick={() => setSelectedEpisode(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl"
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-2">Ep {selectedEpisode.episode_number}: {selectedEpisode.title}</h3>
            <div className="aspect-video mb-4">
              <iframe
                src={selectedEpisode.video_url}
                title={selectedEpisode.title}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            </div>
            <p className="mb-2 text-gray-200">{selectedEpisode.description}</p>
            <p className="text-sm text-gray-400">{selectedEpisode.year}</p>
          </div>
        </div>
      )}
    </main>
  );
} 
'use client';

import { useEffect, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { Movie } from '../../../types/Movie';
import { Youtube, Twitter, Instagram, Globe } from 'lucide-react';

interface Creator {
  id: number;
  name: string;
  slug: string;
  avatar?: string;
  bio?: string;
  youtube?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
}

function normalizeMovie(movie: unknown): Movie {
  const m = movie as Record<string, unknown>;
  let creator: string;
  if (Array.isArray(m.creator)) {
    creator = (m.creator as string[]).join(', ');
  } else {
    creator = m.creator as string;
  }
  return {
    id: m.id as number,
    title: m.title as string,
    slug: m.slug as string,
    description: m.description as string,
    thumbnail: m.thumbnail as string,
    videoUrl: (m.videoUrl || m.video_url) as string,
    genre: Array.isArray(m.genre) ? m.genre as string[] : [],
    creator,
    year: m.year as number,
  };
}

export function ClientCreatorPage({ slug }: { slug: string }) {
  const creatorSlug = decodeURIComponent(slug).toLowerCase();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreatorAndMovies() {
      setLoading(true);
      
      // First, get the creator by slug
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('*')
        .eq('slug', creatorSlug)
        .single();

      if (creatorError || !creatorData) {
        setLoading(false);
        return;
      }

      setCreator(creatorData);

      // Then, get all movies by this creator
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .select('*')
        .eq('creator_id', creatorData.id);

      if (!moviesError && moviesData) {
        setMovies(moviesData.map(normalizeMovie));
      }
      
      setLoading(false);
    }

    fetchCreatorAndMovies();
  }, [creatorSlug]);

  if (loading) {
    return <main className="p-6 pt-12 text-center">Loading...</main>;
  }

  if (!creator || movies.length === 0) return notFound();

  return (
    <main className="p-6 pt-8">
      <div className="text-center mb-12">
        {creator.avatar && (
          <div className="flex justify-center mb-4">
            <img
              src={creator.avatar}
              alt={creator.name}
              className="w-24 h-24 rounded-full object-cover shadow-lg"
            />
          </div>
        )}
        <h1 className="text-4xl font-bold mb-2">AI Films by {creator.name}</h1>
        <p className="text-gray-600 text-base max-w-xl mx-auto mb-6">
          {creator.bio ? (
            creator.bio
          ) : (
            <>Watch all short films created by <strong>{creator.name}</strong> — all made with AI.</>
          )}
        </p>
        
        {/* Social Links */}
        {(creator.youtube || creator.twitter || creator.instagram || creator.website) && (
          <div className="flex gap-4 justify-center mt-4">
            {creator.youtube && (
              <a
                href={creator.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-700 transition-colors"
                title="YouTube"
              >
                <Youtube size={20} />
              </a>
            )}
            {creator.twitter && (
              <a
                href={creator.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 transition-colors"
                title="Twitter/X"
              >
                <Twitter size={20} />
              </a>
            )}
            {creator.instagram && (
              <a
                href={creator.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-700 transition-colors"
                title="Instagram"
              >
                <Instagram size={20} />
              </a>
            )}
            {creator.website && (
              <a
                href={creator.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-700 transition-colors"
                title="Website"
              >
                <Globe size={20} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <a
            key={movie.id}
            href={`/movie/${movie.slug}`}
            className="group block cursor-pointer relative"
          >
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={movie.thumbnail}
                alt={movie.title}
                className="w-full aspect-video object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-80 transition-opacity duration-300 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-white opacity-90"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="absolute bottom-2 right-2 z-10">
                <span className="bg-white/90 text-black text-xs font-semibold px-2 py-0.5 rounded-full shadow">
                  {creator.name}
                </span>
              </div>
            </div>
            <h2 className="mt-2 text-lg font-medium text-left">{movie.title}</h2>
          </a>
        ))}
      </div>
    </main>
  );
} 
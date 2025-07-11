'use client';

import { useEffect, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { Movie } from '../../../types/Movie';

function creatorToSlug(creator: string) {
  return creator.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      const { data, error } = await supabase
        .from('movies')
        .select('*');
      if (!error && data) {
        setMovies(data.map(normalizeMovie));
      }
      setLoading(false);
    }
    fetchMovies();
  }, []);

  // Find the original creator name that matches the slug
  const originalCreator = useMemo(() => {
    const allCreators = Array.from(
      new Set(movies.map((m) => m.creator))
    );
    return allCreators.find((c) => creatorToSlug(c) === creatorSlug) || creatorSlug;
  }, [creatorSlug, movies]);

  const filtered = useMemo(() => {
    return movies.filter((movie) => {
      const movieCreator = Array.isArray(movie.creator) 
        ? movie.creator.join(', ') 
        : movie.creator;
      return creatorToSlug(movieCreator) === creatorSlug;
    });
  }, [creatorSlug, movies]);

  if (loading) {
    return <main className="p-6 pt-12 text-center">Loading...</main>;
  }

  if (filtered.length === 0) return notFound();

  const capitalizedCreator =
    originalCreator.charAt(0).toUpperCase() + originalCreator.slice(1);

  return (
    <main className="p-6 pt-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Films by {capitalizedCreator}</h1>
        <p className="text-gray-600 text-base max-w-xl mx-auto mb-6">
          Watch all short films created by <strong>{capitalizedCreator}</strong> — all made with AI.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map((movie) => (
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
                  {capitalizedCreator}
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
'use client';

import { useEffect, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

function genreToSlug(genre: string) {
  return genre.toLowerCase().replace(/[\s/]+/g, '-');
}

export function ClientGenrePage({ slug }: { slug: string }) {
  const genreSlug = decodeURIComponent(slug).toLowerCase();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      const { data, error } = await supabase
        .from('movies')
        .select('*');
      if (!error && data) {
        setMovies(
          data.map((movie: any) => ({
            ...movie,
            creator: Array.isArray(movie.creator) && movie.creator.length === 1 ? movie.creator[0] : movie.creator,
            genre: Array.isArray(movie.genre) ? movie.genre : [],
          }))
        );
      }
      setLoading(false);
    }
    fetchMovies();
  }, []);

  // Find the original genre name that matches the slug
  const originalGenre = useMemo(() => {
    const allGenres = Array.from(
      new Set(movies.flatMap((m) => m.genre))
    );
    return allGenres.find((g) => genreToSlug(g) === genreSlug) || genreSlug;
  }, [genreSlug, movies]);

  const filtered = useMemo(() => {
    return movies.filter((movie) =>
      movie.genre.map((g: string) => genreToSlug(g)).includes(genreSlug)
    );
  }, [genreSlug, movies]);

  if (loading) {
    return <main className="p-6 pt-12 text-center">Loading...</main>;
  }

  if (filtered.length === 0) return notFound();

  const capitalizedGenre =
    originalGenre.charAt(0).toUpperCase() + originalGenre.slice(1);

  return (
    <main className="p-6 pt-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">{capitalizedGenre} AI Movies</h1>
        <p className="text-gray-600 text-base max-w-xl mx-auto mb-6">
          Watch the best short films in the <strong>{capitalizedGenre}</strong> genre — all created with AI.
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
                  {capitalizedGenre}
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

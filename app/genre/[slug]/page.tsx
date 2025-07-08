'use client';

import { useMemo } from 'react';
import { notFound } from 'next/navigation';
import movies from '../../../data/movies.json';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function GenrePage({ params }: PageProps) {
  const genreSlug = decodeURIComponent(params.slug).toLowerCase();

  const filtered = useMemo(() => {
    return movies.filter((movie) =>
      movie.genre.map((g) => g.toLowerCase()).includes(genreSlug)
    );
  }, [genreSlug]);

  if (filtered.length === 0) return notFound();

  const capitalizedGenre =
    genreSlug.charAt(0).toUpperCase() + genreSlug.slice(1);

  return (
    <main className="p-6 pt-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">{capitalizedGenre} Movies</h1>
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
            </div>
            <h2 className="mt-2 text-lg font-medium text-center">{movie.title}</h2>
          </a>
        ))}
      </div>
    </main>
  );
}

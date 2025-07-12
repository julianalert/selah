'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { Movie } from '../../../types/Movie';

interface Genre {
  id: number;
  name: string;
  slug: string;
  description?: string;
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

export function ClientGenrePage({ slug }: { slug: string }) {
  const genreSlug = decodeURIComponent(slug).toLowerCase();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genre, setGenre] = useState<Genre | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGenreAndMovies() {
      setLoading(true);
      
      // First, get the genre by slug
      const { data: genreData, error: genreError } = await supabase
        .from('genres')
        .select('*')
        .eq('slug', genreSlug)
        .single();

      if (genreError || !genreData) {
        setLoading(false);
        return;
      }

      setGenre(genreData);

      // Then, get all movies for this genre using the junction table
      const { data: moviesData, error: moviesError } = await supabase
        .from('movie_genres')
        .select(`
          movie_id,
          movies (*)
        `)
        .eq('genre_id', genreData.id);

      if (!moviesError && moviesData) {
        // Extract the movie data from the join result
        const movieData = moviesData
          .map(item => item.movies)
          .filter(movie => movie !== null);
        
        setMovies(movieData.map(normalizeMovie));
      }
      
      setLoading(false);
    }

    fetchGenreAndMovies();
  }, [genreSlug]);

  if (loading) {
    return <main className="p-6 pt-12 text-center">Loading...</main>;
  }

  if (!genre || movies.length === 0) return notFound();

  return (
    <main className="p-6 pt-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">{genre.name} AI Movies</h1>
        <p className="text-gray-600 text-base max-w-xl mx-auto mb-6">
          Watch the best short films in the <strong>{genre.name}</strong> genre — all created with AI.
        </p>
      </div>

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
                  {genre.name}
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

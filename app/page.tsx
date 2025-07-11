'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Movie } from '../types/Movie';
import { MovieThumbnail } from '../components/MovieThumbnail';
import { GenreRow } from '../components/GenreRow';

function getRandomMovies(movies: Movie[], count: number): Movie[] {
  const shuffled = [...movies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function genreToSlug(genre: string) {
  return genre.toLowerCase().replace(/[\s/]+/g, '-');
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

export default function HomePage() {
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

  const genres = Array.from(
    new Set(movies.flatMap((m) => m.genre.map((g: string) => g.toLowerCase())))
  );

  const featured = getRandomMovies(movies, 4);

  if (loading) {
    return <main className="p-6 pt-12 text-center">Loading...</main>;
  }

  return (
    <main className="p-6 pt-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Watch AI Movies</h1>
        <p className="text-gray-600 text-base max-w-xl mx-auto mb-6">
          Discover short films made with artificial intelligence. <br />
          Bold, surreal, beautiful.
        </p>
        <div className="flex justify-center flex-wrap gap-2 mb-4">
          {genres.map((genre) => (
            <a
              key={genre}
              href={`/genre/${genreToSlug(genre)}`}
              className="px-3 py-1 rounded-full text-sm"
              style={{ backgroundColor: '#374151', color: 'white' }}
            >
              {genre}
            </a>
          ))}
        </div>
      </div>

      {/* Featured AI Movies */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Featured AI Movies</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {featured.map((movie) => (
            <MovieThumbnail key={movie.id} movie={movie} large />
          ))}
        </div>
      </section>

      {/* Genre Rows */}
      <div className="space-y-10">
        {genres.map((genre) => {
          const genreMovies = movies.filter((m) =>
            m.genre.map((g: string) => g.toLowerCase()).includes(genre)
          );
          if (genreMovies.length === 0) return null;
          return (
            <GenreRow key={genre} genre={genre} movies={genreMovies} />
          );
        })}
      </div>
    </main>
  );
}

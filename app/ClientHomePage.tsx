'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Movie } from '../types/Movie';
import { MovieThumbnail } from '../components/MovieThumbnail';
import { GenreRow } from '../components/GenreRow';

interface Genre {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

function getRandomMovies(movies: Movie[], count: number): Movie[] {
  const shuffled = [...movies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
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

export default function ClientHomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genreMovies, setGenreMovies] = useState<Record<number, Movie[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      // Fetch all movies
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .select('*');
      
      // Fetch all genres
      const { data: genresData, error: genresError } = await supabase
        .from('genres')
        .select('*')
        .order('name');

      if (!moviesError && moviesData) {
        setMovies(moviesData.map(normalizeMovie));
      }
      
      if (!genresError && genresData) {
        setGenres(genresData);
        
        // Fetch movies for each genre using the junction table
        const genreMoviesMap: Record<number, Movie[]> = {};
        
        for (const genre of genresData) {
          const { data: genreMoviesData } = await supabase
            .from('movie_genres')
            .select(`
              movies (*)
            `)
            .eq('genre_id', genre.id);
          
          if (genreMoviesData) {
            const moviesForGenre = genreMoviesData
              .map(item => item.movies)
              .filter(movie => movie !== null)
              .map(normalizeMovie);
            
            genreMoviesMap[genre.id] = moviesForGenre;
          }
        }
        
        setGenreMovies(genreMoviesMap);
      }
      
      setLoading(false);
    }
    fetchData();
  }, []);

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
              key={genre.id}
              href={`/genre/${genre.slug}`}
              className="px-3 py-1 rounded-full text-sm"
              style={{ backgroundColor: '#374151', color: 'white' }}
            >
              {genre.name}
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
          const moviesForGenre = genreMovies[genre.id] || [];
          if (moviesForGenre.length === 0) return null;
          return (
            <GenreRow key={genre.id} genre={genre} movies={moviesForGenre} />
          );
        })}
      </div>
    </main>
  );
}

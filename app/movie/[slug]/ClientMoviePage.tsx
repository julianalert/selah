'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Rating from '../../../components/Rating';
import { supabase } from '../../../lib/supabaseClient';
import { Movie } from '../../../types/Movie';

interface Creator {
  id: number;
  name: string;
  slug: string;
}

interface Genre {
  id: number;
  name: string;
  slug: string;
}

export function ClientMoviePage({ slug }: { slug: string }) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [related, setRelated] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      setLoading(true);
      // Fetch the movie by slug
      const { data: movieData, error: movieError } = await supabase
        .from('movies')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (!movieError && movieData) {
        const normalizedMovie = normalizeMovie(movieData);
        setMovie(normalizedMovie);
        
        // Fetch creator data if creator_id exists
        if (movieData.creator_id) {
          const { data: creatorData, error: creatorError } = await supabase
            .from('creators')
            .select('*')
            .eq('id', movieData.creator_id)
            .single();
          if (!creatorError && creatorData) {
            setCreator(creatorData);
          }
        }

        // Fetch genres from junction table
        const { data: genreData, error: genreError } = await supabase
          .from('movie_genres')
          .select(`
            genres (
              id,
              name,
              slug
            )
          `)
          .eq('movie_id', movieData.id);
        
        if (!genreError && genreData) {
          const movieGenres = genreData
            .map(item => item.genres as any)
            .filter(Boolean) as Genre[];
          setGenres(movieGenres);
        }
        
        // Fetch related movies (same genres, different id)
        if (genreData && genreData.length > 0) {
          const genreIds = genreData.map(item => (item.genres as any)?.id).filter(Boolean);
          
          // Get movies that share any of the same genres
          const { data: relatedData } = await supabase
            .from('movie_genres')
            .select(`
              movie_id,
              genres!inner (
                id
              )
            `)
            .in('genres.id', genreIds)
            .neq('movie_id', movieData.id);
          
          if (relatedData && relatedData.length > 0) {
            const relatedMovieIds = [...new Set(relatedData.map(item => item.movie_id))];
            
            // Fetch the actual movie data for related movies
            const { data: relatedMoviesData } = await supabase
              .from('movies')
              .select('*')
              .in('id', relatedMovieIds)
              .limit(4);
            
            if (relatedMoviesData) {
              const relatedMovies: Movie[] = (relatedMoviesData as unknown[])
                .map(normalizeMovie);
              setRelated(relatedMovies);
            }
          }
        }
      }
      setLoading(false);
    }
    fetchMovie();
  }, [slug]);

  if (loading) {
    return <main className="p-6 pt-12 text-center">Loading...</main>;
  }

  if (!movie) return notFound();

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
      
      <div className="aspect-video mb-4">
        <iframe
          src={movie.videoUrl}
          title={movie.title}
          className="w-full h-full rounded-lg"
          allowFullScreen
        />
      </div>
      <p className="text-gray-700 mb-2">{movie.description}</p>
      <p className="text-sm text-gray-500">
        Created by <strong>
          {creator ? (
            <Link
              href={`/creator/${creator.slug}`}
              className="underline hover:text-orange-400 transition-colors"
            >
              {creator.name}
            </Link>
          ) : (
            movie.creator
          )}
        </strong> • {movie.year} •{' '}
        {genres.map((genre, i) => (
          <span key={genre.id}>
            <Link
              href={`/genre/${genre.slug}`}
              className="underline hover:text-orange-400 transition-colors"
            >
              {genre.name}
            </Link>
            {i < genres.length - 1 && ', '}
          </span>
        ))}
      </p>

      <div className="my-6">
        <Rating movieSlug={slug} />
      </div>

      {/* More Like This */}
      {genres.length > 0 && related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">More like this</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((relatedMovie) => (
              <Link
                key={relatedMovie.id}
                href={`/movie/${relatedMovie.slug}`}
                className="group block"
              >
                <img
                  src={relatedMovie.thumbnail}
                  alt={relatedMovie.title}
                  className="rounded-lg w-full aspect-video object-cover group-hover:scale-105 transition-transform"
                />
                <h3 className="mt-2 text-sm font-medium">{relatedMovie.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
  );
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

function genreToSlug(genre: string) {
  return genre.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

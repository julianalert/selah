'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Rating from '../../../components/Rating';
import { supabase } from '../../../lib/supabaseClient';
import { Movie } from '../../../types/Movie';

export function ClientMoviePage({ slug }: { slug: string }) {
  const [movie, setMovie] = useState<Movie | null>(null);
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
        // Fetch related movies (same genre, different id)
        if (normalizedMovie.genre.length > 0) {
          const { data: relatedData } = await supabase
            .from('movies')
            .select('*')
            .neq('id', normalizedMovie.id);
          if (relatedData) {
            const relatedMovies: Movie[] = (relatedData as unknown[])
              .map(normalizeMovie)
              .filter((m) =>
                m.genre && m.genre.some((g: string) => normalizedMovie.genre.includes(g))
              )
              .slice(0, 4);
            setRelated(relatedMovies);
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
          <Link
            href={`/creator/${creatorToSlug(movie.creator)}`}
            className="underline hover:text-orange-400 transition-colors"
          >
            {movie.creator}
          </Link>
        </strong> • {movie.year} •{' '}
        {movie.genre.map((g, i) => (
          <>
            <Link
              key={g}
              href={`/genre/${genreToSlug(g)}`}
              className="underline hover:text-orange-400 transition-colors"
            >
              {g}
            </Link>
            {i < movie.genre.length - 1 && ', '}
          </>
        ))}
      </p>

      <div className="my-6">
        <Rating movieSlug={slug} />
      </div>

      {/* More Like This */}
      {movie.genre.length > 0 && related.length > 0 && (
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

function creatorToSlug(creator: string) {
  return creator.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

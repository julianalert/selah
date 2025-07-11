'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Rating from '../../../components/Rating';
import { supabase } from '../../../lib/supabaseClient';

export function ClientMoviePage({ slug }: { slug: string }) {
  const [movie, setMovie] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
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
        // Normalize creator and genre
        const normalizedMovie = {
          ...movieData,
          creator: Array.isArray(movieData.creator) && movieData.creator.length === 1 ? movieData.creator[0] : movieData.creator,
          genre: Array.isArray(movieData.genre) ? movieData.genre : [],
        };
        setMovie(normalizedMovie);
        // Fetch related movies (same genre, different id)
        if (normalizedMovie.genre.length > 0) {
          const { data: relatedData } = await supabase
            .from('movies')
            .select('*')
            .neq('id', normalizedMovie.id);
          if (relatedData) {
            const relatedMovies = relatedData.filter((m: any) =>
              m.genre && m.genre.some((g: string) => normalizedMovie.genre.includes(g))
            ).slice(0, 4);
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
          src={movie.video_url}
          title={movie.title}
          className="w-full h-full rounded-lg"
          allowFullScreen
        />
      </div>
      <p className="text-gray-700 mb-2">{movie.description}</p>
      <p className="text-sm text-gray-500">
        Created by <strong>{movie.creator}</strong> • {movie.year} •{' '}
        {movie.genre.join(', ')}
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

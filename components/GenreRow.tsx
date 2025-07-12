import React, { useRef, useState, useEffect } from 'react';
import { Movie } from '../types/Movie';
import { MovieThumbnail } from './MovieThumbnail';

interface Genre {
  id: number;
  name: string;
  slug: string;
}

interface GenreRowProps {
  genre: Genre;
  movies: Movie[];
}

export function GenreRow({ genre, movies }: GenreRowProps) {
  const [visibleCount, setVisibleCount] = useState(10);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (visibleCount >= movies.length) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 10, movies.length));
        }
      },
      { root: null, rootMargin: '0px', threshold: 1.0 }
    );
    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [visibleCount, movies.length]);

  // Reset visibleCount if genre or movies change
  useEffect(() => {
    setVisibleCount(10);
  }, [genre, movies]);

  return (
    <section>
      <div className="flex items-center mb-3">
        <a
          href={`/genre/${genre.slug}`}
          className="text-xl font-bold hover:underline mr-2"
        >
          {genre.name}
        </a>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {movies.slice(0, visibleCount).map((movie) => (
          <MovieThumbnail key={movie.id} movie={movie} />
        ))}
        {/* Sentinel for infinite scroll */}
        {visibleCount < movies.length && (
          <div ref={sentinelRef} style={{ minWidth: 1, minHeight: 1 }} />
        )}
      </div>
    </section>
  );
} 
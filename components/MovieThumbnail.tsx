import React from 'react';
import type { Movie } from '../types/Movie';

export function MovieThumbnail({ movie, large = false }: { movie: Movie; large?: boolean }) {
  return (
    <a
      href={`/movie/${movie.slug}`}
      className={`group block cursor-pointer relative ${large ? 'min-w-[300px] max-w-[360px]' : 'min-w-[200px] max-w-[260px]'}`}
      style={{ width: large ? '320px' : '220px' }}
    >
      <div className="relative overflow-hidden rounded-lg">
        {/* Genre Badges */}
        <div className="absolute bottom-2 right-2 flex flex-wrap gap-1 z-10">
          {movie.genre.map((g) => (
            <span
              key={g}
              className="bg-white/90 text-black text-xs font-semibold px-2 py-0.5 rounded-full shadow"
            >
              {g}
            </span>
          ))}
        </div>
        <img
          src={movie.thumbnail}
          alt={movie.title}
          className={`w-full aspect-video object-cover transition-transform duration-200 group-hover:scale-105 ${large ? 'h-[180px]' : ''}`}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-80 transition-opacity duration-300 flex items-center justify-center">
          <svg
            className={`text-white opacity-90 ${large ? 'w-16 h-16' : 'w-12 h-12'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <h2 className={`mt-2 font-medium truncate ${large ? 'text-2xl' : 'text-lg'}`} title={movie.title}>
        {movie.title}
      </h2>
    </a>
  );
} 
'use client';
import movies from '../data/movies.json';
const genres = Array.from(
  new Set(movies.flatMap((m) => m.genre.map((g) => g.toLowerCase())))
);

export default function HomePage() {

  return (
    <main className="p-6 pt-12">
  <div className="text-center mb-8">
    <h1 className="text-4xl font-bold mb-4">Watch AI Movies</h1>
    <p className="text-gray-600 text-base max-w-xl mx-auto mb-6">
    Discover short films made with artificial intelligence. <br />
    Bold, surreal, beautiful.
  </p>

    <div className="flex justify-center flex-wrap gap-2">
      {genres.map((genre) => (
        <a
          key={genre}
          href={`/genre/${encodeURIComponent(genre)}`}
          className="px-3 py-1 rounded-full text-sm bg-black hover:bg-black hover:text-white transition-colors"
        >
          {genre}
        </a>
      ))}
    </div>
  </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <a
          key={movie.id}
          href={`/movie/${movie.slug}`}
          className="group block cursor-pointer relative"
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
              className="w-full aspect-video object-cover transition-transform duration-200 group-hover:scale-105"
            />
            
            {/* Overlay */}
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
        
          <h2 className="mt-2 text-lg font-medium">{movie.title}</h2>
        </a>
        
        ))}
      </div>

      
    </main>
  );
}

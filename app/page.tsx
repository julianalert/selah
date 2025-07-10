'use client';
import movies from '../data/movies.json';
import { Movie } from '../types/Movie';
import { MovieThumbnail } from '../components/MovieThumbnail';

const genres = Array.from(
  new Set((movies as Movie[]).flatMap((m) => m.genre.map((g) => g.toLowerCase())))
);

function getRandomMovies(movies: Movie[], count: number): Movie[] {
  const shuffled = [...movies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function HomePage() {
  const featured = getRandomMovies(movies as Movie[], 4);

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
              href={`/genre/${encodeURIComponent(genre)}`}
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
            <MovieThumbnail key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Genre Rows */}
      <div className="space-y-10">
        {genres.map((genre) => {
          const genreMovies = (movies as Movie[]).filter((m) =>
            m.genre.map((g) => g.toLowerCase()).includes(genre)
          );
          if (genreMovies.length === 0) return null;
          return (
            <section key={genre}>
              <div className="flex items-center mb-3">
                <a
                  href={`/genre/${encodeURIComponent(genre)}`}
                  className="text-xl font-bold hover:underline mr-2"
                >
                  {genre.charAt(0).toUpperCase() + genre.slice(1)}
                </a>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {genreMovies.map((movie) => (
                  <MovieThumbnail key={movie.id} movie={movie} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

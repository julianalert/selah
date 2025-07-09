import movies from '../../../data/movies.json';
import { notFound } from 'next/navigation';

export default function AuthorPage({ params }: { params: { slug: string } }) {
  const authorSlug = decodeURIComponent(params.slug).toLowerCase();
  const authorMovies = movies.filter(
    (movie) => movie.creator.toLowerCase().replace(/\s+/g, '-') === authorSlug
  );

  if (authorMovies.length === 0) return notFound();

  const authorName = authorMovies[0].creator;

  return (
    <main className="p-6 pt-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{authorName}</h1>
      <h2 className="text-xl font-semibold mb-4">Movies by {authorName}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {authorMovies.map((movie) => (
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
            </div>
            <h3 className="mt-2 text-lg font-medium text-left">{movie.title}</h3>
          </a>
        ))}
      </div>
    </main>
  );
} 
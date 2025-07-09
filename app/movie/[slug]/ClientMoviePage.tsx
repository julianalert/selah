import movies from '../../../data/movies.json';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Rating from '../../../components/Rating';

export function ClientMoviePage({ slug }: { slug: string }) {
  const movie = movies.find((m) => m.slug === slug);

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
        Created by <Link href={`/author/${movie.creator.toLowerCase().replace(/\s+/g, '-')}`} className="underline hover:text-orange-400 transition-colors"><strong>{movie.creator}</strong></Link> • {movie.year} •{' '}
        {movie.genre.join(', ')}
      </p>

      <div className="my-6">
        <Rating movieSlug={slug} />
      </div>

      {/* More Like This */}
      {movie.genre.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">More like this</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {movies
              .filter(
                (m) =>
                  m.id !== movie.id &&
                  m.genre.some((g) => movie.genre.includes(g))
              )
              .slice(0, 4)
              .map((related) => (
                <Link
                  key={related.id}
                  href={`/movie/${related.slug}`}
                  className="group block"
                >
                  <img
                    src={related.thumbnail}
                    alt={related.title}
                    className="rounded-lg w-full aspect-video object-cover group-hover:scale-105 transition-transform"
                  />
                  <h3 className="mt-2 text-sm font-medium">{related.title}</h3>
                </Link>
              ))}
          </div>
        </div>
      )}
    </main>
  );
}

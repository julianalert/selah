'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from 'lib/supabaseClient';

interface Series {
  id: number;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  year?: number;
}

function getRandomSeries(series: Series[], count: number): Series[] {
  const shuffled = [...series].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function ClientSeriesGridPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeries() {
      setLoading(true);
      const { data } = await supabase
        .from('series')
        .select('*')
        .order('title');
      setSeries(data || []);
      setLoading(false);
    }
    loadSeries();
  }, []);

  const featured = getRandomSeries(series, 4);

  if (loading) {
    return <main className="p-6 pt-12 text-center">Loading...</main>;
  }

  return (
    <main className="p-6 pt-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Watch AI Series</h1>
        <p className="text-gray-600 text-base max-w-xl mx-auto mb-6">
          Discover episodic stories made with artificial intelligence.<br />
          Bold, surreal, beautiful.
        </p>
      </div>

      {/* Featured AI Series */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Featured AI Series</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {featured.map((s) => (
            <Link
              key={s.id}
              href={`/series/${s.slug}`}
              className="group block min-w-[300px] max-w-[400px]"
            >
              <div className="aspect-video rounded-lg overflow-hidden relative mb-2">
                {s.thumbnail ? (
                  <Image
                    src={s.thumbnail}
                    alt={s.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-gray-200 text-4xl text-gray-400">🎬</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.5)" />
                    <polygon points="20,16 34,24 20,32" fill="#fff" />
                  </svg>
                </div>
              </div>
              <div className="font-semibold text-lg mb-1 truncate">{s.title}</div>
              <div className="text-sm text-gray-500">{s.year}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* All Series Grid */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">All Series</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {series.map(s => (
            <Link
              key={s.id}
              href={`/series/${s.slug}`}
              className="group block"
            >
              <div className="aspect-video rounded-lg overflow-hidden relative mb-2">
                {s.thumbnail ? (
                  <Image
                    src={s.thumbnail}
                    alt={s.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-gray-200 text-4xl text-gray-400">🎬</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.5)" />
                    <polygon points="20,16 34,24 20,32" fill="#fff" />
                  </svg>
                </div>
              </div>
              <div className="font-semibold text-lg mb-1 truncate">{s.title}</div>
              <div className="text-sm text-gray-500">{s.year}</div>
            </Link>
          ))}
          {series.length === 0 && (
            <div className="text-center text-gray-400 py-12 col-span-full">No series found.</div>
          )}
        </div>
      </section>
    </main>
  );
}

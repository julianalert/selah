'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';

interface Series {
  id: number;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  year?: number;
}

export default function AdminSeriesPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSeries() {
      setLoading(true);
      const { data } = await supabase
        .from('series')
        .select('*')
        .order('title');
      if (data) setSeries(data);
      setLoading(false);
    }
    loadSeries();
  }, []);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Series</h1>
        <Link
          href="/admin/series/new"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add New Series
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.map((s) => (
          <div key={s.id} className="border border-gray-700 rounded-lg overflow-hidden">
            <div className="aspect-video relative bg-gray-800">
              {s.thumbnail ? (
                <Image
                  src={s.thumbnail}
                  alt={s.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-4xl">
                  🎬
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400 mb-2">{s.year || ''}</p>
              <p className="text-sm text-gray-300 mb-4 line-clamp-2">{s.description || 'No description'}</p>
              <Link
                href={`/admin/series/${s.slug}`}
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Edit Series
              </Link>
            </div>
          </div>
        ))}
      </div>
      {series.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">No series found.</div>
      )}
    </main>
  );
} 
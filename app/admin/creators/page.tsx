'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';

interface Creator {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
}

export default function EditCreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCreators() {
      setLoading(true);
      
      // Load creators
      const { data: creatorsData } = await supabase
        .from('creators')
        .select('*')
        .order('name');
      
      if (creatorsData) {
        setCreators(creatorsData);
      }

      setLoading(false);
    }

    loadCreators();
  }, []);

  if (loading) {
    return (
      <main className="p-6 max-w-6xl mx-auto">
        <div className="text-center">Loading creators...</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Creators</h1>
        <Link
          href="/admin"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Admin
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((creator) => (
          <div key={creator.id} className="border border-gray-700 rounded-lg overflow-hidden">
            <div className="aspect-square relative bg-gray-800">
              {creator.avatar ? (
                <Image
                  src={creator.avatar}
                  alt={creator.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-4xl">
                  👤
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{creator.name}</h3>
              <p className="text-sm text-gray-400 mb-2">
                @{creator.slug}
              </p>
              <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                {creator.bio || 'No bio available'}
              </p>
              <div className="flex gap-2 mb-4">
                {creator.twitter && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    Twitter
                  </span>
                )}
                {creator.instagram && (
                  <span className="text-xs bg-pink-500 text-white px-2 py-1 rounded">
                    Instagram
                  </span>
                )}
                {creator.website && (
                  <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                    Website
                  </span>
                )}
              </div>
              <Link
                href={`/admin/creators/${creator.slug}`}
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Edit Creator
              </Link>
            </div>
          </div>
        ))}
      </div>

      {creators.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No creators found.</p>
        </div>
      )}
    </main>
  );
} 
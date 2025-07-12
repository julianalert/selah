'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseClient';

interface Movie {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  year: number;
  creator_id: number | null;
}

interface Creator {
  id: number;
  name: string;
}

export default function EditMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMovies() {
      setLoading(true);
      
      // Load movies
      const { data: moviesData } = await supabase
        .from('movies')
        .select('*')
        .order('title');
      
      if (moviesData) {
        setMovies(moviesData);
      }

      // Load creators for display
      const { data: creatorsData } = await supabase
        .from('creators')
        .select('id, name')
        .order('name');
      
      if (creatorsData) {
        setCreators(creatorsData);
      }

      setLoading(false);
    }

    loadMovies();
  }, []);

  function getCreatorName(creatorId: number | null): string {
    if (!creatorId) return 'Unknown';
    const creator = creators.find(c => c.id === creatorId);
    return creator ? creator.name : 'Unknown';
  }

  if (loading) {
    return (
      <main className="p-6 max-w-6xl mx-auto">
        <div className="text-center">Loading movies...</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Movies</h1>
        <Link
          href="/admin"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Admin
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map((movie) => (
          <div key={movie.id} className="border border-gray-700 rounded-lg overflow-hidden">
            <div className="aspect-video relative">
              <Image
                src={movie.thumbnail}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{movie.title}</h3>
              <p className="text-sm text-gray-400 mb-2">
                {movie.year} • {getCreatorName(movie.creator_id)}
              </p>
              <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                {movie.description || 'No description available'}
              </p>
              <Link
                href={`/admin/edit/${movie.slug}`}
                className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Edit Movie
              </Link>
            </div>
          </div>
        ))}
      </div>

      {movies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No movies found.</p>
        </div>
      )}
    </main>
  );
} 
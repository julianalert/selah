'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

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

interface Genre {
  id: number;
  name: string;
  slug: string;
}

interface MovieData {
  id: number;
  title: string;
  slug: string;
  description: string;
  video_url: string;
  thumbnail: string;
  year: number;
  creator_id: number | null;
}

export default function EditMoviePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [existingCreators, setExistingCreators] = useState<Creator[]>([]);
  const [existingGenres, setExistingGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    year: new Date().getFullYear(),
    creatorName: '',
    creatorSlug: '',
    creatorBio: '',
    creatorAvatar: '',
    creatorTwitter: '',
    creatorInstagram: '',
    creatorWebsite: '',
    genres: [] as string[],
    newGenres: [] as string[],
    selectedCreatorId: null as number | null
  });

  // Load movie data and existing creators/genres
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      // Load existing creators and genres
      const [creatorsResponse, genresResponse] = await Promise.all([
        supabase.from('creators').select('*').order('name'),
        supabase.from('genres').select('*').order('name')
      ]);
      
      if (creatorsResponse.data) setExistingCreators(creatorsResponse.data);
      if (genresResponse.data) setExistingGenres(genresResponse.data);

      // Load movie data
      const { data: movieData, error: movieError } = await supabase
        .from('movies')
        .select('*')
        .eq('slug', params.slug)
        .single();

      if (movieError || !movieData) {
        setLoading(false);
        return notFound();
      }

      setMovie(movieData);

      // Load creator data
      let creatorData = null;
      if (movieData.creator_id) {
        const { data: creator } = await supabase
          .from('creators')
          .select('*')
          .eq('id', movieData.creator_id)
          .single();
        
        if (creator) {
          creatorData = creator;
          setCreator(creator);
        }
      }

      // Load movie genres
      const { data: genreData } = await supabase
        .from('movie_genres')
        .select(`
          genres (
            id,
            name,
            slug
          )
        `)
        .eq('movie_id', movieData.id);

      let movieGenresData: Genre[] = [];
      if (genreData) {
        const genres = genreData
          .map(item => (item.genres as unknown as Genre))
          .filter(Boolean);
        movieGenresData = genres;
        setMovieGenres(genres);
      }

      // Populate form data
      setFormData({
        title: movieData.title,
        description: movieData.description || '',
        videoUrl: movieData.video_url || '',
        thumbnail: movieData.thumbnail || '',
        year: movieData.year,
        creatorName: creatorData?.name || '',
        creatorSlug: creatorData?.slug || '',
        creatorBio: creatorData?.bio || '',
        creatorAvatar: creatorData?.avatar || '',
        creatorTwitter: creatorData?.twitter || '',
        creatorInstagram: creatorData?.instagram || '',
        creatorWebsite: creatorData?.website || '',
        genres: movieGenresData.map(g => g.name),
        newGenres: [],
        selectedCreatorId: movieData.creator_id
      });

      setLoading(false);
    }

    loadData();
  }, [params.slug]);

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const movieSlug = generateSlug(formData.title || 'movie');
    const fileExtension = file.name.split('.').pop();
    const filename = `${movieSlug}.${fileExtension}`;
    
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('filename', filename);

    try {
      const response = await fetch('/api/upload-thumbnail', {
        method: 'POST',
        body: uploadData,
      });

      if (response.ok) {
        await response.json();
        setFormData(prev => ({
          ...prev,
          thumbnail: `/thumbnails/${filename}`
        }));
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      if (!movie) throw new Error('Movie not found');

      // 1. Handle creator
      let creatorId: number | undefined;
      
      if (formData.selectedCreatorId) {
        creatorId = formData.selectedCreatorId;
      } else if (formData.creatorName) {
        // Check if creator exists
        const { data: existingCreator } = await supabase
          .from('creators')
          .select('id')
          .eq('slug', formData.creatorSlug)
          .single();

        if (existingCreator) {
          creatorId = existingCreator.id;
        } else {
          // Create new creator
          const { data: newCreator, error: creatorError } = await supabase
            .from('creators')
            .insert({
              name: formData.creatorName,
              slug: formData.creatorSlug,
              bio: formData.creatorBio || null,
              avatar: formData.creatorAvatar || null,
              twitter: formData.creatorTwitter || null,
              instagram: formData.creatorInstagram || null,
              website: formData.creatorWebsite || null
            })
            .select('id')
            .single();

          if (creatorError) throw creatorError;
          creatorId = newCreator.id;
        }
      }

      // 2. Update movie
      const movieSlug = generateSlug(formData.title);
      const movieData = {
        title: formData.title,
        slug: movieSlug,
        description: formData.description,
        video_url: formData.videoUrl,
        thumbnail: formData.thumbnail,
        year: formData.year,
        creator_id: creatorId || null
      };
      
      const { error: movieError } = await supabase
        .from('movies')
        .update(movieData)
        .eq('id', movie.id);

      if (movieError) throw movieError;

      // 3. Handle genres
      // First, remove all existing genre relationships
      await supabase
        .from('movie_genres')
        .delete()
        .eq('movie_id', movie.id);

      // Then add new genre relationships
      const allGenres = [...formData.genres, ...formData.newGenres];
      const genreIds: number[] = [];

      for (const genreName of allGenres) {
        if (!genreName.trim()) continue;

        const genreSlug = generateSlug(genreName);
        
        // Check if genre exists
        const { data: existingGenre } = await supabase
          .from('genres')
          .select('id')
          .eq('slug', genreSlug)
          .single();

        let genreId: number;
        if (existingGenre) {
          genreId = existingGenre.id;
        } else {
          // Create new genre
          const { data: newGenre, error: genreError } = await supabase
            .from('genres')
            .insert({
              name: genreName.trim(),
              slug: genreSlug
            })
            .select('id')
            .single();

          if (genreError) throw genreError;
          genreId = newGenre.id;
        }
        genreIds.push(genreId);
      }

      // Create new movie-genre junctions
      if (genreIds.length > 0) {
        const junctions = genreIds.map(genreId => ({
          movie_id: movie.id,
          genre_id: genreId
        }));

        const { error: junctionError } = await supabase
          .from('movie_genres')
          .insert(junctions);

        if (junctionError) throw junctionError;
      }

      setMessage('Movie updated successfully!');
      
      // Redirect to edit movies list after a short delay
      setTimeout(() => {
        router.push('/admin/edit');
      }, 1500);

    } catch (error) {
      console.error('Error updating movie:', error);
      setMessage('Error updating movie. Please check the console for details.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="p-6 max-w-4xl mx-auto">Loading...</main>;
  }

  if (!movie) {
    return notFound();
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Movie: {movie.title}</h1>
        <button
          onClick={() => router.push('/admin/edit')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Edit Movies
        </button>
      </div>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Movie Details */}
        <div className="p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Movie Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Movie title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                className="w-full p-2 border rounded"
                min="1900"
                max="2030"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Movie description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Video URL *</label>
              <input
                type="url"
                required
                value={formData.videoUrl}
                onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Thumbnail *</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="w-full p-2 border rounded"
                />
                {formData.thumbnail && (
                  <div className="text-sm text-gray-400">
                    Current: {formData.thumbnail}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Creator Details */}
        <div className="p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Creator Details</h2>
          
          {/* Select Existing Creator */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Existing Creator (Optional)</label>
            <select
              value={formData.selectedCreatorId || ''}
              onChange={(e) => {
                const creatorId = e.target.value ? parseInt(e.target.value) : null;
                setFormData({
                  ...formData,
                  selectedCreatorId: creatorId,
                  // Clear new creator fields if selecting existing
                  creatorName: creatorId ? '' : formData.creatorName,
                  creatorSlug: creatorId ? '' : formData.creatorSlug,
                  creatorBio: creatorId ? '' : formData.creatorBio,
                  creatorAvatar: creatorId ? '' : formData.creatorAvatar,
                  creatorTwitter: creatorId ? '' : formData.creatorTwitter,
                  creatorInstagram: creatorId ? '' : formData.creatorInstagram,
                  creatorWebsite: creatorId ? '' : formData.creatorWebsite
                });
              }}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select existing creator --</option>
              {existingCreators.map((creator) => (
                <option key={creator.id} value={creator.id}>
                  {creator.name}
                </option>
              ))}
            </select>
          </div>

          {/* Or Create New Creator */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-4">Or Create New Creator</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Creator Name</label>
                <input
                  type="text"
                  value={formData.creatorName}
                  onChange={(e) => setFormData({
                    ...formData, 
                    creatorName: e.target.value,
                    creatorSlug: generateSlug(e.target.value),
                    selectedCreatorId: null // Clear selection when typing new name
                  })}
                  className="w-full p-2 border rounded"
                  placeholder="Creator name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Creator Slug</label>
                <input
                  type="text"
                  value={formData.creatorSlug}
                  onChange={(e) => setFormData({...formData, creatorSlug: e.target.value})}
                  className="w-full p-2 border rounded"
                  placeholder="creator-slug"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Creator Bio</label>
            <textarea
              value={formData.creatorBio}
              onChange={(e) => setFormData({...formData, creatorBio: e.target.value})}
              className="w-full p-2 border rounded"
              rows={2}
              placeholder="Creator bio"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Avatar URL</label>
              <input
                type="url"
                value={formData.creatorAvatar}
                onChange={(e) => setFormData({...formData, creatorAvatar: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Twitter</label>
              <input
                type="text"
                value={formData.creatorTwitter}
                onChange={(e) => setFormData({...formData, creatorTwitter: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="@username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <input
                type="text"
                value={formData.creatorInstagram}
                onChange={(e) => setFormData({...formData, creatorInstagram: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="@username"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              value={formData.creatorWebsite}
              onChange={(e) => setFormData({...formData, creatorWebsite: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Genres */}
        <div className="p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Genres</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Existing Genres */}
            <div>
              <label className="block text-sm font-medium mb-2">Select Existing Genres</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {existingGenres.map((genre) => (
                  <label key={genre.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.genres.includes(genre.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            genres: [...formData.genres, genre.name]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            genres: formData.genres.filter(g => g !== genre.name)
                          });
                        }
                      }}
                      className="mr-2"
                    />
                    {genre.name}
                  </label>
                ))}
              </div>
            </div>

            {/* New Genres */}
            <div>
              <label className="block text-sm font-medium mb-2">Add New Genres</label>
              <div className="space-y-2">
                {formData.newGenres.map((genre, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={genre}
                      onChange={(e) => {
                        const newGenres = [...formData.newGenres];
                        newGenres[index] = e.target.value;
                        setFormData({...formData, newGenres});
                      }}
                      className="flex-1 p-2 border rounded"
                      placeholder="New genre name"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          newGenres: formData.newGenres.filter((_, i) => i !== index)
                        });
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      newGenres: [...formData.newGenres, '']
                    });
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Genre
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
          >
            {saving ? 'Updating Movie...' : 'Update Movie'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/admin/edit')}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
} 
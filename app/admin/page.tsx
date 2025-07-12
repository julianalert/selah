'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface Creator {
  id: number;
  name: string;
  slug: string;
}

interface Genre {
  id: number;
  name: string;
  slug: string;
}

export default function AdminPage() {
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

  const [existingCreators, setExistingCreators] = useState<Creator[]>([]);
  const [existingGenres, setExistingGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load existing creators and genres on component mount
  useEffect(() => {
    loadExistingData();
  }, []);

  async function loadExistingData() {
    // Load creators
    const { data: creators } = await supabase
      .from('creators')
      .select('*')
      .order('name');
    if (creators) setExistingCreators(creators);

    // Load genres
    const { data: genres } = await supabase
      .from('genres')
      .select('*')
      .order('name');
    if (genres) setExistingGenres(genres);
  }

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Generate a unique filename
    const movieSlug = generateSlug(formData.title || 'movie');
    const fileExtension = file.name.split('.').pop();
    const filename = `${movieSlug}.${fileExtension}`;
    
    // Create FormData for upload
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('filename', filename);

    try {
      const response = await fetch('/api/upload-thumbnail', {
        method: 'POST',
        body: uploadData,
      });

      if (response.ok) {
        const data = await response.json();
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
    setLoading(true);
    setMessage('');

    try {
      // 1. Handle creator
      let creatorId: number | undefined;
      
      if (formData.selectedCreatorId) {
        // Use selected existing creator
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

      // 2. Create movie
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
      
      console.log('Inserting movie data:', movieData);
      
      const { data: movie, error: movieError } = await supabase
        .from('movies')
        .insert(movieData)
        .select('id')
        .single();

      if (movieError) {
        console.error('Movie insert error:', movieError);
        throw movieError;
      }

      // 3. Handle genres
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

      // 4. Create movie-genre junctions
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

      setMessage('Movie added successfully!');
      setFormData({
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
        genres: [],
        newGenres: [],
        selectedCreatorId: null
      });

    } catch (error) {
      console.error('Error adding movie:', error);
      setMessage('Error adding movie. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Movie</h1>
      
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? 'Adding Movie...' : 'Add Movie'}
        </button>
      </form>
    </main>
  );
} 
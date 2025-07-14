'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from 'lib/supabaseClient';

interface Creator {
  id: number;
  name: string;
  slug: string;
}

interface Series {
  id: number;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  year?: number;
  creator_id?: number | null;
}

interface Episode {
  id: number;
  title: string;
  slug: string;
  episode_number: number;
  thumbnail?: string;
}

export default function EditSeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const [series, setSeries] = useState<Series | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail: '',
    year: new Date().getFullYear(),
    creatorId: null as number | null,
  });
  const [existingCreators, setExistingCreators] = useState<Creator[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const resolvedParams = await params;
      // Load creators
      const { data: creators } = await supabase
        .from('creators')
        .select('*')
        .order('name');
      if (creators) setExistingCreators(creators);
      // Load series
      const { data: seriesData, error: seriesError } = await supabase
        .from('series')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .single();
      if (seriesError || !seriesData) {
        setLoading(false);
        return;
      }
      setSeries(seriesData);
      setFormData({
        title: seriesData.title,
        slug: seriesData.slug,
        description: seriesData.description || '',
        thumbnail: seriesData.thumbnail || '',
        year: seriesData.year || new Date().getFullYear(),
        creatorId: seriesData.creator_id || null,
      });
      // Load episodes
      const { data: episodesData } = await supabase
        .from('episodes')
        .select('id, title, slug, episode_number, thumbnail')
        .eq('series_id', seriesData.id)
        .order('episode_number');
      if (episodesData) setEpisodes(episodesData);
      setLoading(false);
    }
    loadData();
  }, [params]);

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const seriesSlug = generateSlug(formData.title || 'series');
    const fileExtension = file.name.split('.').pop();
    const filename = `${seriesSlug}.${fileExtension}`;
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
        setFormData(prev => ({ ...prev, thumbnail: `/thumbnails/${filename}` }));
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
      const slug = generateSlug(formData.title);
      const { error } = await supabase
        .from('series')
        .update({
          title: formData.title,
          slug,
          description: formData.description,
          thumbnail: formData.thumbnail,
          year: formData.year,
          creator_id: formData.creatorId || null,
        })
        .eq('id', series?.id);
      if (error) throw error;
      setMessage('Series updated successfully!');
      setTimeout(() => setMessage(''), 1200);
    } catch (error) {
      setMessage('Error updating series. Check console for details.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="p-6 max-w-2xl mx-auto">Loading...</main>;
  }
  if (!series) {
    return <main className="p-6 max-w-2xl mx-auto">Series not found.</main>;
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Series</h1>
      {message && (
        <div className={`p-4 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Series Details</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })}
              className="w-full p-2 border rounded"
              placeholder="Series title"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="series-slug"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Series description"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Year</label>
            <input
              type="number"
              value={formData.year}
              onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
              min="1900"
              max="2030"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Thumbnail</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              className="w-full p-2 border rounded"
            />
            {formData.thumbnail && (
              <div className="text-sm text-gray-400 mt-2">Current: {formData.thumbnail}</div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Creator</label>
            <select
              value={formData.creatorId || ''}
              onChange={e => setFormData({ ...formData, creatorId: e.target.value ? parseInt(e.target.value) : null })}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select creator --</option>
              {existingCreators.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Episodes</h2>
          <Link
            href={`/admin/series/${series.slug}/episodes/new`}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Episode
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {episodes.map(ep => (
            <div key={ep.id} className="flex items-center border border-gray-700 rounded-lg overflow-hidden">
              <div className="w-32 h-20 relative bg-gray-800 flex-shrink-0">
                {ep.thumbnail ? (
                  <Image
                    src={ep.thumbnail}
                    alt={ep.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-2xl">🎬</div>
                )}
              </div>
              <div className="flex-1 p-4">
                <div className="font-semibold">Ep {ep.episode_number}: {ep.title}</div>
              </div>
              <div className="p-4">
                <Link
                  href={`/admin/series/${series.slug}/episodes/${ep.slug}`}
                  className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
          {episodes.length === 0 && (
            <div className="text-center text-gray-400 py-8">No episodes yet.</div>
          )}
        </div>
      </div>
    </main>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

interface Creator {
  id: number;
  name: string;
  slug: string;
}

export default function NewSeriesPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail: '',
    year: new Date().getFullYear(),
    creatorId: null as number | null,
  });
  const [existingCreators, setExistingCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadCreators() {
      const { data } = await supabase
        .from('creators')
        .select('*')
        .order('name');
      if (data) setExistingCreators(data);
    }
    loadCreators();
  }, []);

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
    setLoading(true);
    setMessage('');
    try {
      const slug = generateSlug(formData.title);
      const { error } = await supabase
        .from('series')
        .insert({
          title: formData.title,
          slug,
          description: formData.description,
          thumbnail: formData.thumbnail,
          year: formData.year,
          creator_id: formData.creatorId || null,
        });
      if (error) throw error;
      setMessage('Series added successfully!');
      setTimeout(() => router.push('/admin/series'), 1200);
    } catch (error) {
      setMessage('Error adding series. Check console for details.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Series</h1>
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
          disabled={loading}
          className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? 'Adding Series...' : 'Add Series'}
        </button>
      </form>
    </main>
  );
} 
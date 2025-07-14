'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from 'lib/supabaseClient';

interface Series {
  id: number;
  title: string;
  slug: string;
}

interface Episode {
  id: number;
  title: string;
  slug: string;
  description?: string;
  video_url: string;
  thumbnail?: string;
  year?: number;
  episode_number: number;
  series_id: number;
}

export default function EditEpisodePage({ params }: { params: { slug: string; episodeSlug: string } }) {
  const router = useRouter();
  const [series, setSeries] = useState<Series | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    year: new Date().getFullYear(),
    episodeNumber: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Load series
      const { data: seriesData } = await supabase
        .from('series')
        .select('id, title, slug')
        .eq('slug', params.slug)
        .single();
      if (seriesData) setSeries(seriesData);
      // Load episode
      const { data: episodeData, error: episodeError } = await supabase
        .from('episodes')
        .select('*')
        .eq('slug', params.episodeSlug)
        .eq('series_id', seriesData?.id)
        .single();
      if (episodeError || !episodeData) {
        setLoading(false);
        setMessage('Episode not found.');
        return;
      }
      setEpisode(episodeData);
      setFormData({
        title: episodeData.title,
        slug: episodeData.slug,
        description: episodeData.description || '',
        videoUrl: episodeData.video_url || '',
        thumbnail: episodeData.thumbnail || '',
        year: episodeData.year || new Date().getFullYear(),
        episodeNumber: episodeData.episode_number,
      });
      setLoading(false);
    }
    loadData();
  }, [params.slug, params.episodeSlug]);

  function generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const episodeSlug = generateSlug(formData.title || 'episode');
    const fileExtension = file.name.split('.').pop();
    const filename = `${episodeSlug}.${fileExtension}`;
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
    if (!episode) return;
    setSaving(true);
    setMessage('');
    try {
      const slug = generateSlug(formData.title);
      const { error } = await supabase
        .from('episodes')
        .update({
          title: formData.title,
          slug,
          description: formData.description,
          video_url: formData.videoUrl,
          thumbnail: formData.thumbnail,
          year: formData.year,
          episode_number: formData.episodeNumber,
        })
        .eq('id', episode.id);
      if (error) throw error;
      setMessage('Episode updated successfully!');
      setTimeout(() => router.push(`/admin/series/${series?.slug}`), 1200);
    } catch (error) {
      setMessage('Error updating episode. Check console for details.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="p-6 max-w-2xl mx-auto">Loading...</main>;
  }
  if (!series || !episode) {
    return <main className="p-6 max-w-2xl mx-auto">{message || 'Episode not found.'}</main>;
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Episode: {episode.title}</h1>
      {message && (
        <div className={`p-4 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Episode Details</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value, slug: generateSlug(e.target.value) })}
              className="w-full p-2 border rounded"
              placeholder="Episode title"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="episode-slug"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Episode description"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Video URL *</label>
            <input
              type="url"
              required
              value={formData.videoUrl}
              onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="https://..."
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
            <label className="block text-sm font-medium mb-2">Episode Number *</label>
            <input
              type="number"
              required
              value={formData.episodeNumber}
              onChange={e => setFormData({ ...formData, episodeNumber: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
              min="1"
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
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </main>
  );
} 
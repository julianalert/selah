'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { supabase } from '../../../../lib/supabaseClient';

interface CreatorData {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  avatar?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
}

export default function EditCreatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    bio: '',
    avatar: '',
    twitter: '',
    instagram: '',
    website: '',
    youtube: ''
  });

  // Load creator data
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const resolvedParams = await params;

      // Load creator data
      const { data: creatorData, error: creatorError } = await supabase
        .from('creators')
        .select('*')
        .eq('slug', resolvedParams.slug)
        .single();

      if (creatorError || !creatorData) {
        setLoading(false);
        return notFound();
      }

      setCreator(creatorData);

      // Populate form data
      setFormData({
        name: creatorData.name,
        slug: creatorData.slug,
        bio: creatorData.bio || '',
        avatar: creatorData.avatar || '',
        twitter: creatorData.twitter || '',
        instagram: creatorData.instagram || '',
        website: creatorData.website || '',
        youtube: creatorData.youtube || ''
      });

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      if (!creator) throw new Error('Creator not found');

      // Update creator
      const creatorSlug = generateSlug(formData.name);
      const creatorData = {
        name: formData.name,
        slug: creatorSlug,
        bio: formData.bio || null,
        avatar: formData.avatar || null,
        twitter: formData.twitter || null,
        instagram: formData.instagram || null,
        website: formData.website || null,
        youtube: formData.youtube || null
      };
      
      const { error: creatorError } = await supabase
        .from('creators')
        .update(creatorData)
        .eq('id', creator.id);

      if (creatorError) throw creatorError;

      setMessage('Creator updated successfully!');
      
      // Redirect to edit creators list after a short delay
      setTimeout(() => {
        router.push('/admin/creators');
      }, 1500);

    } catch (error) {
      console.error('Error updating creator:', error);
      setMessage('Error updating creator. Please check the console for details.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="p-6 max-w-4xl mx-auto">Loading...</main>;
  }

  if (!creator) {
    return notFound();
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Creator: {creator.name}</h1>
        <button
          onClick={() => router.push('/admin/creators')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Edit Creators
        </button>
      </div>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Creator Details */}
        <div className="p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Creator Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({
                  ...formData, 
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                })}
                className="w-full p-2 border rounded"
                placeholder="Creator name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="creator-slug"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full p-2 border rounded"
              rows={4}
              placeholder="Creator bio"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Avatar URL</label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({...formData, avatar: e.target.value})}
              className="w-full p-2 border rounded"
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="p-6 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Social Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Twitter</label>
              <input
                type="text"
                value={formData.twitter}
                onChange={(e) => setFormData({...formData, twitter: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="@username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="@username"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="https://..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">YouTube</label>
              <input
                type="url"
                value={formData.youtube}
                onChange={(e) => setFormData({...formData, youtube: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="https://youtube.com/@username"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
          >
            {saving ? 'Updating Creator...' : 'Update Creator'}
          </button>
          
          <button
            type="button"
            onClick={() => router.push('/admin/creators')}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
} 
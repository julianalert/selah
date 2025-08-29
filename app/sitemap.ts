import { MetadataRoute } from 'next'
import { supabase } from '../lib/supabaseClient'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL from environment variable or fallback to localhost for development
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'
  
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/series`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  try {
    // Fetch all movies
    const { data: movies, error: moviesError } = await supabase
      .from('movies')
      .select('slug')
    
    // Fetch all creators
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('slug')
    
    // Fetch all genres
    const { data: genres, error: genresError } = await supabase
      .from('genres')
      .select('slug')
    
    // Fetch all series
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('slug')

    // Handle any errors
    if (moviesError) console.error('Error fetching movies for sitemap:', moviesError)
    if (creatorsError) console.error('Error fetching creators for sitemap:', creatorsError)
    if (genresError) console.error('Error fetching genres for sitemap:', genresError)
    if (seriesError) console.error('Error fetching series for sitemap:', seriesError)

    // Movie routes
    const movieRoutes: MetadataRoute.Sitemap = (movies || []).map((movie) => ({
      url: `${baseUrl}/movie/${movie.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    // Creator routes
    const creatorRoutes: MetadataRoute.Sitemap = (creators || []).map((creator) => ({
      url: `${baseUrl}/creator/${creator.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Genre routes
    const genreRoutes: MetadataRoute.Sitemap = (genres || []).map((genre) => ({
      url: `${baseUrl}/genre/${genre.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Series routes
    const seriesRoutes: MetadataRoute.Sitemap = (series || []).map((s) => ({
      url: `${baseUrl}/series/${s.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Combine all routes
    return [
      ...staticRoutes,
      ...movieRoutes,
      ...creatorRoutes,
      ...genreRoutes,
      ...seriesRoutes,
    ]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least the static routes if database fails
    return staticRoutes
  }
}

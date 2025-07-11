// scripts/uploadMovies.js
const { createClient } = require('@supabase/supabase-js');
const movies = require('../data/movies.json');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for insert
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadMovies() {
  for (const movie of movies) {
    // Ensure creator is always an array
    const creator = Array.isArray(movie.creator) ? movie.creator : [movie.creator];
    // Map videoUrl to video_url
    const { videoUrl, ...rest } = movie;
    const movieData = { ...rest, video_url: videoUrl, creator };
    const { error } = await supabase
      .from('movies')
      .insert([movieData]);
    if (error) {
      console.error(`Error uploading movie "${movie.title}":`, error.message);
    } else {
      console.log(`Uploaded: ${movie.title}`);
    }
  }
}

uploadMovies(); 
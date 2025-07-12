import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreMovieGenres() {
  console.log('🎬 Restoring movie-genre relationships...');

  try {
    // 1. Read the movies JSON file
    const moviesData = JSON.parse(fs.readFileSync('./data/movies.json', 'utf8'));
    console.log(`Found ${moviesData.length} movies to process`);

    // 2. Process each movie
    for (const movie of moviesData) {
      console.log(`Processing genres for: ${movie.title}`);
      
      // Get the movie ID from the database
      const { data: movieRecord } = await supabase
        .from('movies')
        .select('id')
        .eq('slug', movie.slug)
        .single();

      if (!movieRecord) {
        console.log(`Movie not found: ${movie.title}`);
        continue;
      }

      // Process each genre for this movie
      if (movie.genre && movie.genre.length > 0) {
        for (const genreName of movie.genre) {
          // Get or create the genre
          const genreSlug = genreName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          
          const { data: genreRecord } = await supabase
            .from('genres')
            .select('id')
            .eq('slug', genreSlug)
            .single();

          if (genreRecord) {
            // Create the movie-genre relationship
            const { error: junctionError } = await supabase
              .from('movie_genres')
              .insert({
                movie_id: movieRecord.id,
                genre_id: genreRecord.id
              });

            if (junctionError) {
              console.error(`Error creating relationship for ${movie.title} - ${genreName}:`, junctionError);
            } else {
              console.log(`✅ Linked: ${movie.title} → ${genreName}`);
            }
          } else {
            console.log(`Genre not found: ${genreName}`);
          }
        }
      }
    }

    console.log('\n✅ All movie-genre relationships restored!');
    
    // 3. Verify the relationships
    const { data: relationships, error: countError } = await supabase
      .from('movie_genres')
      .select('movie_id, genre_id');

    if (!countError) {
      console.log(`📊 Verification: ${relationships.length} movie-genre relationships in database`);
    }

  } catch (error) {
    console.error('❌ Error restoring movie-genre relationships:', error);
  }
}

// Run the script
restoreMovieGenres().then(() => {
  console.log('\n🎉 Script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 
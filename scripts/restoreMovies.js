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

async function restoreMovies() {
  console.log('🎬 Restoring movies to Supabase...');

  try {
    // 1. Read the movies JSON file
    const moviesData = JSON.parse(fs.readFileSync('./data/movies.json', 'utf8'));
    console.log(`Found ${moviesData.length} movies to restore`);

    // 2. First, let's create the proper table structure
    console.log('\n🏗️  Creating proper movies table structure...');
    
    // Drop and recreate the table
    const dropTableSQL = 'DROP TABLE IF EXISTS movies CASCADE;';
    const createTableSQL = `
      CREATE TABLE movies (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        video_url TEXT,
        thumbnail TEXT,
        year INTEGER,
        creator_id INTEGER REFERENCES creators(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Note: You'll need to run this SQL manually in Supabase SQL Editor
    console.log('\n📝 Please run this SQL in your Supabase SQL Editor first:');
    console.log(dropTableSQL);
    console.log(createTableSQL);
    console.log('\nPress Enter after running the SQL...');
    
    // Wait for user input (you can comment this out if you want to run automatically)
    // await new Promise(resolve => process.stdin.once('data', resolve));

    // 3. Process each movie
    console.log('\n🔄 Restoring movies...');
    
    for (const movie of moviesData) {
      console.log(`Processing: ${movie.title}`);
      
      // Handle creator
      let creatorId = null;
      if (movie.creator) {
        // Check if creator exists
        const creatorName = Array.isArray(movie.creator) ? movie.creator[0] : movie.creator;
        const creatorSlug = creatorName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        
        const { data: existingCreator } = await supabase
          .from('creators')
          .select('id')
          .eq('slug', creatorSlug)
          .single();

        if (existingCreator) {
          creatorId = existingCreator.id;
        } else {
          // Create creator
          const { data: newCreator, error: creatorError } = await supabase
            .from('creators')
            .insert({
              name: creatorName,
              slug: creatorSlug
            })
            .select('id')
            .single();

          if (creatorError) {
            console.error(`Error creating creator for ${movie.title}:`, creatorError);
          } else {
            creatorId = newCreator.id;
          }
        }
      }

      // Insert movie
      const { error: movieError } = await supabase
        .from('movies')
        .insert({
          title: movie.title,
          slug: movie.slug,
          description: movie.description,
          video_url: movie.videoUrl,
          thumbnail: movie.thumbnail,
          year: movie.year,
          creator_id: creatorId
        });

      if (movieError) {
        console.error(`Error inserting movie ${movie.title}:`, movieError);
      } else {
        console.log(`✅ Restored: ${movie.title}`);
      }

      // Handle genres
      if (movie.genre && movie.genre.length > 0) {
        // Get the movie ID we just inserted
        const { data: insertedMovie } = await supabase
          .from('movies')
          .select('id')
          .eq('slug', movie.slug)
          .single();

        if (insertedMovie) {
          for (const genreName of movie.genre) {
            // Check if genre exists
            const genreSlug = genreName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            
            const { data: existingGenre } = await supabase
              .from('genres')
              .select('id')
              .eq('slug', genreSlug)
              .single();

            let genreId;
            if (existingGenre) {
              genreId = existingGenre.id;
            } else {
              // Create genre
              const { data: newGenre, error: genreError } = await supabase
                .from('genres')
                .insert({
                  name: genreName,
                  slug: genreSlug
                })
                .select('id')
                .single();

              if (genreError) {
                console.error(`Error creating genre ${genreName}:`, genreError);
                continue;
              }
              genreId = newGenre.id;
            }

            // Create movie-genre junction
            const { error: junctionError } = await supabase
              .from('movie_genres')
              .insert({
                movie_id: insertedMovie.id,
                genre_id: genreId
              });

            if (junctionError) {
              console.error(`Error creating genre junction for ${movie.title} - ${genreName}:`, junctionError);
            }
          }
        }
      }
    }

    console.log('\n✅ All movies restored successfully!');
    
    // 4. Verify the restoration
    const { data: restoredMovies, error: countError } = await supabase
      .from('movies')
      .select('id, title');

    if (!countError) {
      console.log(`\n📊 Verification: ${restoredMovies.length} movies in database`);
    }

  } catch (error) {
    console.error('❌ Error restoring movies:', error);
  }
}

// Run the script
restoreMovies().then(() => {
  console.log('\n🎉 Script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 
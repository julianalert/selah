// scripts/populateGenres.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function genreToSlug(genre) {
  return genre.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function populateGenres() {
  try {
    console.log('Fetching all movies...');
    
    // Step 1: Get all movies
    const { data: movies, error: moviesError } = await supabase
      .from('movies')
      .select('*');
    
    if (moviesError) {
      console.error('Error fetching movies:', moviesError);
      return;
    }

    console.log(`Found ${movies.length} movies`);

    // Step 2: Extract unique genres
    const genresMap = new Map();
    
    movies.forEach(movie => {
      if (Array.isArray(movie.genre)) {
        movie.genre.forEach(genre => {
          if (!genresMap.has(genre)) {
            genresMap.set(genre, {
              name: genre,
              slug: genreToSlug(genre)
            });
          }
        });
      }
    });

    console.log(`Found ${genresMap.size} unique genres`);

    // Step 3: Insert genres into the genres table
    const genresToInsert = Array.from(genresMap.values());
    
    const { data: insertedGenres, error: insertError } = await supabase
      .from('genres')
      .insert(genresToInsert)
      .select('id, name, slug');

    if (insertError) {
      console.error('Error inserting genres:', insertError);
      return;
    }

    console.log(`Inserted ${insertedGenres.length} genres`);

    // Step 4: Create a map of genre name to genre id
    const genreNameToId = new Map();
    insertedGenres.forEach(genre => {
      genreNameToId.set(genre.name, genre.id);
    });

    // Step 5: Create movie-genre relationships
    console.log('Creating movie-genre relationships...');
    
    const movieGenresToInsert = [];
    
    for (const movie of movies) {
      if (Array.isArray(movie.genre)) {
        movie.genre.forEach(genreName => {
          const genreId = genreNameToId.get(genreName);
          if (genreId) {
            movieGenresToInsert.push({
              movie_id: movie.id,
              genre_id: genreId
            });
          }
        });
      }
    }

    // Insert all movie-genre relationships
    if (movieGenresToInsert.length > 0) {
      const { error: relationshipError } = await supabase
        .from('movie_genres')
        .insert(movieGenresToInsert);

      if (relationshipError) {
        console.error('Error creating movie-genre relationships:', relationshipError);
      } else {
        console.log(`Created ${movieGenresToInsert.length} movie-genre relationships`);
      }
    }

    console.log('✅ Genres table populated successfully!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

populateGenres(); 
// scripts/populateCreators.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function creatorToSlug(creator) {
  return creator.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function populateCreators() {
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

    // Step 2: Extract unique creators
    const creatorsMap = new Map();
    
    movies.forEach(movie => {
      let creators = [];
      if (Array.isArray(movie.creator)) {
        creators = movie.creator;
      } else if (movie.creator) {
        creators = [movie.creator];
      }
      
      creators.forEach(creator => {
        if (!creatorsMap.has(creator)) {
          creatorsMap.set(creator, {
            name: creator,
            slug: creatorToSlug(creator)
          });
        }
      });
    });

    console.log(`Found ${creatorsMap.size} unique creators`);

    // Step 3: Insert creators into the creators table
    const creatorsToInsert = Array.from(creatorsMap.values());
    
    const { data: insertedCreators, error: insertError } = await supabase
      .from('creators')
      .insert(creatorsToInsert)
      .select('id, name, slug');

    if (insertError) {
      console.error('Error inserting creators:', insertError);
      return;
    }

    console.log(`Inserted ${insertedCreators.length} creators`);

    // Step 4: Create a map of creator name to creator id
    const creatorNameToId = new Map();
    insertedCreators.forEach(creator => {
      creatorNameToId.set(creator.name, creator.id);
    });

    // Step 5: Update movies with creator_id
    console.log('Updating movies with creator_id...');
    
    for (const movie of movies) {
      let creatorId = null;
      
      if (Array.isArray(movie.creator) && movie.creator.length > 0) {
        // For movies with multiple creators, use the first one
        creatorId = creatorNameToId.get(movie.creator[0]);
      } else if (movie.creator) {
        creatorId = creatorNameToId.get(movie.creator);
      }

      if (creatorId) {
        const { error: updateError } = await supabase
          .from('movies')
          .update({ creator_id: creatorId })
          .eq('id', movie.id);

        if (updateError) {
          console.error(`Error updating movie ${movie.id}:`, updateError);
        } else {
          console.log(`Updated movie ${movie.id} with creator_id ${creatorId}`);
        }
      }
    }

    console.log('✅ Creators table populated successfully!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

populateCreators(); 
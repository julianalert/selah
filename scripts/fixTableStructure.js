import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTableStructure() {
  console.log('🔧 Fixing table structure...');

  try {
    // 1. First, let's check the current table structure
    console.log('\n📋 Checking current table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'movies')
      .order('ordinal_position');

    if (columnsError) {
      console.error('Error checking table structure:', columnsError);
      return;
    }

    console.log('Current movies table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // 2. Check if we need to recreate the table
    const hasIdColumn = columns.some(col => col.column_name === 'id');
    const idIsSerial = columns.some(col => 
      col.column_name === 'id' && 
      col.column_default && 
      col.column_default.includes('nextval')
    );

    if (!hasIdColumn || !idIsSerial) {
      console.log('\n⚠️  Movies table needs to be recreated with proper structure...');
      
      // 3. Create a backup of existing data
      console.log('\n💾 Backing up existing movies data...');
      const { data: existingMovies, error: backupError } = await supabase
        .from('movies')
        .select('*');

      if (backupError) {
        console.error('Error backing up movies:', backupError);
        return;
      }

      console.log(`Found ${existingMovies.length} existing movies to backup`);

      // 4. Drop and recreate the movies table
      console.log('\n🗑️  Dropping existing movies table...');
      const { error: dropError } = await supabase.rpc('drop_table_if_exists', { table_name: 'movies' });
      
      if (dropError) {
        console.log('Note: drop_table_if_exists function not available, using direct SQL...');
        // If the function doesn't exist, we'll need to handle this differently
        console.log('Please manually drop the movies table in Supabase dashboard and run this script again');
        return;
      }

      // 5. Create the new movies table with proper structure
      console.log('\n🏗️  Creating new movies table...');
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

      const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('Error creating table:', createError);
        console.log('\n📝 Please run this SQL in your Supabase SQL editor:');
        console.log(createTableSQL);
        return;
      }

      // 6. Restore the data
      if (existingMovies.length > 0) {
        console.log('\n🔄 Restoring movies data...');
        
        for (const movie of existingMovies) {
          const { error: insertError } = await supabase
            .from('movies')
            .insert({
              title: movie.title,
              slug: movie.slug,
              description: movie.description,
              video_url: movie.video_url || movie.videoUrl,
              thumbnail: movie.thumbnail,
              year: movie.year,
              creator_id: movie.creator_id
            });

          if (insertError) {
            console.error(`Error restoring movie "${movie.title}":`, insertError);
          } else {
            console.log(`✅ Restored: ${movie.title}`);
          }
        }
      }

      console.log('\n✅ Movies table structure fixed successfully!');
    } else {
      console.log('\n✅ Movies table structure is already correct!');
    }

    // 7. Verify the final structure
    console.log('\n🔍 Verifying final table structure...');
    const { data: finalColumns, error: finalError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'movies')
      .order('ordinal_position');

    if (!finalError) {
      console.log('Final movies table columns:');
      finalColumns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

  } catch (error) {
    console.error('❌ Error fixing table structure:', error);
  }
}

// Alternative approach if RPC functions don't work
async function createTableWithSQL() {
  console.log('\n📝 Manual SQL approach...');
  console.log('Please run these SQL commands in your Supabase SQL editor:');
  
  console.log('\n1. First, backup your data:');
  console.log('SELECT * FROM movies;');
  
  console.log('\n2. Drop the existing table:');
  console.log('DROP TABLE IF EXISTS movies CASCADE;');
  
  console.log('\n3. Create the new table:');
  console.log(`
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
);`);
  
  console.log('\n4. Restore your data (adjust as needed):');
  console.log(`
INSERT INTO movies (title, slug, description, video_url, thumbnail, year, creator_id)
SELECT title, slug, description, video_url, thumbnail, year, creator_id 
FROM your_backup_table;`);
}

// Run the script
fixTableStructure().then(() => {
  console.log('\n🎉 Script completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 
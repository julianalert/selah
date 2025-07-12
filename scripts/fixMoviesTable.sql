-- Fix Movies Table Structure
-- Run this in your Supabase SQL Editor

-- 1. First, backup existing data (run this and save the results)
SELECT * FROM movies;

-- 2. Drop the existing movies table (this will also drop any foreign key constraints)
DROP TABLE IF EXISTS movies CASCADE;

-- 3. Create the new movies table with proper structure
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

-- 4. Create an index on slug for faster lookups
CREATE INDEX idx_movies_slug ON movies(slug);

-- 5. Create an index on creator_id for faster joins
CREATE INDEX idx_movies_creator_id ON movies(creator_id);

-- 6. If you had existing data, restore it here (adjust column names as needed)
-- Example:
-- INSERT INTO movies (title, slug, description, video_url, thumbnail, year, creator_id)
-- VALUES 
--   ('Movie Title', 'movie-slug', 'Description', 'https://video.url', '/thumbnails/image.jpg', 2024, 1);

-- 7. Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'movies' 
ORDER BY ordinal_position; 
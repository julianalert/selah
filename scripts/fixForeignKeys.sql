-- Fix Foreign Key Relationships
-- Run this in your Supabase SQL Editor

-- 1. Drop the existing movie_genres table
DROP TABLE IF EXISTS movie_genres CASCADE;

-- 2. Recreate movie_genres table with proper foreign keys
CREATE TABLE movie_genres (
  movie_id INTEGER REFERENCES movies(id) ON DELETE CASCADE,
  genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, genre_id)
);

-- 3. Create indexes for better performance
CREATE INDEX idx_movie_genres_movie_id ON movie_genres(movie_id);
CREATE INDEX idx_movie_genres_genre_id ON movie_genres(genre_id);

-- 4. Re-insert the movie-genre relationships
-- (This will be done by the restore script) 
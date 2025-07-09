import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase project URL and anon public key
const supabaseUrl = 'https://gffymwszmqfeoqqnqmpf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZnltd3N6bXFmZW9xcW5xbXBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNjQxMDMsImV4cCI6MjA2NzY0MDEwM30._H9Dy3m7elFlgYYWNCfINdjVdarAwI8YygpyeXnoqLg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 
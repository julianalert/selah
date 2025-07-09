'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getUserId } from '../lib/userId';

type RatingProps = {
  movieSlug: string;
};

type RatingRow = { rating: number };

export default function Rating({ movieSlug }: RatingProps) {
  const [average, setAverage] = useState<number | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchRatings() {
      setLoading(true);
      const userId = getUserId();
      // Fetch average
      const { data: avgData } = await supabase
        .from('ratings')
        .select('rating')
        .eq('movie_slug', movieSlug);

      if (avgData) {
        const ratings = avgData.map((r: RatingRow) => r.rating);
        const avg =
          ratings.length > 0
            ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
            : null;
        setAverage(avg);
      }

      // Fetch user rating
      if (userId) {
        const { data: userData } = await supabase
          .from('ratings')
          .select('rating')
          .eq('movie_slug', movieSlug)
          .eq('user_id', userId)
          .single();
        setUserRating(userData?.rating ?? null);
      }
      setLoading(false);
    }
    fetchRatings();
  }, [movieSlug]);

  async function handleRate(rating: number) {
    setSubmitting(true);
    const userId = getUserId();
    if (!userId) return;
    // Insert or update rating
    const { error } = await supabase.from('ratings').upsert(
      [
        {
          movie_slug: movieSlug,
          user_id: userId,
          rating,
        },
      ],
      { onConflict: 'movie_slug,user_id' }
    );
    if (!error) {
      setUserRating(rating);
      // Refresh average
      const { data: avgData } = await supabase
        .from('ratings')
        .select('rating')
        .eq('movie_slug', movieSlug);
      if (avgData) {
        const ratings = avgData.map((r: RatingRow) => r.rating);
        const avg =
          ratings.length > 0
            ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
            : null;
        setAverage(avg);
      }
    }
    setSubmitting(false);
  }

  return (
    <div>
      <div>
        {loading ? (
          <span>Loading...</span>
        ) : (
          <>
            <span>
              Average rating:{' '}
              {average ? average.toFixed(2) : 'No ratings yet'}
            </span>
            <br />
            <span>
              Your rating:{' '}
              {userRating ? (
                <strong>{userRating} / 5</strong>
              ) : (
                'Not rated'
              )}
            </span>
          </>
        )}
      </div>
      <div style={{ marginTop: 8 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            disabled={!!userRating || submitting}
            style={{
              color: star <= (userRating ?? 0) ? 'gold' : 'gray',
              fontSize: 24,
              background: 'none',
              border: 'none',
              cursor: userRating ? 'not-allowed' : 'pointer',
            }}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      {userRating && <div style={{ color: 'green', marginTop: 4 }}>You have rated this movie.</div>}
    </div>
  );
} 
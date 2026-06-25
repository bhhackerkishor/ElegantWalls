'use client';

import { useState, useEffect } from 'react';
import { FiStar } from 'react-icons/fi';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import type { Review } from '@/types';

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setReviews(data.data || []); });
  }, [productId]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ productId, customerName: name, rating, comment }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Review submitted for moderation. Thank you!');
        setShowForm(false);
        setComment('');
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16 border-t border-border pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold">Customer Reviews</h2>
          {avgRating && (
            <p className="text-sm text-foreground-secondary mt-1">
              {avgRating} / 5 · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {isAuthenticated && (
          <Button variant="secondary" size="sm" onClick={() => setShowForm(!showForm)}>
            Write a Review
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-background-secondary rounded-lg border border-border">
          <Input label="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="mb-4">
            <label className="text-sm font-medium block mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} type="button" onClick={() => setRating(r)} className="bg-transparent border-none cursor-pointer">
                  <FiStar size={24} className={r <= rating ? 'text-accent' : 'text-border'} fill={r <= rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>
          <Textarea label="Your Review" value={comment} onChange={(e) => setComment(e.target.value)} required />
          <Button type="submit" loading={submitting}>Submit Review</Button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-foreground-secondary text-sm">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="p-5 bg-card-bg border border-border rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">{Array(5).fill(0).map((_, i) => (
                  <FiStar key={i} size={14} className={i < review.rating ? 'text-accent' : 'text-border'} fill={i < review.rating ? 'currentColor' : 'none'} />
                ))}</div>
                <span className="text-sm font-bold">{review.customerName}</span>
              </div>
              <p className="text-sm text-foreground-secondary">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

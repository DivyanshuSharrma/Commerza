'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Review {
  id: string;
  authorName: string;
  authorEmail: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerifiedBuyer: boolean;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalCount: number;
  breakdown: Record<number, number>;
}

interface ProductReviewsProps {
  productId: string;
  brandId: string;
}

export function ProductReviews({ productId, brandId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    averageRating: 5.0,
    totalCount: 0,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${apiUrl}/reviews/product/${productId}`, { cache: 'no-store' });
      if (!res.ok) return;
      const body = await res.json();
      if (body.data) {
        setReviews(body.data.reviews || []);
        if (body.data.stats) {
          setStats(body.data.stats);
        }
      }
    } catch {
      // Quiet fail fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorEmail.trim() || !comment.trim()) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`${apiUrl}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          brandId,
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
        }),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message || 'Failed to submit review.');

      setFeedback({
        message: 'Your review has been verified and posted! Thank you for the feedback.',
        isError: false,
      });
      setShowForm(false);
      setComment('');
      setTitle('');
      fetchReviews();
    } catch (err: any) {
      setFeedback({
        message: err.message || 'Error publishing review. Please try again.',
        isError: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="border-t border-border/60 pt-16 mt-16 space-y-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
            Customer Engineering Reviews
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Ratings & Production Feedback
          </h2>
          <p className="text-xs sm:text-sm text-foreground/60 mt-1">
            Authentic experiences and architectural feedback from verified engineers and founders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-full bg-foreground text-background font-bold text-xs hover:opacity-90 transition-all self-start md:self-auto cursor-pointer shadow-sm"
        >
          {showForm ? 'Cancel Review' : 'Write a Review'}
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
            feedback.isError
              ? 'bg-red-500/10 border-red-500/30 text-red-500'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Write Review Form Drawer / Modal */}
      {showForm && (
        <Card className="p-6 sm:p-8 bg-card border-border/80 rounded-3xl shadow-xl animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="text-lg font-bold text-foreground">Share Your Experience</h3>

            {/* Star Selector */}
            <div>
              <label className="block text-xs font-mono uppercase text-foreground/60 mb-2">
                Overall Quality Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="text-2xl cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                  >
                    <span
                      className={
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 drop-shadow-sm'
                          : 'text-foreground/20'
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
                <span className="text-xs font-mono text-foreground/50 ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Your Name / Handle"
                placeholder="e.g. Alex Rivera"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
              <Input
                label="Email (Used for Verified Buyer check)"
                type="email"
                placeholder="alex@acme.dev"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                required
              />
            </div>

            <Input
              label="Review Headline (Optional)"
              placeholder="e.g. Cleanest architecture I've integrated this year"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div>
              <label className="block text-xs font-mono uppercase text-foreground/60 mb-1.5">
                Detailed Feedback
              </label>
              <textarea
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share technical highlights, integration ease, or deployment benefits..."
                className="w-full rounded-2xl bg-surface-muted/60 border border-border/80 px-4 py-3 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Verifying & Posting...' : 'Publish Review'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Aggregate Overview & Star Histogram */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-card border border-border/70 rounded-3xl p-6 sm:p-8">
        <div className="md:col-span-4 text-center md:text-left md:border-r md:border-border/60 md:pr-8 space-y-2">
          <div className="text-5xl font-black text-foreground tracking-tight">
            {stats.totalCount > 0 ? stats.averageRating.toFixed(1) : '5.0'}
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400 text-lg">
            {'★★★★★'.split('').map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
          <p className="text-xs text-foreground/50">
            Based on {stats.totalCount || 0} customer reviews
          </p>
        </div>

        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.breakdown[star] || 0;
            const pct = stats.totalCount > 0 ? Math.round((count / stats.totalCount) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-foreground/60 font-mono text-[11px] text-right">
                  {star} Star
                </span>
                <div className="flex-1 h-2 rounded-full bg-surface-muted overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-[11px] text-foreground/45 font-mono text-right">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-foreground/40 animate-pulse">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-10 text-center rounded-3xl border border-dashed border-border/80 bg-surface-muted/20 space-y-2">
            <span className="text-3xl select-none">💬</span>
            <h4 className="font-bold text-foreground text-sm">No reviews yet</h4>
            <p className="text-xs text-foreground/50 max-w-sm mx-auto">
              Be the first engineer to deploy and review this codebase for the community.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <Card
                key={r.id}
                className="p-6 bg-card border-border/70 rounded-3xl flex flex-col justify-between space-y-4 hover:border-primary/30 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                        {r.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-foreground">{r.authorName}</div>
                        <div className="text-[10px] text-foreground/45 font-mono">
                          {new Date(r.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    {r.isVerifiedBuyer && (
                      <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        ✓ Verified Buyer
                      </span>
                    )}
                  </div>

                  {/* Stars */}
                  <div className="text-amber-400 text-xs">
                    {'★'.repeat(r.rating)}
                    <span className="text-foreground/20">{'★'.repeat(5 - r.rating)}</span>
                  </div>

                  {r.title && (
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">{r.title}</h4>
                  )}
                  <p className="text-xs sm:text-sm text-foreground/75 leading-relaxed">
                    {r.comment}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

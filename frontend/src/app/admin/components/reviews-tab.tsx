'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdminReview {
  id: string;
  productId: string;
  authorName: string;
  authorEmail: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerifiedBuyer: boolean;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
  product?: { id: string; title: string };
}

interface ReviewsTabProps {
  brandId: string;
  token: string;
  triggerToast: (msg: string, type: 'success' | 'error') => void;
}

export function ReviewsTab({ brandId, token, triggerToast }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'REJECTED'>('ALL');

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

  const fetchReviews = async () => {
    if (!brandId) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/reviews/brand/${brandId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to load reviews');
      const body = await res.json();
      const list = Array.isArray(body?.data) ? body.data : body?.data?.data || [];
      setReviews(list);
    } catch (err: any) {
      triggerToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [brandId]);

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'PENDING' | 'REJECTED') => {
    try {
      const res = await fetch(`${apiUrl}/reviews/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      triggerToast(`Review marked as ${status}`, 'success');
      fetchReviews();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const res = await fetch(`${apiUrl}/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete review');
      triggerToast('Review deleted successfully', 'success');
      fetchReviews();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const filtered = reviews.filter((r) => filterStatus === 'ALL' || r.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Reviews & Ratings</h2>
          <p className="text-xs text-foreground/60 mt-0.5">
            Moderate incoming reviews, audit ratings, and manage buyer feedback.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-muted/60 rounded-xl border border-border">
          {(['ALL', 'APPROVED', 'PENDING', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === s
                  ? 'bg-foreground text-background shadow-xs'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-xs text-foreground/40 animate-pulse">
          Loading reviews...
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-2 border-dashed">
          <span className="text-3xl select-none">💬</span>
          <h3 className="font-bold text-foreground text-sm">No reviews found</h3>
          <p className="text-xs text-foreground/50">
            {filterStatus === 'ALL'
              ? 'No customer reviews submitted yet.'
              : `No reviews with status ${filterStatus}.`}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{r.authorName}</span>
                  <span className="text-xs text-foreground/45">({r.authorEmail})</span>
                  <Badge variant={r.status === 'APPROVED' ? 'success' : r.status === 'PENDING' ? 'warning' : 'danger'}>
                    {r.status}
                  </Badge>
                  {r.isVerifiedBuyer && (
                    <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ Verified Buyer
                    </span>
                  )}
                  {r.product && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-muted text-foreground/70">
                      📦 {r.product.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  {'★'.repeat(r.rating)}
                  <span className="text-foreground/20">{'★'.repeat(5 - r.rating)}</span>
                </div>

                {r.title && <h4 className="text-xs font-bold text-foreground">{r.title}</h4>}
                <p className="text-xs text-foreground/75 leading-relaxed">{r.comment}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                {r.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors cursor-pointer border border-emerald-500/20"
                  >
                    Approve
                  </button>
                )}
                {r.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 text-xs font-semibold transition-colors cursor-pointer border border-amber-500/20"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(r.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-semibold transition-colors cursor-pointer border border-red-500/20"
                  title="Delete review"
                >
                  🗑️
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

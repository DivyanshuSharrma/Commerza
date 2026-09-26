'use client';

import { useState } from 'react';

interface OrderRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId?: string;
}

export function OrderRecoveryModal({ isOpen, onClose, brandId }: OrderRecoveryModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';
    try {
      const res = await fetch(`${apiUrl}/orders/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), brandId }),
      });

      const body = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(body?.message || 'Failed to request order recovery.');
      }

      setFeedback({
        message: body?.message || 'If an order was found, an email has been sent with your download links.',
        isError: false,
      });
    } catch (err: any) {
      setFeedback({
        message: err.message || 'Something went wrong. Please check your email or contact support.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/50 hover:text-foreground p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close recovery modal"
        >
          ✕
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-2xl mb-3">
            📦
          </div>
          <h2 className="text-xl font-bold text-foreground">Find My Orders</h2>
          <p className="text-xs text-foreground/70 mt-1">
            Lost your download link or receipt? Enter the email address you used during purchase and we will re-send active download links.
          </p>
        </div>

        {feedback ? (
          <div className="space-y-4">
            <div
              className={`p-4 rounded-xl border text-sm leading-relaxed ${
                feedback.isError
                  ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              {feedback.message}
            </div>
            <button
              onClick={() => {
                setFeedback(null);
                onClose();
              }}
              className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="recovery-email" className="block text-xs font-semibold text-foreground/80 mb-1.5">
                Your Email Address
              </label>
              <input
                id="recovery-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-foreground/40"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-foreground/75 hover:bg-border/50 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email}
                className="px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loading && <span className="animate-spin text-xs">🔄</span>}
                {loading ? 'Searching...' : 'Send Download Links'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

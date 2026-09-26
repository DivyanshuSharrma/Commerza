'use client';

import { useState } from 'react';

export function SupportClient({ defaultEmail = 'support@commerza.com' }: { defaultEmail?: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setFeedback(null);

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';
    try {
      const res = await fetch(`${apiUrl}/orders/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Failed to request order recovery.');
      setFeedback({
        message: data?.message || 'If an order was found, active download links have been dispatched to your email.',
        isError: false,
      });
    } catch (err: any) {
      setFeedback({
        message: err.message || 'Could not find any matching orders for this email.',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      q: 'How do I download my purchased digital products?',
      a: 'After checkout, you receive an instant download link on screen and via email. Click the link to access your secure download vault with cryptographically signed tokens.',
    },
    {
      q: 'What if I lost my link or changed computers?',
      a: 'Use the Order Lookup tool above. Enter the email address you purchased with, and our system will immediately re-dispatch all active download links to your inbox.',
    },
    {
      q: 'What license terms apply to purchased software?',
      a: 'Every product includes a perpetual commercial license. You can use it in unlimited client projects, SaaS products, and production apps without paying royalties.',
    },
    {
      q: 'How many times can I download the files?',
      a: 'Each order includes a generous download quota (default 5 to 10 downloads) and a 24-hour token window that can be regenerated anytime.',
    },
  ];

  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Customer Vault & Help
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
          Support & Order Recovery
        </h1>
        <p className="text-sm text-foreground/70">
          Retrieve active download tokens, review licensing terms, or contact our engineering desk.
        </p>
      </div>

      {/* Order Lookup Card */}
      <div className="bg-card border border-border/80 rounded-3xl p-8 sm:p-10 shadow-xs space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <span>📦</span>
            <span>Self-Serve Order Recovery</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Find Your Download Links</h2>
          <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">
            Enter the email address you used during checkout. If you have paid orders, we will instantly re-email you your active download links.
          </p>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
              feedback.isError
                ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleRecover} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your purchase email..."
            className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !email}
            className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Send Download Links'}
          </button>
        </form>
      </div>

      {/* FAQ Section */}
      <div className="space-y-6">
        <h3 className="text-2xl font-black text-foreground text-center">
          Frequently Answered Questions
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className="bg-card rounded-2xl border border-border/80 overflow-hidden shadow-2xs">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <span className="text-lg leading-none font-mono text-foreground/40">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-foreground/75 leading-relaxed border-t border-border/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Direct Contact Banner */}
      <div className="text-center p-8 rounded-3xl bg-surface-muted/60 border border-border/80 space-y-3">
        <h4 className="text-lg font-bold text-foreground">Need additional assistance?</h4>
        <p className="text-xs text-foreground/70 max-w-sm mx-auto">
          For custom license inquiries, enterprise deployment support, or billing queries, contact our desk.
        </p>
        <div>
          <a
            href={`mailto:${defaultEmail}`}
            className="inline-block px-5 py-2.5 rounded-full bg-foreground text-background font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Email Support ({defaultEmail})
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return <SupportClient />;
}

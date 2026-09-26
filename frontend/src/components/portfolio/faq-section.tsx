'use client';

import { useState } from 'react';

interface FaqSectionProps {
  onOpenRecovery: () => void;
}

export function FaqSection({ onOpenRecovery }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does digital delivery work upon checkout?',
      a: 'Immediately after your payment is confirmed, you are redirected to a secure order confirmation page containing your unique, cryptographically signed download token. Simultaneously, a fulfillment receipt containing your active download link is dispatched to your email address.',
    },
    {
      q: 'What happens if my browser crashes or I lose my download link?',
      a: 'We provide an instant self-serve recovery engine. Simply click "Find My Orders" in the navigation bar or footer, enter your checkout email address, and our system will instantly re-dispatch all active download tokens to your inbox.',
    },
    {
      q: 'Can I use these artifacts for commercial and client projects?',
      a: 'Yes! All digital purchases include an unrestricted commercial license permitting unlimited end-products and client deployments. You may not resell or redistribute the raw source code or asset packs as your own standalone digital product.',
    },
    {
      q: 'Do you offer custom engineering or architecture commissions?',
      a: 'Yes. The atelier accepts a strictly limited number of bespoke advisory, architecture design sprints, and custom feature implementations every quarter. You can reach out directly via the inquiry form below.',
    },
  ];

  return (
    <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-border/60">
      <div className="text-center mb-12 space-y-2">
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
          ✦ Questions & Clarity
        </div>
        <h2 className="text-3xl font-black text-foreground tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-foreground/70">
          Everything you need to know about purchasing, licensing, and accessing your digital artifacts.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="bg-card rounded-2xl border border-border/70 overflow-hidden transition-colors shadow-2xs"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-lg leading-none text-foreground/40 font-mono">
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-foreground/70 leading-relaxed border-t border-border/40">
                  {faq.a}
                  {i === 1 && (
                    <div className="mt-3">
                      <button
                        onClick={onOpenRecovery}
                        className="text-xs font-bold text-primary hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Open Order Recovery Portal</span>
                        <span>→</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

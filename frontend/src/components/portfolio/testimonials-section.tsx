'use client';

export function TestimonialsSection() {
  const reviews = [
    {
      author: 'Marcus Vance',
      role: 'Staff Engineer @ SaaSScale',
      comment:
        'The architecture and code clarity blew my mind. We integrated the boilerplate into our production pipeline in an afternoon and launched our product in 48 hours.',
      stars: 5,
    },
    {
      author: 'Elena Rostova',
      role: 'Founding Designer',
      comment:
        'Finally a creator who treats UI and code with the exact same rigor. The components are gorgeous, fully responsive, and completely devoid of messy hacks.',
      stars: 5,
    },
    {
      author: 'Liam Chen',
      role: 'Independent Indie Hacker',
      comment:
        'Instant delivery worked flawlessly. The tokenized download link arrived within 2 seconds of payment. Solid investment that paid for itself immediately.',
      stars: 5,
    },
  ];

  return (
    <section className="py-20 md:py-28 border-t border-border/60 bg-surface-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
            ✦ Builder Endorsements
          </div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">
            Trusted by Thousands of Developers & Founders
          </h2>
          <p className="text-xs sm:text-sm text-foreground/70">
            Real feedback from technical teams and creative founders who ship using our digital artifacts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, i) => (
            <div
              key={i}
              className="bg-card p-6 sm:p-7 rounded-2xl border border-border/70 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  {'★'.repeat(rev.stars)}
                </div>
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-foreground">{rev.author}</div>
                  <div className="text-[11px] text-foreground/60">{rev.role}</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

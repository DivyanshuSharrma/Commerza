import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Commercial MIT License Framework | Commerza Studio',
  description: 'Understand what you can build and distribute with your Commerza software licenses.',
};

export default function LicensePage() {
  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            ✦ Licensing Framework
          </span>
          <span className="text-[10px] font-mono text-emerald-500 font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Commercial Permissive
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-[1.1]">
          Single-License MIT Framework
        </h1>
        <p className="text-sm sm:text-base text-foreground/70 leading-relaxed max-w-2xl">
          Engineered for freedom. Build commercial SaaS, ship customer projects, and deploy unlimited instances with zero recurring royalties.
        </p>
      </div>

      {/* Main Articles */}
      <div className="space-y-8 text-foreground/80 leading-relaxed text-sm">
        {/* Section 1 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider font-mono">
            <span>✓ PERMITTED USAGE</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">What You Can Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border/60 space-y-1">
              <span className="font-bold text-foreground block">Commercial SaaS & Apps</span>
              <p className="text-foreground/70">
                Deploy as the backbone for revenue-generating SaaS platforms, web applications, or mobile backends.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border/60 space-y-1">
              <span className="font-bold text-foreground block">Unlimited Client Projects</span>
              <p className="text-foreground/70">
                Use our architectural boilerplates to deliver contracted client solutions without purchasing extra seats.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border/60 space-y-1">
              <span className="font-bold text-foreground block">Private Modifications</span>
              <p className="text-foreground/70">
                Modify, refactor, rewrite, and customize the underlying source code however your engineering stack demands.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-muted/60 border border-border/60 space-y-1">
              <span className="font-bold text-foreground block">Perpetual Ownership</span>
              <p className="text-foreground/70">
                One-time payment grants perpetual rights to the downloaded version. No recurring subscriptions or license phone-home checks.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider font-mono">
            <span>✕ RESTRICTIONS</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">What Is Not Allowed</h2>
          <div className="space-y-3 text-xs sm:text-sm text-foreground/70">
            <p>
              To protect the independent engineering ecosystem, our licenses maintain a single core restriction:
            </p>
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-foreground space-y-1">
              <span className="font-bold text-rose-500">No Raw Marketplace Resale</span>
              <p className="text-xs text-foreground/80">
                You may not repackage the unmodified or marginally modified source code and redistribute or sell it as a competing template, digital starter kit, or marketplace artifact.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
            <span>03 // IP OWNERSHIP</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Intellectual Property Ownership</h2>
          <p>
            You retain 100% intellectual property ownership of all custom business logic, features, unique designs, and domain implementations you create using Commerza artifacts.
          </p>
          <p>
            We claim zero equity, zero revenue cut, and zero ownership over applications built on our foundations.
          </p>
        </div>
      </div>

      {/* Footer Return Link */}
      <div className="pt-6 border-t border-border/60 flex items-center justify-between text-xs">
        <Link href="/" className="text-primary font-semibold hover:underline">
          &larr; Back to Studio Home
        </Link>
        <span className="font-mono text-foreground/45 text-[11px]">
          License Class: Single-Developer Commercial MIT
        </span>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { getBrandContext } from '@/features/brand/brand-context.resolver';

export default async function AboutPage() {
  const brand = await getBrandContext();
  const theme = brand.themeSettings;

  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Headline */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Our Philosophy
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-foreground tracking-tight leading-[1.08]">
          Software crafted with the rigor of physical architecture.
        </h1>
        <p className="text-base sm:text-lg text-foreground/75 leading-relaxed">
          {theme?.creatorBio ||
            'We build bespoke software foundations, developer tooling, and aesthetic UI kits for builders who refuse to compromise on quality and speed.'}
        </p>
      </div>

      {/* Visual Showcase Banner */}
      <div className="rounded-3xl overflow-hidden border border-border/80 shadow-xl bg-card">
        <img
          src="/images/code-engineering.jpg"
          alt="Engineering Craftsmanship"
          className="w-full h-auto object-cover max-h-[460px]"
        />
      </div>

      {/* Narrative Section: Apple Style Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm leading-relaxed text-foreground/80">
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-foreground">The Commerza Standard</h3>
          <p>
            In a tech landscape flooded with throwaway prototypes and convoluted subscription locks, Commerza was conceived with a single guiding thesis: digital craftsmanship should be built to endure.
          </p>
          <p>
            Every software package in our store undergoes continuous static analysis, strict TypeScript schema verification, and automated packaging into secure cryptographic download vaults.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-foreground">True Single-Purchase Ownership</h3>
          <p>
            We believe engineers and founders shouldn’t be held hostage by recurring monthly fees for code they depend upon. When you acquire an artifact from Commerza, you own the complete repository with perpetual commercial deployment rights.
          </p>
          <p>
            From modern responsive design systems to microservice backends, you obtain enterprise-grade foundations that accelerate your shipping velocity from day one.
          </p>
        </div>
      </div>

      {/* Creator Profile Box */}
      <div className="bg-card border border-border/80 rounded-3xl p-8 sm:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-foreground text-background flex items-center justify-center font-black text-xl shadow-sm">
            {brand.name.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-lg text-foreground">{brand.name} Studio</h4>
            <p className="text-xs text-foreground/60">{theme?.creatorRole || 'Principal Architect'}</p>
            <p className="text-[11px] text-foreground/50 mt-0.5">📍 {theme?.creatorLocation || 'Global / Remote'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/store"
            className="px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-full shadow-sm hover:bg-primary/90 transition-all"
          >
            Explore Catalog
          </Link>
          <Link
            href="/support"
            className="px-5 py-2.5 border border-border text-foreground font-semibold text-xs rounded-full hover:bg-surface-muted transition-colors"
          >
            Support & Inquiries
          </Link>
        </div>
      </div>
    </div>
  );
}

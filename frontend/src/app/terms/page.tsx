import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Sale | Commerza Studio',
  description: 'Terms of sale, digital artifact delivery terms, and customer rights for Commerza products.',
};

export default function TermsPage() {
  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            ✦ Commercial Agreement
          </span>
          <span className="text-[10px] font-mono text-emerald-500 font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Active Standard
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-[1.1]">
          Terms of Sale
        </h1>
        <p className="text-sm sm:text-base text-foreground/70 leading-relaxed max-w-2xl">
          Transparent, developer-first commercial terms governing digital artifact purchases, license grants, and digital asset distribution.
        </p>
      </div>

      {/* Main Articles */}
      <div className="space-y-8 text-foreground/80 leading-relaxed text-sm">
        {/* Section 1 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
            <span>01 // NATURE OF PURCHASE</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Immediate Digital Delivery</h2>
          <p>
            Commerza provides digital engineering assets, including source code repositories, architectural boilerplates, design systems, and cloud configurations.
          </p>
          <p>
            Upon successful checkout confirmation, access is delivered immediately through tokenized download vaults displayed in your browser and dispatched directly to your confirmed email address.
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
            <span>02 // LICENSE GRANT</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Commercial Perpetual Rights</h2>
          <p>
            Each purchased artifact includes an irrevocable, non-exclusive, worldwide commercial license. You are granted full rights to modify the code, build commercial client applications, deploy SaaS applications, and redistribute compiled binaries.
          </p>
          <p>
            For complete license boundaries, review our{' '}
            <Link href="/license" className="text-primary hover:underline font-semibold">
              Commercial MIT Framework
            </Link>
            .
          </p>
        </div>

        {/* Section 3 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
            <span>03 // REFUND POLICY</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Digital Assets & Refund Eligibility</h2>
          <p>
            Due to the immediate and irrevocable nature of digital source code delivery, standard retail return laws do not apply once digital files have been decrypted or downloaded.
          </p>
          <p>
            However, we stand behind our engineering quality. If an artifact is demonstrably broken, missing advertised architectural components, or fails our type-safety guarantee, contact our support desk within 14 days of purchase for immediate technical resolution or refund consideration.
          </p>
        </div>

        {/* Section 4 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
            <span>04 // LIFETIME TOKEN ACCESS</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Token Reissuance & Device Mobility</h2>
          <p>
            You are never locked out of your purchased assets. If you switch development machines or lose your download email, you can regenerate an active cryptographic token anytime using the{' '}
            <Link href="/support" className="text-primary hover:underline font-semibold">
              Self-Serve Order Lookup tool
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Footer Return Link */}
      <div className="pt-6 border-t border-border/60 flex items-center justify-between text-xs">
        <Link href="/" className="text-primary font-semibold hover:underline">
          &larr; Back to Studio Home
        </Link>
        <span className="font-mono text-foreground/45 text-[11px]">
          Terms Active: October 2026
        </span>
      </div>
    </div>
  );
}

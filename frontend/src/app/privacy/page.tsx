import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Framework | Commerza Studio',
  description: 'Our privacy standards, cryptographic token security, and customer data minimization policies.',
};

export default function PrivacyPage() {
  return (
    <div className="py-12 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
            ✦ Compliance & Security
          </span>
          <span className="text-[10px] font-mono text-emerald-500 font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            TLS 1.3 Verified
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-[1.1]">
          Privacy Framework
        </h1>
        <p className="text-sm sm:text-base text-foreground/70 leading-relaxed max-w-2xl">
          Engineered for minimal data footprint. We treat your transaction data and customer identifiers with zero-compromise architectural rigor.
        </p>
      </div>

      {/* Main Articles */}
      <div className="space-y-8 text-foreground/80 leading-relaxed text-sm">
        {/* Section 1 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
            <span>01 // PRINCIPLE</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Zero Telemetry & Minimal Data Collection</h2>
          <p>
            Commerza is not an ad network. We do not sell user data, track you across third-party websites, or embed invasive analytics scripts.
          </p>
          <p>
            When you interact with our platform, we only process the essential data required to issue digital licenses, verify checkout payments, and deliver cryptographic download links:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-foreground/70 text-xs sm:text-sm">
            <li>Customer email address (utilized exclusively to route access tokens and purchase receipts).</li>
            <li>Billing name and transaction metadata provided during checkout.</li>
            <li>Cryptographic access timestamps to protect your download token quotas.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
            <span>02 // PAYMENT SECURITY</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Isolated Payment Processing</h2>
          <p>
            Payment transactions are processed through tier-1 payment gateways (Stripe, Razorpay). Sensitive payment credentials (such as full credit card numbers, CVVs, and banking tokens) never transit or get stored on Commerza servers.
          </p>
          <p>
            All payment gateway exchanges are signed using cryptographic webhooks with HMAC signatures, ensuring zero tampering during checkout verification.
          </p>
        </div>

        {/* Section 3 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
            <span>03 // TOKEN SECURITY</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Cryptographic Delivery Vaults</h2>
          <p>
            Artifact downloads are guarded by 64-character hex cryptographic tokens. Download tokens have configurable expiry horizons and quota caps to prevent unauthorized hotlinking or unauthorized distribution.
          </p>
          <p>
            Customers can re-verify and refresh their active access tokens at any time using our self-serve order lookup tools with their purchase email.
          </p>
        </div>

        {/* Section 4 */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider font-mono">
            <span>04 // USER RIGHTS</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">Data Erasure & Contact</h2>
          <p>
            Under GDPR and international data standards, you maintain the right to inspect, export, or request the irreversible purge of your customer profile.
          </p>
          <p>
            For privacy inquiries or data requests, connect directly with our engineering advisory desk at{' '}
            <Link href="/support" className="text-primary hover:underline font-semibold">
              Support & Order Recovery
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
          Framework Last Revised: October 2026
        </span>
      </div>
    </div>
  );
}

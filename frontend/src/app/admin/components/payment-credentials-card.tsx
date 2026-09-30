'use client';

interface PaymentCredentialsCardProps {
  provider: string;
  form: {
    stripe_secret_key: string;
    stripe_webhook_secret: string;
    razorpay_key_id: string;
    razorpay_key_secret: string;
    razorpay_webhook_secret: string;
  };
  updateField: (key: string, value: string) => void;
  showSecrets: Record<string, boolean>;
  toggleShowSecret: (field: string) => void;
}

export function PaymentCredentialsCard({
  provider,
  form,
  updateField,
  showSecrets,
  toggleShowSecret,
}: PaymentCredentialsCardProps) {
  if (provider === 'STRIPE') {
    return (
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span>💳</span> Stripe API Credentials (AES-256 Encrypted)
          </h3>
          <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">
            Protected at Rest
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            Stripe Secret Key (sk_live_... / sk_test_...)
          </label>
          <div className="relative">
            <input
              type={showSecrets['stripe_secret_key'] ? 'text' : 'password'}
              value={form.stripe_secret_key}
              onChange={(e) => updateField('stripe_secret_key', e.target.value)}
              placeholder="Leave blank or masked to keep existing secret"
              className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => toggleShowSecret('stripe_secret_key')}
              className="absolute right-3 top-2.5 text-xs text-foreground/50 hover:text-foreground cursor-pointer"
            >
              {showSecrets['stripe_secret_key'] ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            Stripe Webhook Signing Secret (whsec_...)
          </label>
          <div className="relative">
            <input
              type={showSecrets['stripe_webhook_secret'] ? 'text' : 'password'}
              value={form.stripe_webhook_secret}
              onChange={(e) => updateField('stripe_webhook_secret', e.target.value)}
              placeholder="Leave blank or masked to keep existing secret"
              className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => toggleShowSecret('stripe_webhook_secret')}
              className="absolute right-3 top-2.5 text-xs text-foreground/50 hover:text-foreground cursor-pointer"
            >
              {showSecrets['stripe_webhook_secret'] ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (provider === 'RAZORPAY') {
    return (
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
            <span>⚡</span> Razorpay API Credentials (AES-256 Encrypted)
          </h3>
          <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-bold">
            Protected at Rest
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            Razorpay Key ID (rzp_live_... / rzp_test_...)
          </label>
          <input
            type="text"
            value={form.razorpay_key_id}
            onChange={(e) => updateField('razorpay_key_id', e.target.value)}
            placeholder="rzp_live_xxxxxxxxxxxxx"
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            Razorpay Key Secret
          </label>
          <div className="relative">
            <input
              type={showSecrets['razorpay_key_secret'] ? 'text' : 'password'}
              value={form.razorpay_key_secret}
              onChange={(e) => updateField('razorpay_key_secret', e.target.value)}
              placeholder="Leave blank or masked to keep existing secret"
              className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => toggleShowSecret('razorpay_key_secret')}
              className="absolute right-3 top-2.5 text-xs text-foreground/50 hover:text-foreground cursor-pointer"
            >
              {showSecrets['razorpay_key_secret'] ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            Razorpay Webhook Secret
          </label>
          <div className="relative">
            <input
              type={showSecrets['razorpay_webhook_secret'] ? 'text' : 'password'}
              value={form.razorpay_webhook_secret}
              onChange={(e) => updateField('razorpay_webhook_secret', e.target.value)}
              placeholder="Webhook HMAC Secret configured in Razorpay Dashboard"
              className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => toggleShowSecret('razorpay_webhook_secret')}
              className="absolute right-3 top-2.5 text-xs text-foreground/50 hover:text-foreground cursor-pointer"
            >
              {showSecrets['razorpay_webhook_secret'] ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

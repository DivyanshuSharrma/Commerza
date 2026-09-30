'use client';

import { useState, useEffect } from 'react';
import { PaymentCredentialsCard } from './payment-credentials-card';
import { EmailStorageCredentialsCard } from './email-storage-credentials-card';

interface Setting {
  key: string;
  value: string;
  level: 'SYSTEM' | 'GLOBAL' | 'BRAND' | 'PRODUCT' | 'ORDER';
  entityId?: string | null;
  isSensitive?: boolean;
  isConfigured?: boolean;
}

interface ProvidersTabProps {
  settings: Setting[];
  loading: boolean;
  brandId?: string;
  onSubmit: (data: any) => Promise<void>;
}

export function ProvidersTab({ settings, loading, brandId, onSubmit }: ProvidersTabProps) {
  const [form, setForm] = useState({
    // Core provider toggles
    storage_provider: 'LOCAL',
    payment_provider: 'MOCK',
    email_provider: 'MOCK',
    download_limit: '5',
    link_expiry_hours: '24',

    // Stripe Credentials
    stripe_secret_key: '',
    stripe_webhook_secret: '',

    // Razorpay Credentials
    razorpay_key_id: '',
    razorpay_key_secret: '',
    razorpay_webhook_secret: '',

    // Resend Credentials
    resend_api_key: '',

    // SMTP Credentials
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',

    // S3 / R2 Credentials
    aws_access_key_id: '',
    aws_secret_access_key: '',
    aws_bucket_name: '',
    aws_region: 'us-east-1',
    aws_endpoint: '',
  });

  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleShowSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Load database settings into form state with priority (SYSTEM < GLOBAL < BRAND)
  useEffect(() => {
    if (settings.length > 0) {
      const nextForm = { ...form };
      const levelPriority: Record<string, number> = { SYSTEM: 1, GLOBAL: 2, BRAND: 3 };
      const resolvedValues: Record<string, { value: string; priority: number }> = {};

      settings.forEach((s) => {
        if (!(s.key in nextForm)) return;

        const priority = levelPriority[s.level] || 0;
        if (s.level === 'BRAND' && brandId && s.entityId !== brandId) {
          return;
        }

        const existing = resolvedValues[s.key];
        if (!existing || priority > existing.priority) {
          resolvedValues[s.key] = { value: s.value, priority };
        }
      });

      Object.entries(resolvedValues).forEach(([key, item]) => {
        (nextForm as any)[key] = item.value;
      });

      setForm(nextForm);
    }
  }, [settings, brandId]);

  // Browser exit warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
      setIsDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl animate-pulse">
        <div className="h-9 bg-foreground/10 rounded w-1/2"></div>
        <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-foreground/10 rounded w-1/3"></div>
              <div className="h-10 bg-foreground/5 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground">Strategy Configuration</h2>
          <p className="text-xs text-foreground/60 mt-1">
            Pluggable storage, payment gateways, and email strategies with AES-256 encrypted credentials.
          </p>
        </div>
        {isDirty && (
          <span className="text-xs font-semibold text-yellow-600 bg-yellow-500/10 px-2.5 py-1 rounded-full animate-pulse">
            ⚠️ Unsaved Changes
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Strategy Selection Card */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-foreground border-b border-border pb-2.5">
            Active Provider Engine Selection
          </h3>

          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Payment Gateway Engine
            </label>
            <select
              value={form.payment_provider}
              onChange={(e) => updateField('payment_provider', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm cursor-pointer"
            >
              <option value="MOCK">Mock Checkout Gate (Local Sandbox)</option>
              <option value="STRIPE">Stripe Payments (Credit Cards / Apple Pay / Google Pay)</option>
              <option value="RAZORPAY">Razorpay (UPI / NetBanking / Cards / Wallets)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Transactional Email Engine
            </label>
            <select
              value={form.email_provider}
              onChange={(e) => updateField('email_provider', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm cursor-pointer"
            >
              <option value="MOCK">Mock Console Logging (Dev Mode)</option>
              <option value="RESEND">Resend Transactional API</option>
              <option value="SMTP">Custom SMTP (Nodemailer)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Digital Storage Engine
            </label>
            <select
              value={form.storage_provider}
              onChange={(e) => updateField('storage_provider', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm cursor-pointer"
            >
              <option value="LOCAL">Protected Local Storage Vault</option>
              <option value="S3">Amazon Web Services (AWS S3)</option>
              <option value="R2">Cloudflare R2 Object Storage</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Download Limit (Clicks / Order)
              </label>
              <input
                type="number"
                min={1}
                value={form.download_limit}
                onChange={(e) => updateField('download_limit', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Link Expiry Window (Hours)
              </label>
              <input
                type="number"
                min={1}
                value={form.link_expiry_hours}
                onChange={(e) => updateField('link_expiry_hours', e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Payment Provider Credentials */}
        <PaymentCredentialsCard
          provider={form.payment_provider}
          form={form}
          updateField={updateField}
          showSecrets={showSecrets}
          toggleShowSecret={toggleShowSecret}
        />

        {/* Dynamic Email & Storage Provider Credentials */}
        <EmailStorageCredentialsCard
          emailProvider={form.email_provider}
          storageProvider={form.storage_provider}
          form={form}
          updateField={updateField}
          showSecrets={showSecrets}
          toggleShowSecret={toggleShowSecret}
        />

        <button
          type="submit"
          disabled={saving}
          className="bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer text-sm shadow-md"
        >
          {saving ? 'Encrypting & Saving Credentials...' : 'Save Strategy Configuration'}
        </button>
      </form>
    </div>
  );
}

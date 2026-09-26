'use client';

import { useState, useEffect } from 'react';

interface Setting {
  key: string;
  value: string;
  level: 'SYSTEM' | 'GLOBAL' | 'BRAND' | 'PRODUCT' | 'ORDER';
  entityId?: string | null;
}

interface ProvidersTabProps {
  settings: Setting[];
  loading: boolean;
  brandId?: string;
  onSubmit: (data: any) => Promise<void>;
}

export function ProvidersTab({ settings, loading, brandId, onSubmit }: ProvidersTabProps) {
  const [form, setForm] = useState({
    storage_provider: 'LOCAL',
    payment_provider: 'MOCK',
    email_provider: 'MOCK',
    download_limit: '5',
    link_expiry_hours: '24',
  });

  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

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

  // Track if form is dirty compared to loaded settings
  useEffect(() => {
    if (settings.length > 0) {
      const cleanForm: any = {
        storage_provider: 'LOCAL',
        payment_provider: 'MOCK',
        email_provider: 'MOCK',
        download_limit: '5',
        link_expiry_hours: '24',
      };
      
      const levelPriority: Record<string, number> = { SYSTEM: 1, GLOBAL: 2, BRAND: 3 };
      const resolvedValues: Record<string, { value: string; priority: number }> = {};

      settings.forEach((s) => {
        if (!(s.key in cleanForm)) return;

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
        cleanForm[key] = item.value;
      });

      const dirty = Object.keys(cleanForm).some(
        (key) => String(cleanForm[key]) !== String((form as any)[key])
      );
      setIsDirty(dirty);
    }
  }, [form, settings, brandId]);

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

  if (loading) {
    return (
      <div className="space-y-6 max-w-xl animate-pulse">
        <div className="h-9 bg-foreground/10 rounded w-1/2"></div>
        <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-foreground/10 rounded w-1/3"></div>
              <div className="h-10 bg-foreground/5 rounded w-full"></div>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-foreground/10 rounded w-1/2"></div>
                <div className="h-10 bg-foreground/5 rounded w-full"></div>
              </div>
            ))}
          </div>
          <div className="h-10 bg-foreground/10 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-foreground">Strategy Configuration</h2>
        {isDirty && (
          <span className="text-xs font-semibold text-yellow-600 bg-yellow-500/10 px-2.5 py-1 rounded-full animate-pulse">
            ⚠️ Unsaved Changes
          </span>
        )}
      </div>
      <form onSubmit={handleSubmit} className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            Active Storage Strategy
          </label>
          <select
            value={form.storage_provider}
            onChange={(e) => setForm({ ...form, storage_provider: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm cursor-pointer"
          >
            <option value="LOCAL">Local File Storage</option>
            <option value="S3">AWS S3</option>
            <option value="R2">Cloudflare R2</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            Active Payment Strategy
          </label>
          <select
            value={form.payment_provider}
            onChange={(e) => setForm({ ...form, payment_provider: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm cursor-pointer"
          >
            <option value="MOCK">Mock Checkout Gate</option>
            <option value="STRIPE">Stripe Payments</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            Active Email Strategy
          </label>
          <select
            value={form.email_provider}
            onChange={(e) => setForm({ ...form, email_provider: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm cursor-pointer"
          >
            <option value="MOCK">Mock Console Logging</option>
            <option value="SMTP">Nodemailer SMTP</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Download Clicks Limit
            </label>
            <input
              type="number"
              min={1}
              value={form.download_limit}
              onChange={(e) => setForm({ ...form, download_limit: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Link Expiry (Hours)
            </label>
            <input
              type="number"
              min={1}
              value={form.link_expiry_hours}
              onChange={(e) => setForm({ ...form, link_expiry_hours: e.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-lg transition-all cursor-pointer text-sm"
        >
          {saving ? 'Saving Strategy Settings...' : 'Apply Provider Settings'}
        </button>
      </form>
    </div>
  );
}

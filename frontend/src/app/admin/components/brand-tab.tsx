'use client';

import { useState, useEffect } from 'react';

interface BrandTabProps {
  brandForm: {
    name: string;
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    heroTitle: string;
    heroSubtitle: string;
  };
  setBrandForm: (val: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BrandTab({ brandForm, setBrandForm, onSubmit }: BrandTabProps) {
  const [initialForm, setInitialForm] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Capture initial loaded form configuration
  useEffect(() => {
    if (!initialForm && brandForm.name) {
      setInitialForm({ ...brandForm });
    }
  }, [brandForm]);

  // Check if form is dirty
  useEffect(() => {
    if (initialForm) {
      const dirty = Object.keys(initialForm).some(
        (key) => String((initialForm as any)[key]) !== String((brandForm as any)[key])
      );
      setIsDirty(dirty);
    }
  }, [brandForm, initialForm]);

  // Alert before exit on unsaved data
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

  const handleReset = () => {
    if (initialForm) {
      setBrandForm({ ...initialForm });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(e);
      setInitialForm({ ...brandForm });
      setIsDirty(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-extrabold text-foreground">Brand Configuration</h2>
        {isDirty && (
          <span className="text-xs font-semibold text-yellow-600 bg-yellow-500/10 px-2.5 py-1 rounded-full animate-pulse">
            ⚠️ Unsaved Changes
          </span>
        )}
      </div>
      <form onSubmit={handleFormSubmit} className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            Storefront Name
          </label>
          <input
            type="text"
            required
            value={brandForm.name}
            onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Logo Image URL
            </label>
            <input
              type="text"
              value={brandForm.logoUrl}
              onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
              placeholder="e.g. /logo.png"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            {brandForm.logoUrl && (
              <div className="mt-2 p-2 border border-border rounded-lg bg-foreground/5 flex items-center gap-2">
                <span className="text-[10px] font-semibold text-foreground/50">Logo Preview:</span>
                <img 
                  src={brandForm.logoUrl} 
                  alt="Logo Preview" 
                  className="h-6 w-auto max-w-[100px] object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Favicon Icon URL
            </label>
            <input
              type="text"
              value={brandForm.faviconUrl}
              onChange={(e) => setBrandForm({ ...brandForm, faviconUrl: e.target.value })}
              placeholder="e.g. /favicon.ico"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            {brandForm.faviconUrl && (
              <div className="mt-2 p-2 border border-border rounded-lg bg-foreground/5 flex items-center gap-2">
                <span className="text-[10px] font-semibold text-foreground/50">Favicon Preview:</span>
                <img 
                  src={brandForm.faviconUrl} 
                  alt="Favicon Preview" 
                  className="h-5 w-5 object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Primary Theme Color ({brandForm.primaryColor})
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={brandForm.primaryColor}
                onChange={(e) => setBrandForm({ ...brandForm, primaryColor: e.target.value })}
                className="w-12 h-10 p-1 bg-background border border-border rounded-lg cursor-pointer"
              />
              <span className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: brandForm.primaryColor }}></span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Secondary Theme Color ({brandForm.secondaryColor})
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={brandForm.secondaryColor}
                onChange={(e) => setBrandForm({ ...brandForm, secondaryColor: e.target.value })}
                className="w-12 h-10 p-1 bg-background border border-border rounded-lg cursor-pointer"
              />
              <span className="w-6 h-6 rounded-full border border-border" style={{ backgroundColor: brandForm.secondaryColor }}></span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            Hero Welcome Title
          </label>
          <input
            type="text"
            value={brandForm.heroTitle}
            onChange={(e) => setBrandForm({ ...brandForm, heroTitle: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/70 mb-1">
            Hero Subtitle
          </label>
          <textarea
            value={brandForm.heroSubtitle}
            onChange={(e) => setBrandForm({ ...brandForm, heroSubtitle: e.target.value })}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm h-20"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-lg transition-colors cursor-pointer text-sm"
          >
            {saving ? 'Saving...' : 'Save Storefront Branding'}
          </button>
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="border border-border hover:bg-foreground/5 text-foreground font-bold py-2.5 px-5 rounded-lg transition-colors cursor-pointer text-sm"
            >
              Reset Changes
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

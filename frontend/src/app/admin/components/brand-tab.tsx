'use client';

import { useState, useEffect } from 'react';

interface BrandTabProps {
  brandForm: {
    name: string;
    logoUrl: string;
    faviconUrl: string;
    primaryColor: string;
    secondaryColor: string;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    creatorBio: string;
    creatorRole: string;
    creatorLocation: string;
    skills: string;
    hireEmail: string;
  };
  setBrandForm: (val: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BrandTab({ brandForm, setBrandForm, onSubmit }: BrandTabProps) {
  const [initialForm, setInitialForm] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!initialForm && brandForm.name) {
      setInitialForm({ ...brandForm });
    }
  }, [brandForm, initialForm]);

  useEffect(() => {
    if (initialForm) {
      const dirty = Object.keys(initialForm).some(
        (key) => String((initialForm as any)[key]) !== String((brandForm as any)[key])
      );
      setIsDirty(dirty);
    }
  }, [brandForm, initialForm]);

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
    <div className="space-y-8 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-foreground">Brand & Portfolio Studio</h2>
          <p className="text-xs text-foreground/60 mt-0.5">
            Configure your storefront identity, creator bio, and dynamic landing page showcase.
          </p>
        </div>
        {isDirty && (
          <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 animate-pulse">
            ⚠️ Unsaved Changes
          </span>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* 1. Core Store & Visual Identity */}
        <div className="bg-card border border-border/80 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/60 pb-2 flex items-center gap-2">
            <span>🎨</span>
            <span>Visual Branding & Colors</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Storefront / Studio Name
              </label>
              <input
                type="text"
                required
                value={brandForm.name}
                onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Logo Image URL
              </label>
              <input
                type="text"
                value={brandForm.logoUrl}
                onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
                placeholder="e.g. /logo.png"
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Primary Brand Color ({brandForm.primaryColor})
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={brandForm.primaryColor}
                  onChange={(e) => setBrandForm({ ...brandForm, primaryColor: e.target.value })}
                  className="w-10 h-9 p-1 bg-background border border-border rounded-lg cursor-pointer"
                />
                <span className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: brandForm.primaryColor }} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Secondary Brand Color ({brandForm.secondaryColor})
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={brandForm.secondaryColor}
                  onChange={(e) => setBrandForm({ ...brandForm, secondaryColor: e.target.value })}
                  className="w-10 h-9 p-1 bg-background border border-border rounded-lg cursor-pointer"
                />
                <span className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: brandForm.secondaryColor }} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Hero & Landing Showcase Copy */}
        <div className="bg-card border border-border/80 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/60 pb-2 flex items-center gap-2">
            <span>✨</span>
            <span>Hero Showcase & Manifesto</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Top Badge Text
            </label>
            <input
              type="text"
              value={brandForm.heroBadge}
              onChange={(e) => setBrandForm({ ...brandForm, heroBadge: e.target.value })}
              placeholder="e.g. ✦ INDEPENDENT CREATIVE ATELIER"
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Main Hero Headline
            </label>
            <input
              type="text"
              required
              value={brandForm.heroTitle}
              onChange={(e) => setBrandForm({ ...brandForm, heroTitle: e.target.value })}
              placeholder="e.g. Architecting Next-Gen Digital Goods & Codecraft"
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Hero Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={brandForm.heroSubtitle}
              onChange={(e) => setBrandForm({ ...brandForm, heroSubtitle: e.target.value })}
              placeholder="Describe your product catalog value proposition..."
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
            />
          </div>
        </div>

        {/* 3. Creator Profile & Philosophy */}
        <div className="bg-card border border-border/80 p-6 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground border-b border-border/60 pb-2 flex items-center gap-2">
            <span>👤</span>
            <span>Creator Persona & Advisory</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Creator Role / Tagline
              </label>
              <input
                type="text"
                value={brandForm.creatorRole}
                onChange={(e) => setBrandForm({ ...brandForm, creatorRole: e.target.value })}
                placeholder="e.g. Principal Systems Designer"
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Location
              </label>
              <input
                type="text"
                value={brandForm.creatorLocation}
                onChange={(e) => setBrandForm({ ...brandForm, creatorLocation: e.target.value })}
                placeholder="e.g. Global / Remote"
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground/70 mb-1">
              Creator Manifesto & Bio
            </label>
            <textarea
              rows={3}
              value={brandForm.creatorBio}
              onChange={(e) => setBrandForm({ ...brandForm, creatorBio: e.target.value })}
              placeholder="Your engineering or design philosophy..."
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Tech Stack Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={brandForm.skills}
                onChange={(e) => setBrandForm({ ...brandForm, skills: e.target.value })}
                placeholder="TypeScript, Next.js, NestJS, Prisma"
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">
                Advisory / Commission Contact Email
              </label>
              <input
                type="email"
                value={brandForm.hireEmail}
                onChange={(e) => setBrandForm({ ...brandForm, hireEmail: e.target.value })}
                placeholder="e.g. hire@commerza.com"
                className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-primary/25 transition-all cursor-pointer flex items-center gap-2"
          >
            {saving && <span className="animate-spin text-xs">🔄</span>}
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';

interface FeatureFlagsTabProps {
  flags: Record<string, boolean>;
  onToggle: (name: string) => Promise<void>;
}

export function FeatureFlagsTab({ flags, onToggle }: FeatureFlagsTabProps) {
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [criticalConfirm, setCriticalConfirm] = useState<{ key: string; label: string } | null>(null);

  const flagKeys = [
    { key: 'flag_coupons', label: 'Coupons Discount Engine', desc: 'Allow shoppers to redeem coupon code deductions during checkout.', critical: true },
    { key: 'flag_reviews', label: 'Shopper Reviews & Ratings', desc: 'Render feedback forms and star ratings on digital product cards.' },
    { key: 'flag_invoices', label: 'Auto-Generate PDF Invoices', desc: 'Email PDF receipts immediately after confirmation.', critical: true },
    { key: 'flag_affiliate', label: 'Affiliate Referral Network', desc: 'Track affiliate commission codes on incoming storefront links.' },
    { key: 'flag_analytics', label: 'Analytics Pixels Tracking', desc: 'Inject tracking code scripts into customer storefront layouts.' },
    { key: 'flag_social_login', label: 'OAuth Social Logins', desc: 'Enable sign-in helpers using Google and GitHub profiles.' },
  ];

  const handleToggleClick = async (key: string, isCurrentlyEnabled: boolean, critical?: boolean) => {
    // If it's a critical flag and we are turning it OFF, require user confirmation
    if (critical && isCurrentlyEnabled) {
      const flagInfo = flagKeys.find((f) => f.key === key);
      setCriticalConfirm({ key, label: flagInfo?.label || key });
      return;
    }
    await executeToggle(key);
  };

  const executeToggle = async (key: string) => {
    setTogglingKey(key);
    try {
      await onToggle(key);
    } finally {
      setTogglingKey(null);
      setCriticalConfirm(null);
    }
  };

  return (
    <div className="space-y-6 max-w-xl relative">
      <h2 className="text-3xl font-extrabold text-foreground">Feature Flag Controls</h2>

      {/* Critical Change Confirmation */}
      {criticalConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground mb-2">Disable System Feature?</h3>
            <p className="text-sm text-foreground/75 mb-6">
              Deactivating <strong>{criticalConfirm.label}</strong> is a critical action. It will immediately disable this pipeline for all active shoppers.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => executeToggle(criticalConfirm.key)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm cursor-pointer"
              >
                Disable Feature
              </button>
              <button
                onClick={() => setCriticalConfirm(null)}
                className="bg-foreground/10 hover:bg-foreground/20 text-foreground font-medium py-2 px-5 rounded-lg transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 divide-y divide-border">
        {flagKeys.map((flag, idx) => {
          const isEnabled = flags[flag.key] ?? false;
          const isToggling = togglingKey === flag.key;
          
          return (
            <div
              key={flag.key}
              className={`flex items-center justify-between py-4 ${idx === 0 ? 'pt-0' : ''}`}
            >
              <div className="space-y-0.5 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground text-sm">{flag.label}</span>
                  {flag.critical && (
                    <span className="text-[9px] bg-red-500/10 text-red-500 font-bold px-1.5 py-0.5 rounded">
                      CRITICAL
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/50">{flag.desc}</p>
              </div>
              <button
                onClick={() => handleToggleClick(flag.key, isEnabled, flag.critical)}
                disabled={isToggling}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none disabled:opacity-50 ${
                  isEnabled ? 'bg-primary' : 'bg-foreground/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isToggling ? 'translate-x-3.5 bg-foreground/20' : isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

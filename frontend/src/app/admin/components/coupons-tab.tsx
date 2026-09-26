'use client';

import { useState } from 'react';

interface Coupon {
  id: string;
  code: string;
  discount: string;
  isPercent: boolean;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usageCount: number;
  active: boolean;
}

interface CouponsTabProps {
  coupons: Coupon[];
  onCreate: (data: any) => Promise<void>;
  onUpdate: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => void;
}

export function CouponsTab({ coupons, onCreate, onUpdate, onDelete }: CouponsTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'DISABLED'>('ALL');
  const [form, setForm] = useState<{
    code: string;
    discount: number | '';
    isPercent: boolean;
    expiresAt: string;
    usageLimit: string;
  }>({
    code: '',
    discount: 10,
    isPercent: true,
    expiresAt: '',
    usageLimit: '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      code: form.code,
      discount: Number(form.discount),
      isPercent: form.isPercent,
      expiresAt: form.expiresAt || null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
    };

    try {
      if (editingId) {
        await onUpdate(editingId, payload);
        setEditingId(null);
      } else {
        await onCreate(payload);
      }

      setForm({
        code: '',
        discount: 10,
        isPercent: true,
        expiresAt: '',
        usageLimit: '',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      discount: Number(c.discount),
      isPercent: c.isPercent,
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().split('T')[0] : '',
      usageLimit: c.usageLimit ? String(c.usageLimit) : '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({
      code: '',
      discount: 10,
      isPercent: true,
      expiresAt: '',
      usageLimit: '',
    });
  };

  const toggleActive = async (c: Coupon) => {
    await onUpdate(c.id, { active: !c.active });
  };

  // Get status state for a coupon
  const getCouponState = (c: Coupon): 'ACTIVE' | 'EXPIRED' | 'DISABLED' => {
    if (!c.active) return 'DISABLED';
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return 'EXPIRED';
    return 'ACTIVE';
  };

  // Filter coupons
  const filtered = coupons.filter((c) => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const state = getCouponState(c);
    const matchesStatus = statusFilter === 'ALL' || state === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="max-w-xl bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-foreground">
          {editingId ? 'Edit Discount Coupon' : 'Create Promo Coupon'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">Coupon Code</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SAVE20"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">Discount Amount</label>
              <input
                type="number"
                required
                min={1}
                max={form.isPercent ? 100 : 1000}
                value={form.discount === '' || isNaN(Number(form.discount)) ? '' : form.discount}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({ ...form, discount: val === '' ? '' : parseFloat(val) });
                }}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="block text-xs font-semibold text-foreground/70">Discount Type:</label>
            <div className="flex items-center gap-2 text-sm text-foreground/80">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  checked={form.isPercent}
                  onChange={() => setForm({ ...form, isPercent: true })}
                />
                Percentage (%)
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  checked={!form.isPercent}
                  onChange={() => setForm({ ...form, isPercent: false })}
                />
                Flat Rate ($)
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/70 mb-1">Usage Limit (Optional)</label>
              <input
                type="number"
                min={1}
                value={form.usageLimit}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                placeholder="Unlimited"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-lg transition-colors cursor-pointer text-sm"
            >
              {saving ? 'Processing...' : editingId ? 'Save Changes' : 'Create Coupon'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="border border-border hover:bg-foreground/5 text-foreground font-bold py-2.5 px-5 rounded-lg transition-colors cursor-pointer text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Local Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-2xl shadow-sm">
        <input
          type="text"
          placeholder="Search by promo code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono font-bold"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full sm:w-44 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Coupons</option>
          <option value="DISABLED">Disabled Coupons</option>
          <option value="EXPIRED">Expired Coupons</option>
        </select>
      </div>

      {/* Coupons Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">Discount Coupons Directory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-foreground/5 text-xs font-semibold text-foreground/75 border-b border-border">
                <th className="px-6 py-3">Promo Code</th>
                <th className="px-6 py-3">Discount</th>
                <th className="px-6 py-3">Uses / Limit</th>
                <th className="px-6 py-3">Expiry</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm text-foreground/75">
              {filtered.map((c) => {
                const couponState = getCouponState(c);
                const progressPct = c.usageLimit ? Math.min((c.usageCount / c.usageLimit) * 100, 100) : null;
                
                return (
                  <tr key={c.id} className="hover:bg-foreground/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-foreground">{c.code}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {c.isPercent ? `${parseFloat(c.discount).toFixed(0)}%` : `$${parseFloat(c.discount).toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="space-y-1">
                        <div>{c.usageCount} / {c.usageLimit || '∞'}</div>
                        {progressPct !== null && (
                          <div className="w-24 h-1 bg-foreground/10 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${progressPct}%` }}></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/60">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                          couponState === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                            : couponState === 'EXPIRED'
                            ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        }`}
                      >
                        {couponState}
                      </button>
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => handleEditClick(c)}
                        className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 rounded transition-colors font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(c.id)}
                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 px-2.5 py-1 rounded transition-colors font-semibold cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-foreground/50">
                    No matching coupon codes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

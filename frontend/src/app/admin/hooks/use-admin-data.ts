'use client';

import { useState, useEffect, useCallback } from 'react';

export function useAdminData(token: string | null) {
  const [loadingData, setLoadingData] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [adminUser, setAdminUser] = useState({ name: 'Admin', email: 'admin@commerza.com' });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const [brandForm, setBrandForm] = useState({
    name: 'Commerza Studio',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#06b6d4',
    heroBadge: '',
    heroTitle: '',
    heroSubtitle: '',
    creatorBio: '',
    creatorRole: '',
    creatorLocation: '',
    skills: '',
    hireEmail: '',
  });

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const authFetch = useCallback(
    (path: string, options: RequestInit = {}) =>
      fetch(`${apiUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      }),
    [apiUrl, token]
  );

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [brandRes, prodRes, catRes, orderRes, custRes, couponRes, settingsRes, flagsRes, auditRes, profileRes] =
        await Promise.all([
          fetch(`${apiUrl}/brands`),
          fetch(`${apiUrl}/products`),
          fetch(`${apiUrl}/categories`),
          fetch(`${apiUrl}/orders`, { headers }),
          fetch(`${apiUrl}/customers`, { headers }),
          fetch(`${apiUrl}/coupons`, { headers }),
          fetch(`${apiUrl}/settings`, { headers }),
          fetch(`${apiUrl}/feature-flags`),
          fetch(`${apiUrl}/audit-logs`, { headers }),
          fetch(`${apiUrl}/auth/profile`, { headers }),
        ]);

      if (brandRes.ok) {
        const body = await brandRes.json();
        const data = body.data || [];
        if (data.length > 0) {
          const b = data[0];
          setSelectedBrandId(b.id);
          const t = b.themeSettings || {};
          setBrandForm({
            name: b.name || '',
            logoUrl: b.logoUrl || '',
            faviconUrl: b.faviconUrl || '',
            primaryColor: b.primaryColor || '#4f46e5',
            secondaryColor: b.secondaryColor || '#06b6d4',
            heroBadge: t.heroBadge || '',
            heroTitle: t.heroTitle || '',
            heroSubtitle: t.heroSubtitle || '',
            creatorBio: t.creatorBio || '',
            creatorRole: t.creatorRole || '',
            creatorLocation: t.creatorLocation || '',
            skills: Array.isArray(t.skills) ? t.skills.join(', ') : t.skills || '',
            hireEmail: t.hireEmail || '',
          });
        }
      }

      if (prodRes.ok) setProducts((await prodRes.json()).data || []);
      if (catRes.ok) setCategories((await catRes.json()).data || []);
      if (orderRes.ok) setOrders((await orderRes.json()).data || []);
      if (custRes.ok) setCustomers((await custRes.json()).data || []);
      if (couponRes.ok) setCoupons((await couponRes.json()).data || []);
      if (settingsRes.ok) setSettings((await settingsRes.json()).data || []);
      if (flagsRes.ok) setFlags((await flagsRes.json()).data || {});
      if (auditRes.ok) setAuditLogs((await auditRes.json()).data || []);
      if (profileRes.ok) {
        const prof = await profileRes.json();
        setAdminUser(prof.data || prof);
      }
    } catch (err) {
      console.error('Error synchronizing database metrics:', err);
    } finally {
      setLoadingData(false);
    }
  }, [token, apiUrl]);

  useEffect(() => {
    if (token) loadData();
  }, [token, loadData]);

  // Product Operations
  const handleCreateProduct = async (productData: any) => {
    try {
      const res = await authFetch('/products', { method: 'POST', body: JSON.stringify(productData) });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || 'Failed to create product');
      triggerToast('Product created successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setConfirmModal({
      message: 'Delete this product? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const res = await authFetch(`/products/${productId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete product');
          triggerToast('Product deleted successfully', 'success');
          loadData();
        } catch (err: any) {
          triggerToast(err.message, 'error');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  const handleTogglePublish = async (productId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
    try {
      const res = await authFetch(`/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Status update failed');
      triggerToast(`Product status updated to ${nextStatus}`, 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Order Operations
  const handleFetchOrderDetails = async (id: string) => {
    const res = await authFetch(`/orders/${id}`);
    if (!res.ok) throw new Error('Failed to fetch order details');
    const body = await res.json();
    return body.data || body;
  };

  const handleResendEmail = async (id: string) => {
    try {
      const res = await authFetch(`/orders/${id}/resend-email`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to resend fulfillment email');
      triggerToast('Fulfillment email resent successfully!', 'success');
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleRegenerateLink = async (id: string) => {
    try {
      const res = await authFetch(`/orders/${id}/regenerate-link`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to regenerate link');
      const body = await res.json();
      triggerToast('Download link regenerated successfully!', 'success');
      loadData();
      return body.data || body;
    } catch (err: any) {
      triggerToast(err.message, 'error');
      throw err;
    }
  };

  // Customer Operations
  const handleCustomerStatusToggle = async (customerId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await authFetch(`/customers/${customerId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error('Failed to update customer status');
      triggerToast(`Customer status updated to ${nextStatus}`, 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Coupon Operations
  const handleCreateCoupon = async (couponData: any) => {
    try {
      const res = await authFetch('/coupons', { method: 'POST', body: JSON.stringify(couponData) });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || 'Failed to create coupon');
      triggerToast('Coupon created successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
      throw err;
    }
  };

  const handleCouponUpdate = async (id: string, payload: any) => {
    try {
      const res = await authFetch(`/coupons/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Coupon update failed');
      triggerToast('Coupon updated successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleDeleteCoupon = (couponId: string) => {
    setConfirmModal({
      message: 'Delete this coupon code?',
      onConfirm: async () => {
        try {
          const res = await authFetch(`/coupons/${couponId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete coupon');
          triggerToast('Coupon deleted successfully', 'success');
          loadData();
        } catch (err: any) {
          triggerToast(err.message, 'error');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  // Category Operations
  const handleCreateCategory = async (catData: any) => {
    try {
      const res = await authFetch('/categories', { method: 'POST', body: JSON.stringify(catData) });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || 'Failed to create category');
      triggerToast('Category created successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setConfirmModal({
      message: 'Delete this category?',
      onConfirm: async () => {
        try {
          const res = await authFetch(`/categories/${categoryId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete category');
          triggerToast('Category deleted successfully', 'success');
          loadData();
        } catch (err: any) {
          triggerToast(err.message, 'error');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  // Brand Operations (Full dynamic theme settings)
  const handleBrandSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId) return;
    try {
      const skillsArray = brandForm.skills
        ? brandForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      const res = await authFetch(`/brands/${selectedBrandId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: brandForm.name,
          logoUrl: brandForm.logoUrl || null,
          faviconUrl: brandForm.faviconUrl || null,
          primaryColor: brandForm.primaryColor,
          secondaryColor: brandForm.secondaryColor,
          themeSettings: {
            heroBadge: brandForm.heroBadge,
            heroTitle: brandForm.heroTitle,
            heroSubtitle: brandForm.heroSubtitle,
            creatorBio: brandForm.creatorBio,
            creatorRole: brandForm.creatorRole,
            creatorLocation: brandForm.creatorLocation,
            skills: skillsArray,
            hireEmail: brandForm.hireEmail,
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to save brand settings');
      triggerToast('Brand & Portfolio configuration saved successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Provider Settings
  const handleSaveSettings = async (formData: any) => {
    try {
      await Promise.all(
        Object.entries(formData).map(([key, val]) =>
          authFetch('/settings', {
            method: 'POST',
            body: JSON.stringify({
              key,
              value: String(val),
              level: selectedBrandId ? 'BRAND' : key.includes('provider') ? 'GLOBAL' : 'SYSTEM',
              entityId: selectedBrandId || null,
            }),
          })
        )
      );
      triggerToast('Provider configuration saved successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Feature Flag Operations
  const handleToggleFlag = async (name: string) => {
    try {
      const res = await authFetch('/feature-flags/toggle', { method: 'POST', body: JSON.stringify({ name }) });
      if (!res.ok) throw new Error('Failed to toggle feature flag');
      triggerToast('Feature flag status updated!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Profile Update
  const handleProfileUpdate = async (formData: any) => {
    try {
      const res = await authFetch('/auth/profile', { method: 'PATCH', body: JSON.stringify(formData) });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.message || 'Profile update failed');
      triggerToast('Profile updated successfully!', 'success');
      loadData();
      return true;
    } catch (err: any) {
      triggerToast(err.message, 'error');
      throw err;
    }
  };

  return {
    loadingData,
    orders,
    products,
    customers,
    coupons,
    categories,
    settings,
    auditLogs,
    flags,
    selectedBrandId,
    adminUser,
    brandForm,
    setBrandForm,
    toast,
    triggerToast,
    confirmModal,
    setConfirmModal,
    loadData,
    handleCreateProduct,
    handleDeleteProduct,
    handleTogglePublish,
    handleFetchOrderDetails,
    handleResendEmail,
    handleRegenerateLink,
    handleCustomerStatusToggle,
    handleCreateCoupon,
    handleCouponUpdate,
    handleDeleteCoupon,
    handleCreateCategory,
    handleDeleteCategory,
    handleBrandSave,
    handleSaveSettings,
    handleToggleFlag,
    handleProfileUpdate,
  };
}

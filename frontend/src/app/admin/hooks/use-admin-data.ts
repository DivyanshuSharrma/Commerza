'use client';

import { useState, useEffect, useCallback } from 'react';
import { parseError, sanitizeBrandPayload, buildQueryString, DEFAULT_BRAND_ID } from './admin-api-helpers';

export function useAdminData(token: string | null, onUnauthorized?: () => void) {
  const [loadingData, setLoadingData] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [selectedBrandId, setSelectedBrandId] = useState<string>(DEFAULT_BRAND_ID);
  const [adminUser, setAdminUser] = useState({ name: 'Admin', email: 'admin@commerza.com' });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const [brandForm, setBrandForm] = useState({
    name: 'Commerza Store',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#06b6d4',
    heroBadge: '',
    heroTitle: 'Welcome to Commerza',
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

  const getEffectiveToken = useCallback(() => {
    if (token) return token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('commerza_admin_token');
    }
    return null;
  }, [token]);

  const authFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const activeToken = getEffectiveToken();
      const res = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          ...options.headers,
        },
      });
      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('commerza_admin_token');
        }
        onUnauthorized?.();
      }
      return res;
    },
    [apiUrl, getEffectiveToken, onUnauthorized]
  );

  const loadData = useCallback(async () => {
    const activeToken = getEffectiveToken();
    if (!activeToken) return;
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${activeToken}` };

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

      if (profileRes.status === 401 || orderRes.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('commerza_admin_token');
        }
        onUnauthorized?.();
        triggerToast('Admin session expired. Please sign in again.', 'error');
        return;
      }

      if (brandRes.ok) {
        const body = await brandRes.json();
        const data = body.data || [];
        if (data.length > 0) {
          const b = data[0];
          setSelectedBrandId(b.id);
          const t = b.themeSettings || {};
          setBrandForm({
            name: b.name || 'Commerza Store',
            logoUrl: b.logoUrl || '',
            faviconUrl: b.faviconUrl || '',
            primaryColor: b.primaryColor || '#4f46e5',
            secondaryColor: b.secondaryColor || '#06b6d4',
            heroBadge: t.heroBadge || '',
            heroTitle: t.heroTitle || 'Welcome to Commerza',
            heroSubtitle: t.heroSubtitle || '',
            creatorBio: t.creatorBio || '',
            creatorRole: t.creatorRole || '',
            creatorLocation: t.creatorLocation || '',
            skills: Array.isArray(t.skills) ? t.skills.join(', ') : t.skills || '',
            hireEmail: t.hireEmail || '',
          });
        }
      }

      if (prodRes.ok) {
        const prodData = (await prodRes.json()).data;
        setProducts(Array.isArray(prodData) ? prodData : prodData?.items || []);
      }
      if (catRes.ok) setCategories((await catRes.json()).data || []);
      if (orderRes.ok) {
        const ordData = (await orderRes.json()).data;
        setOrders(Array.isArray(ordData) ? ordData : ordData?.items || []);
      }
      if (custRes.ok) {
        const custData = (await custRes.json()).data;
        setCustomers(Array.isArray(custData) ? custData : custData?.items || []);
      }
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
  }, [getEffectiveToken, apiUrl, onUnauthorized]);

  useEffect(() => {
    if (token) loadData();
  }, [token, loadData]);

  // Product Operations
  const handleCreateProduct = async (productData: any) => {
    try {
      const { id, ...cleanData } = productData;
      cleanData.brandId = cleanData.brandId || selectedBrandId || DEFAULT_BRAND_ID;

      const res = id
        ? await authFetch(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(cleanData) })
        : await authFetch('/products', { method: 'POST', body: JSON.stringify(cleanData) });

      if (!res.ok) {
        const errorMsg = await parseError(res, id ? 'Failed to update product' : 'Failed to create product');
        throw new Error(errorMsg);
      }
      triggerToast(id ? 'Product updated successfully!' : 'Product created successfully!', 'success');
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
          if (!res.ok) throw new Error(await parseError(res, 'Failed to delete product'));
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
      if (!res.ok) throw new Error(await parseError(res, 'Status update failed'));
      triggerToast(`Product status updated to ${nextStatus}`, 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Order Operations
  const handleFetchOrderDetails = async (id: string) => {
    const res = await authFetch(`/orders/${id}`);
    if (!res.ok) throw new Error(await parseError(res, 'Failed to fetch order details'));
    const body = await res.json();
    return body.data || body;
  };

  const handleResendEmail = async (id: string) => {
    try {
      const res = await authFetch(`/orders/${id}/resend-email`, { method: 'POST' });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to resend fulfillment email'));
      triggerToast('Fulfillment email resent successfully!', 'success');
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleRegenerateLink = async (id: string) => {
    try {
      const res = await authFetch(`/orders/${id}/regenerate-link`, { method: 'POST' });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to regenerate link'));
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
      if (!res.ok) throw new Error(await parseError(res, 'Failed to update customer status'));
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
      if (!res.ok) throw new Error(await parseError(res, 'Failed to create coupon'));
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
      if (!res.ok) throw new Error(await parseError(res, 'Coupon update failed'));
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
          if (!res.ok) throw new Error(await parseError(res, 'Failed to delete coupon'));
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
      const payload = {
        ...catData,
        brandId: catData.brandId || selectedBrandId || DEFAULT_BRAND_ID,
      };
      const res = await authFetch('/categories', { method: 'POST', body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to create category'));
      triggerToast('Category created successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
      throw err;
    }
  };

  const handleUpdateCategory = async (id: string, catData: any) => {
    try {
      const payload = {
        ...catData,
        brandId: catData.brandId || selectedBrandId || DEFAULT_BRAND_ID,
      };
      const res = await authFetch(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to update category'));
      triggerToast('Category updated successfully!', 'success');
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
          if (!res.ok) throw new Error(await parseError(res, 'Failed to delete category'));
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

  // Brand Operations
  const handleBrandSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const brandIdToSave = selectedBrandId || DEFAULT_BRAND_ID;
    try {
      const payload = sanitizeBrandPayload(brandForm);
      const res = await authFetch(`/brands/${brandIdToSave}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to save brand settings'));
      triggerToast('Brand & Portfolio configuration saved successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Provider Settings - Single Bulk API Call (Eliminates N+1 request spam)
  const handleSaveSettings = async (formData: any) => {
    try {
      const settingsPayload = Object.entries(formData).map(([key, val]) => ({
        key,
        value: String(val),
        level: selectedBrandId ? 'BRAND' : key.includes('provider') ? 'GLOBAL' : 'SYSTEM',
        entityId: selectedBrandId || null,
      }));

      const res = await authFetch('/settings/bulk', {
        method: 'POST',
        body: JSON.stringify({ settings: settingsPayload }),
      });
      if (!res.ok) throw new Error(await parseError(res, 'Failed to save settings'));
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
      if (!res.ok) throw new Error(await parseError(res, 'Failed to toggle feature flag'));
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
      if (!res.ok) throw new Error(await parseError(res, 'Profile update failed'));
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
    handleUpdateCategory,
    handleDeleteCategory,
    handleBrandSave,
    handleSaveSettings,
    handleToggleFlag,
    handleProfileUpdate,
    fetchPaginatedOrders: async (params: { page?: number; limit?: number; search?: string; status?: string }) => {
      const q = buildQueryString(params);
      const res = await authFetch(`/orders${q}`);
      if (!res.ok) throw new Error(await parseError(res, 'Failed to fetch orders'));
      const body = await res.json();
      return body.data || body;
    },
    fetchPaginatedCustomers: async (params: { page?: number; limit?: number; search?: string; status?: string }) => {
      const q = buildQueryString(params);
      const res = await authFetch(`/customers${q}`);
      if (!res.ok) throw new Error(await parseError(res, 'Failed to fetch customers'));
      const body = await res.json();
      return body.data || body;
    },
    fetchPaginatedProducts: async (params: { page?: number; limit?: number; search?: string; categoryId?: string; status?: string }) => {
      const q = buildQueryString(params);
      const res = await authFetch(`/products${q}`);
      if (!res.ok) throw new Error(await parseError(res, 'Failed to fetch products'));
      const body = await res.json();
      return body.data || body;
    },
  };
}

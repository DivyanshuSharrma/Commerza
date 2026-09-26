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
    name: 'Commerza Digital Store',
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#06b6d4',
    heroTitle: '',
    heroSubtitle: '',
  });

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

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
          setBrandForm({
            name: b.name,
            logoUrl: b.logoUrl || '',
            faviconUrl: b.faviconUrl || '',
            primaryColor: b.primaryColor,
            secondaryColor: b.secondaryColor,
            heroTitle: b.themeSettings?.heroTitle || '',
            heroSubtitle: b.themeSettings?.heroSubtitle || '',
          });
        }
      }

      if (prodRes.ok) {
        const body = await prodRes.json();
        setProducts(body.data || []);
      }

      if (catRes.ok) {
        const body = await catRes.json();
        setCategories(body.data || []);
      }

      if (orderRes.ok) {
        const body = await orderRes.json();
        setOrders(body.data || []);
      }

      if (custRes.ok) {
        const body = await custRes.json();
        setCustomers(body.data || []);
      }

      if (couponRes.ok) {
        const body = await couponRes.json();
        setCoupons(body.data || []);
      }

      if (settingsRes.ok) {
        const body = await settingsRes.json();
        setSettings(body.data || []);
      }

      if (flagsRes.ok) {
        const body = await flagsRes.json();
        setFlags(body.data || {});
      }

      if (auditRes.ok) {
        const body = await auditRes.json();
        setAuditLogs(body.data || []);
      }

      if (profileRes.ok) {
        const body = await profileRes.json();
        setAdminUser(body.data || body);
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
      const res = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Failed to create product');
      }
      triggerToast('Product created successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setConfirmModal({
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${apiUrl}/products/${productId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
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
      const res = await fetch(`${apiUrl}/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
    const res = await fetch(`${apiUrl}/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch order details');
    const body = await res.json();
    return body.data || body;
  };

  const handleResendEmail = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/orders/${id}/resend-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to resend fulfillment email');
      triggerToast('Fulfillment receipt email resent successfully!', 'success');
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleRegenerateLink = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/orders/${id}/regenerate-link`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to regenerate order link');
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
      const res = await fetch(`${apiUrl}/customers/${customerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
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
      const res = await fetch(`${apiUrl}/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(couponData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Failed to create coupon');
      }
      triggerToast('Coupon created successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
      throw err;
    }
  };

  const handleCouponUpdate = async (id: string, payload: any) => {
    try {
      const res = await fetch(`${apiUrl}/coupons/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Coupon update failed');
      triggerToast('Coupon updated successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleDeleteCoupon = (couponId: string) => {
    setConfirmModal({
      message: 'Are you sure you want to delete this coupon code?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${apiUrl}/coupons/${couponId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
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
      const res = await fetch(`${apiUrl}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(catData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || 'Failed to create category');
      }
      triggerToast('Category created successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setConfirmModal({
      message: 'Are you sure you want to delete this category?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${apiUrl}/categories/${categoryId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
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

  // Brand Operations
  const handleBrandSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId) return;
    try {
      const res = await fetch(`${apiUrl}/brands/${selectedBrandId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: brandForm.name,
          logoUrl: brandForm.logoUrl || null,
          faviconUrl: brandForm.faviconUrl || null,
          primaryColor: brandForm.primaryColor,
          secondaryColor: brandForm.secondaryColor,
          themeSettings: {
            heroTitle: brandForm.heroTitle,
            heroSubtitle: brandForm.heroSubtitle,
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to save brand settings');
      triggerToast('Brand configuration saved successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Provider Settings
  const handleSaveSettings = async (formData: any) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      await Promise.all(
        Object.entries(formData).map(([key, val]) =>
          fetch(`${apiUrl}/settings`, {
            method: 'POST',
            headers,
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
      const res = await fetch(`${apiUrl}/feature-flags/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
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
      const res = await fetch(`${apiUrl}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || 'Profile update failed');
      }
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

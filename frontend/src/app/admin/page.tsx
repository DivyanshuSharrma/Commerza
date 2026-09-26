'use client';

import { useState, useEffect } from 'react';
import { LoginForm } from './components/login-form';
import { DashboardTab } from './components/dashboard-tab';
import { ProductsTab } from './components/products-tab';
import { OrdersTab } from './components/orders-tab';
import { CustomersTab } from './components/customers-tab';
import { CouponsTab } from './components/coupons-tab';
import { BrandTab } from './components/brand-tab';
import { ProvidersTab } from './components/providers-tab';
import { FeatureFlagsTab } from './components/feature-flags-tab';
import { AnalyticsTab } from './components/analytics-tab';
import { AuditLogsTab } from './components/audit-logs-tab';
import { ProfileTab } from './components/profile-tab';

type TabId =
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'brand'
  | 'settings'
  | 'feature_flags'
  | 'analytics'
  | 'audit_logs'
  | 'profile';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('admin@commerza.com');
  const [password, setPassword] = useState('admin123');
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [adminUser, setAdminUser] = useState({ name: 'Admin', email: 'admin@commerza.com' });

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

  useEffect(() => {
    const savedToken = localStorage.getItem('commerza_admin_token');
    if (savedToken) setToken(savedToken);
  }, []);

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch Brands
      const brandRes = await fetch(`${apiUrl}/brands`);
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

      // Fetch Products
      const prodRes = await fetch(`${apiUrl}/products`);
      if (prodRes.ok) {
        const body = await prodRes.json();
        setProducts(body.data || []);
      }

      // Fetch Orders
      const orderRes = await fetch(`${apiUrl}/orders`, { headers });
      if (orderRes.ok) {
        const body = await orderRes.json();
        setOrders(body.data || []);
      }

      // Fetch Customers
      const custRes = await fetch(`${apiUrl}/customers`, { headers });
      if (custRes.ok) {
        const body = await custRes.json();
        setCustomers(body.data || []);
      }

      // Fetch Coupons
      const couponRes = await fetch(`${apiUrl}/coupons`, { headers });
      if (couponRes.ok) {
        const body = await couponRes.json();
        setCoupons(body.data || []);
      }

      // Fetch Settings
      const settingsRes = await fetch(`${apiUrl}/settings`, { headers });
      if (settingsRes.ok) {
        const body = await settingsRes.json();
        setSettings(body.data || []);
      }

      // Fetch Feature Flags
      const flagsRes = await fetch(`${apiUrl}/feature-flags`);
      if (flagsRes.ok) {
        const body = await flagsRes.json();
        setFlags(body.data || {});
      }

      // Fetch Audit Logs
      const auditRes = await fetch(`${apiUrl}/audit-logs`, { headers });
      if (auditRes.ok) {
        const body = await auditRes.json();
        setAuditLogs(body.data || []);
      }

      // Fetch Profile Details
      const profileRes = await fetch(`${apiUrl}/auth/profile`, { headers });
      if (profileRes.ok) {
        const body = await profileRes.json();
        setAdminUser(body.data || body);
      }
    } catch (err) {
      console.error('Error synchronizing database metrics:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Authentication failed');
      const body = await res.json();
      localStorage.setItem('commerza_admin_token', body.data.accessToken);
      setToken(body.data.accessToken);
    } catch (err: any) {
      triggerToast(err.message || 'Login failed', 'error');
    }
  };

  // Product CRUD Handlers
  const handleProductCreate = async (payload: any) => {
    try {
      const res = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...payload, brandId: selectedBrandId }),
      });
      if (!res.ok) throw new Error('Product creation failed');
      triggerToast('Product created successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleProductUpdate = async (id: string, payload: any) => {
    try {
      const res = await fetch(`${apiUrl}/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Product update failed');
      triggerToast('Product updated successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleProductDelete = async (id: string) => {
    setConfirmModal({
      message: 'Are you sure you want to delete this product? This action will permanently remove it from the catalog.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${apiUrl}/products/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Product deletion failed');
          triggerToast('Product deleted successfully!', 'success');
          loadData();
        } catch (err: any) {
          triggerToast(err.message, 'error');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  // Order Details Resolver
  const handleFetchOrderDetails = async (id: string) => {
    const res = await fetch(`${apiUrl}/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch order details');
    const body = await res.json();
    return body.data || body;
  };

  // Order Email Resend
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

  // Order Link Regeneration
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

  // Customer Status Handler
  const handleToggleCustomerStatus = async (id: string, current: string) => {
    try {
      const next = current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      const res = await fetch(`${apiUrl}/customers/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('Failed to update shopper status');
      triggerToast('Shopper account status updated!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Coupon CRUD Handlers
  const handleCouponCreate = async (payload: any) => {
    try {
      const res = await fetch(`${apiUrl}/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Coupon code creation failed');
      triggerToast('Coupon created successfully!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
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

  const handleCouponDelete = async (id: string) => {
    setConfirmModal({
      message: 'Are you sure you want to delete this coupon? This action cannot be reverted.',
      onConfirm: async () => {
        try {
          const res = await fetch(`${apiUrl}/coupons/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Coupon deletion failed');
          triggerToast('Coupon deleted successfully!', 'success');
          loadData();
        } catch (err: any) {
          triggerToast(err.message, 'error');
        } finally {
          setConfirmModal(null);
        }
      },
    });
  };

  // Brand config Handler
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (!res.ok) throw new Error('Failed to update brand config');
      triggerToast('Brand storefront settings saved!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Settings Save Handler
  const handleSaveSettings = async (formData: any) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };
      const promises = Object.entries(formData).map(([key, val]) =>
        fetch(`${apiUrl}/settings`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            key,
            value: String(val),
            level: selectedBrandId ? 'BRAND' : (key.includes('provider') ? 'GLOBAL' : 'SYSTEM'),
            entityId: selectedBrandId || null,
          }),
        })
      );
      await Promise.all(promises);
      triggerToast('Strategy configurations saved & synchronized!', 'success');
      loadData();
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  // Feature Flag Toggle Handler
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

  // Profile Update handler
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
        const errBody = await res.json();
        throw new Error(errBody.message || 'Profile update failed');
      }
      triggerToast('Admin profile settings updated successfully!', 'success');
      loadData();
      return true;
    } catch (err: any) {
      triggerToast(err.message, 'error');
      return false;
    }
  };

  if (!token) {
    return (
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  const menuItems: { id: TabId; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'products', label: 'Digital Products' },
    { id: 'orders', label: 'Order Logs' },
    { id: 'customers', label: 'Customer Directory' },
    { id: 'coupons', label: 'Promo Coupons' },
    { id: 'brand', label: 'Brand Config' },
    { id: 'settings', label: 'Providers settings' },
    { id: 'feature_flags', label: 'Feature Flags' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'audit_logs', label: 'Audit Trail Logs' },
    { id: 'profile', label: 'Admin Profile' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background relative">
      {/* Premium Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 font-semibold border text-sm ${
          toast.type === 'success' 
            ? 'bg-green-600 border-green-500 text-white' 
            : 'bg-red-600 border-red-500 text-white'
        }`}>
          <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            className="ml-4 font-bold bg-white/20 hover:bg-white/30 w-5 h-5 rounded-full flex items-center justify-center transition-colors text-[10px] cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Premium Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground mb-2">Confirm Action</h3>
            <p className="text-sm text-foreground/75 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={confirmModal.onConfirm}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm cursor-pointer"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmModal(null)}
                className="bg-foreground/10 hover:bg-foreground/20 text-foreground font-medium py-2 px-5 rounded-lg transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Top Header */}
      <header className="md:hidden w-full bg-card border-b border-border px-6 py-4 flex items-center justify-between z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="font-extrabold text-foreground">Commerza Admin</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-foreground hover:bg-foreground/5 p-2 rounded-lg transition-colors cursor-pointer text-sm font-semibold"
        >
          {mobileMenuOpen ? '✕ Close' : '☰ Menu'}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`${
        mobileMenuOpen ? 'block' : 'hidden'
      } md:block w-full md:w-64 bg-card border-r border-border p-6 flex flex-col gap-6 z-20 absolute md:relative inset-y-0 left-0 pt-20 md:pt-6 shadow-xl md:shadow-none`}>
        <div className="hidden md:flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="font-extrabold text-lg text-foreground truncate">Commerza Admin</span>
        </div>
        <nav className="flex flex-col gap-1 overflow-y-auto max-h-[70vh] pr-1">
          {menuItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/75 hover:bg-foreground/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem('commerza_admin_token');
            setToken(null);
          }}
          className="mt-auto w-full border border-border hover:bg-foreground/5 text-foreground font-medium py-2 rounded-lg transition-colors text-sm cursor-pointer"
        >
          Sign Out
        </button>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardTab 
            orders={orders} 
            products={products} 
            customers={customers} 
            loading={loadingData}
            onRefresh={loadData}
          />
        )}
        {activeTab === 'products' && (
          <ProductsTab
            products={products}
            onCreate={handleProductCreate}
            onUpdate={handleProductUpdate}
            onDelete={handleProductDelete}
          />
        )}
        {activeTab === 'orders' && (
          <OrdersTab 
            orders={orders} 
            onFetchDetails={handleFetchOrderDetails} 
            onResendEmail={handleResendEmail}
            onRegenerateLink={handleRegenerateLink}
          />
        )}
        {activeTab === 'customers' && (
          <CustomersTab customers={customers} onToggleStatus={handleToggleCustomerStatus} />
        )}
        {activeTab === 'coupons' && (
          <CouponsTab
            coupons={coupons}
            onCreate={handleCouponCreate}
            onUpdate={handleCouponUpdate}
            onDelete={handleCouponDelete}
          />
        )}
        {activeTab === 'brand' && (
          <BrandTab brandForm={brandForm} setBrandForm={setBrandForm} onSubmit={handleSaveBrand} />
        )}
        {activeTab === 'settings' && (
          <ProvidersTab settings={settings} loading={loadingData} brandId={selectedBrandId} onSubmit={handleSaveSettings} />
        )}
        {activeTab === 'feature_flags' && (
          <FeatureFlagsTab flags={flags} onToggle={handleToggleFlag} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsTab 
            orders={orders} 
            products={products} 
            loading={loadingData}
            onRefresh={loadData}
          />
        )}
        {activeTab === 'audit_logs' && <AuditLogsTab logs={auditLogs} />}
        {activeTab === 'profile' && (
          <ProfileTab adminUser={adminUser} onUpdate={handleProfileUpdate} />
        )}
      </main>
    </div>
  );
}

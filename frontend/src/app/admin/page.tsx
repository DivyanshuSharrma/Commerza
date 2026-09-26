'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdminData } from './hooks/use-admin-data';
import { LoginForm } from './components/login-form';
import { DashboardTab } from './components/dashboard-tab';
import { AnalyticsTab } from './components/analytics-tab';
import { ProductsTab } from './components/products-tab';
import { CategoriesTab } from './components/categories-tab';
import { OrdersTab } from './components/orders-tab';
import { CustomersTab } from './components/customers-tab';
import { CouponsTab } from './components/coupons-tab';
import { BrandTab } from './components/brand-tab';
import { ProvidersTab } from './components/providers-tab';
import { FeatureFlagsTab } from './components/feature-flags-tab';
import { AuditLogsTab } from './components/audit-logs-tab';
import { ProfileTab } from './components/profile-tab';

type TabId =
  | 'dashboard'
  | 'analytics'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'brand'
  | 'settings'
  | 'feature_flags'
  | 'audit_logs'
  | 'profile';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleUnauthorized = useCallback(() => {
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('commerza_admin_token');
    }
  }, []);

  const {
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
    triggerToast,
  } = useAdminData(token, handleUnauthorized);

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

  useEffect(() => {
    const savedToken = localStorage.getItem('commerza_admin_token');
    if (savedToken) setToken(savedToken);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const errorMsg =
          errJson?.error?.details && Array.isArray(errJson.error.details)
            ? errJson.error.details.join(', ')
            : errJson?.error?.message || errJson?.message || 'Invalid email or password';
        throw new Error(errorMsg);
      }
      const data = await res.json();
      const accessToken = data.data?.accessToken || data.accessToken;
      if (accessToken) {
        setToken(accessToken);
        localStorage.setItem('commerza_admin_token', accessToken);
        triggerToast('Welcome back, Admin!', 'success');
      }
    } catch (err: any) {
      triggerToast(err.message, 'error');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('commerza_admin_token');
  };

  if (!token) {
    return (
      <LoginForm
        email={email}
        password={password}
        setEmail={setEmail}
        setPassword={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'categories', label: 'Categories', icon: '🗂️' },
    { id: 'orders', label: 'Orders', icon: '🛍️' },
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'coupons', label: 'Coupons', icon: '🏷️' },
    { id: 'brand', label: 'Brand & Store', icon: '🎨' },
    { id: 'settings', label: 'Providers', icon: '⚙️' },
    { id: 'feature_flags', label: 'Feature Flags', icon: '🚩' },
    { id: 'audit_logs', label: 'Audit Trail', icon: '🛡️' },
    { id: 'profile', label: 'Profile Settings', icon: '👤' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all duration-300 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/30'
              : 'bg-red-600 text-white border-red-500 shadow-red-900/30'
          }`}
        >
          <span>{toast.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground mb-2">Confirm Action</h3>
            <p className="text-sm text-foreground/75 mb-6">{confirmModal.message}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmModal(null)}
                className="bg-card hover:bg-border text-foreground border border-border font-semibold py-2 px-4 rounded-lg transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm cursor-pointer"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-border rounded-lg text-foreground"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-white shadow-sm">
              C
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-foreground flex items-center gap-2">
                Commerza Control Center
                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                  Staff v1.0
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={loadData}
            title="Refresh Storefront Metrics"
            disabled={loadingData}
            className="text-foreground/75 hover:text-foreground text-xs flex items-center gap-1.5 bg-border/40 px-2.5 py-1.5 rounded-md hover:bg-border transition-colors cursor-pointer"
          >
            <span className={loadingData ? 'animate-spin inline-block' : ''}>🔄</span>
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <div className="flex items-center gap-2 border-l border-border pl-4">
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <span className="text-xs font-medium text-foreground/80 hidden sm:inline">
              {adminUser?.name || 'Administrator'}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-red-500 hover:text-red-400 font-semibold ml-2 cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar Nav */}
        <aside
          className={`fixed md:sticky top-[57px] left-0 h-[calc(100vh-57px)] w-60 bg-card border-r border-border p-3 flex flex-col justify-between z-30 transition-transform duration-200 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
              Management
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-md shadow-primary/20 font-bold'
                    : 'text-foreground/75 hover:bg-border/60 hover:text-foreground'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-3 bg-background rounded-xl border border-border text-[11px] text-foreground/60 text-center">
            Single-Instance Engine
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardTab
              orders={orders}
              products={products}
              customers={customers}
              loading={loadingData}
              onRefresh={loadData}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsTab
              orders={orders}
              products={products}
              loading={loadingData}
              onRefresh={loadData}
            />
          )}
          {activeTab === 'products' && (
            <ProductsTab
              products={products}
              categories={categories}
              brandId={selectedBrandId}
              onCreateProduct={handleCreateProduct}
              onDeleteProduct={handleDeleteProduct}
              onTogglePublish={handleTogglePublish}
            />
          )}
          {activeTab === 'categories' && (
            <CategoriesTab
              categories={categories}
              brandId={selectedBrandId}
              onCreateCategory={handleCreateCategory}
              onDeleteCategory={async (id) => handleDeleteCategory(id)}
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
            <CustomersTab
              customers={customers}
              onToggleStatus={handleCustomerStatusToggle}
            />
          )}
          {activeTab === 'coupons' && (
            <CouponsTab
              coupons={coupons}
              onCreate={handleCreateCoupon}
              onUpdate={handleCouponUpdate}
              onDelete={handleDeleteCoupon}
            />
          )}
          {activeTab === 'brand' && (
            <BrandTab
              brandForm={brandForm}
              setBrandForm={setBrandForm}
              onSubmit={handleBrandSave}
            />
          )}
          {activeTab === 'settings' && (
            <ProvidersTab
              settings={settings}
              loading={loadingData}
              brandId={selectedBrandId}
              onSubmit={handleSaveSettings}
            />
          )}
          {activeTab === 'feature_flags' && (
            <FeatureFlagsTab flags={flags} onToggle={handleToggleFlag} />
          )}
          {activeTab === 'audit_logs' && <AuditLogsTab logs={auditLogs} />}
          {activeTab === 'profile' && (
            <ProfileTab
              adminUser={adminUser}
              onUpdate={handleProfileUpdate}
            />
          )}
        </main>
      </div>
    </div>
  );
}

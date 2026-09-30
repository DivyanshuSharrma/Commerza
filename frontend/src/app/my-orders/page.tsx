'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthCard } from './components/auth-card';
import { OrdersView, CustomerOrder } from './components/orders-view';

function MyOrdersContent() {
  const searchParams = useSearchParams();
  const magicToken = searchParams.get('token');
  const magicEmail = searchParams.get('email');

  const [token, setToken] = React.useState<string | null>(null);
  const [customer, setCustomer] = React.useState<{ id: string; email: string; name?: string } | null>(null);
  const [orders, setOrders] = React.useState<CustomerOrder[]>([]);
  const [loading, setLoading] = React.useState(true);

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

  const fetchOrders = React.useCallback(async (authToken: string) => {
    try {
      const res = await fetch(`${apiUrl}/customer-portal/orders`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem('commerza_customer_token');
        localStorage.removeItem('commerza_customer_profile');
        setToken(null);
        setCustomer(null);
        return;
      }

      if (!res.ok) throw new Error('Failed to retrieve customer orders');
      const body = await res.json();
      setOrders(body.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  // Check saved session on mount
  React.useEffect(() => {
    const savedToken = localStorage.getItem('commerza_customer_token');
    const savedProfile = localStorage.getItem('commerza_customer_profile');

    if (savedToken && savedProfile) {
      try {
        setToken(savedToken);
        setCustomer(JSON.parse(savedProfile));
        fetchOrders(savedToken);
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [fetchOrders]);

  const handleAuthenticated = (newToken: string, customerProfile: { id: string; email: string; name?: string }) => {
    setToken(newToken);
    setCustomer(customerProfile);
    localStorage.setItem('commerza_customer_token', newToken);
    localStorage.setItem('commerza_customer_profile', JSON.stringify(customerProfile));
    setLoading(true);
    fetchOrders(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('commerza_customer_token');
    localStorage.removeItem('commerza_customer_profile');
    setToken(null);
    setCustomer(null);
    setOrders([]);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 flex flex-col items-center justify-center animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-foreground/10 mb-4" />
        <div className="h-6 bg-foreground/10 rounded w-1/3 mb-2" />
        <div className="h-4 bg-foreground/5 rounded w-1/2" />
      </div>
    );
  }

  if (!token || !customer) {
    return (
      <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
        <AuthCard
          onAuthenticated={handleAuthenticated}
          initialToken={magicToken}
          initialEmail={magicEmail}
        />
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <OrdersView
        orders={orders}
        customer={customer}
        onLogout={handleLogout}
        onRefreshOrders={() => fetchOrders(token)}
        token={token}
      />
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-xl mx-auto px-4 py-24 flex flex-col items-center justify-center animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-foreground/10 mb-4" />
          <div className="h-6 bg-foreground/10 rounded w-1/3 mb-2" />
          <div className="h-4 bg-foreground/5 rounded w-1/2" />
        </div>
      }
    >
      <MyOrdersContent />
    </Suspense>
  );
}

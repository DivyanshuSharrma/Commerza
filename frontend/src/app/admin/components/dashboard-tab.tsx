'use client';

import { useState, useEffect } from 'react';

interface DashboardTabProps {
  orders: any[];
  products: any[];
  customers: any[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export function DashboardTab({ orders, products, customers, loading, onRefresh }: DashboardTabProps) {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, [orders, products, customers]);

  const totalSales = orders
    .filter((o) => o.status === 'PAID')
    .reduce((acc, o) => acc + parseFloat(o.amountPaid), 0);

  const pendingSales = orders
    .filter((o) => o.status === 'PENDING')
    .length;

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-9 bg-foreground/10 rounded w-1/3"></div>
          <div className="h-8 bg-foreground/10 rounded w-20"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border p-6 rounded-2xl h-24"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-2xl h-44"></div>
          <div className="bg-card border border-border p-6 rounded-2xl h-44"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground">Merchant Dashboard</h2>
          <p className="text-xs text-foreground/40 mt-1">
            Last synchronized: <span className="font-semibold">{lastUpdated}</span>
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="border border-border hover:bg-foreground/5 text-foreground font-semibold px-4 py-2 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 self-start"
        >
          🔄 Refresh Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <span className="text-sm font-medium text-foreground/50">Total Revenue</span>
          <p className="text-3xl font-extrabold text-green-500 mt-2">${totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <span className="text-sm font-medium text-foreground/50">Paid Checkouts</span>
          <p className="text-3xl font-extrabold text-foreground mt-2">
            {orders.filter(o => o.status === 'PAID').length}
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <span className="text-sm font-medium text-foreground/50">Catalog Products</span>
          <p className="text-3xl font-extrabold text-primary mt-2">{products.length}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <span className="text-sm font-medium text-foreground/50">Registered Shoppers</span>
          <p className="text-3xl font-extrabold text-foreground mt-2">{customers.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-3">Engine Quick Status</h3>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li className="flex justify-between border-b border-border/50 pb-2">
              <span>Checkout Gateway</span>
              <span className="text-green-500 font-bold">Online</span>
            </li>
            <li className="flex justify-between border-b border-border/50 pb-2">
              <span>Delivery Server</span>
              <span className="text-green-500 font-bold">Online</span>
            </li>
            <li className="flex justify-between border-b border-border/50 pb-2">
              <span>Pending Fulfillment Jobs</span>
              <span className="text-yellow-500 font-bold">{pendingSales}</span>
            </li>
            <li className="flex justify-between">
              <span>Tenant Instance Mode</span>
              <span className="text-blue-500 font-bold">Single Merchant</span>
            </li>
          </ul>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-center">
          <h3 className="text-lg font-bold text-foreground mb-1">Storefront Preview</h3>
          <p className="text-xs text-foreground/50 mb-4">Click to open customer storefront</p>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-center bg-primary hover:opacity-90 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer text-sm"
          >
            Launch Customer Storefront
          </a>
        </div>
      </div>
    </div>
  );
}

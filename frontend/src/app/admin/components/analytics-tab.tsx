'use client';

import { useState, useEffect } from 'react';

interface AnalyticsTabProps {
  orders: any[];
  products: any[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export function AnalyticsTab({ orders, products, loading, onRefresh }: AnalyticsTabProps) {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, [orders]);

  const handleRefreshClick = async () => {
    await onRefresh();
  };

  const paidOrders = orders.filter((o) => o.status === 'PAID');
  const totalSales = paidOrders.reduce((acc, o) => acc + parseFloat(o.amountPaid), 0);
  const averageOrderValue = paidOrders.length > 0 ? totalSales / paidOrders.length : 0;

  // Calculate product distribution
  const productSalesMap: Record<string, number> = {};
  paidOrders.forEach((o) => {
    const title = o.product?.title || 'Unknown Product';
    productSalesMap[title] = (productSalesMap[title] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-9 bg-foreground/10 rounded w-1/3"></div>
          <div className="h-8 bg-foreground/10 rounded w-20"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border p-6 rounded-2xl h-24"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-2xl h-64"></div>
          <div className="bg-card border border-border p-6 rounded-2xl h-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground">Merchant Analytics</h2>
          <p className="text-xs text-foreground/40 mt-1">
            Last synchronized: <span className="font-semibold">{lastUpdated}</span>
          </p>
        </div>
        <button
          onClick={handleRefreshClick}
          className="border border-border hover:bg-foreground/5 text-foreground font-semibold px-4 py-2 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 self-start"
        >
          🔄 Refresh Metrics
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <span className="text-sm font-medium text-foreground/50">Gross Revenue</span>
          <p className="text-3xl font-extrabold text-green-500 mt-2">${totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <span className="text-sm font-medium text-foreground/50">Average Order Value</span>
          <p className="text-3xl font-extrabold text-foreground mt-2">${averageOrderValue.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <span className="text-sm font-medium text-foreground/50">Conversion Success Rate</span>
          <p className="text-3xl font-extrabold text-primary mt-2">
            {orders.length > 0 ? ((paidOrders.length / orders.length) * 100).toFixed(1) : '0.0'}%
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card border border-border p-12 rounded-2xl text-center shadow-sm">
          <span className="text-4xl">📊</span>
          <h3 className="font-bold text-foreground mt-4">No Storefront Activity Yet</h3>
          <p className="text-sm text-foreground/50 mt-1 max-w-sm mx-auto">
            Once client checkouts and orders are registered, real-time sales curves and product graphs will be plotted.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Sales Distribution */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">Volume by Digital Catalog</h3>
            <div className="space-y-4">
              {Object.entries(productSalesMap).map(([title, sales]) => (
                <div key={title} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{title}</span>
                    <span className="font-bold text-foreground">{sales} checkouts</span>
                  </div>
                  <div className="w-full bg-foreground/5 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{
                        width: `${(sales / paidOrders.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
              {Object.keys(productSalesMap).length === 0 && (
                <div className="text-center py-6 text-sm text-foreground/45">
                  No completed sales logged yet.
                </div>
              )}
            </div>
          </div>

          {/* Funnel Ratios */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">Storefront Checkout Funnel</h3>
            <div className="space-y-4 text-sm text-foreground/80">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span>Total Initiated Checkouts</span>
                <span className="font-bold text-foreground">{orders.length}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span>Completed (Paid)</span>
                <span className="font-bold text-green-500">{paidOrders.length}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span>Bounced (Abandoned)</span>
                <span className="font-bold text-red-500">
                  {orders.filter((o) => o.status === 'FAILED' || o.status === 'PENDING').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Refunded Transactions</span>
                <span className="font-bold text-foreground">
                  {orders.filter((o) => o.status === 'REFUNDED').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

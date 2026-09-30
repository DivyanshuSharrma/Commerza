'use client';

import { useState, useMemo, useEffect } from 'react';
import { OrderDetailsDrawer } from './order-details-drawer';

interface Order {
  id: string;
  amountPaid: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentProvider?: string | null;
  paymentId?: string | null;
  downloadToken: string;
  downloadLimit: number;
  downloadCount: number;
  expiresAt: string;
  createdAt: string;
  product: {
    title: string;
    price: string;
    deliveryType: string;
  };
  customer: {
    id: string;
    email: string;
    name?: string | null;
    status: 'ACTIVE' | 'SUSPENDED';
  };
  downloadLogs?: Array<{
    id: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    success: boolean;
    errorMessage?: string | null;
    createdAt: string;
  }>;
}

interface OrdersTabProps {
  orders: Order[];
  onFetchDetails: (id: string) => Promise<Order>;
  onResendEmail: (id: string) => Promise<void>;
  onRegenerateLink: (id: string) => Promise<Order>;
  onFetchPaginated?: (params: { page?: number; limit?: number; search?: string; status?: string }) => Promise<{
    items: Order[];
    total: number;
    totalPages: number;
  }>;
}

export function OrdersTab({ orders, onFetchDetails, onResendEmail, onRegenerateLink, onFetchPaginated }: OrdersTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  // Server-side pagination state
  const [serverOrders, setServerOrders] = useState<Order[] | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [totalPagesCount, setTotalPagesCount] = useState<number | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Debounced server-side query execution
  useEffect(() => {
    if (!onFetchPaginated) return;

    let isCancelled = false;
    const timer = setTimeout(async () => {
      setIsFetching(true);
      try {
        const res = await onFetchPaginated({
          page: currentPage,
          limit: pageSize,
          search: search.trim() || undefined,
          status: statusFilter,
        });
        if (!isCancelled && res) {
          setServerOrders(res.items || []);
          setTotalCount(res.total ?? 0);
          setTotalPagesCount(res.totalPages ?? 1);
        }
      } catch (err) {
        console.error('Failed to fetch paginated orders from server:', err);
      } finally {
        if (!isCancelled) setIsFetching(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [currentPage, search, statusFilter, onFetchPaginated]);

  // Client-side fallback if server pagination is disabled
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchesSearch =
        o.id.toLowerCase().includes(q) ||
        (o.customer?.email || '').toLowerCase().includes(q) ||
        (o.customer?.name || '').toLowerCase().includes(q) ||
        (o.product?.title || '').toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const displayedOrders = onFetchPaginated && serverOrders !== null
    ? serverOrders
    : filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalOrders = onFetchPaginated && totalCount !== null
    ? totalCount
    : filteredOrders.length;

  const totalPages = onFetchPaginated && totalPagesCount !== null
    ? totalPagesCount
    : (Math.ceil(filteredOrders.length / pageSize) || 1);

  const handleRowClick = async (orderId: string) => {
    try {
      setLoading(true);
      const detail = await onFetchDetails(orderId);
      setSelectedOrder(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-foreground">Order Operations Directory</h2>
          <p className="text-xs text-foreground/60 mt-1">
            Real-time transaction logs, cryptographic delivery tokens, and tax invoice generation.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by Order ID, customer email or product..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-card border border-border px-3.5 py-2 pl-9 rounded-xl text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="absolute left-3 top-2.5 text-xs text-foreground/40">🔍</span>
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-2 text-xs text-foreground/40 hover:text-foreground cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card border border-border text-foreground/70 hover:bg-foreground/5'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="px-6 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground text-sm">Checkout Logs</h3>
                {isFetching && (
                  <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium animate-pulse">
                    Syncing...
                  </span>
                )}
              </div>
              <span className="text-xs text-foreground/50">
                {totalOrders} {totalOrders === 1 ? 'order' : 'orders'} found
              </span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-foreground/5 text-xs font-semibold text-foreground/75 border-b border-border">
                  <th className="px-5 py-3">Order ID / Customer</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-border text-sm text-foreground/75 transition-opacity duration-150 ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                {displayedOrders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => handleRowClick(o.id)}
                    className={`hover:bg-foreground/5 cursor-pointer transition-colors ${
                      selectedOrder?.id === o.id ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-foreground truncate max-w-[180px]">
                        {o.id.substring(0, 8)}...
                      </div>
                      <div className="text-xs text-foreground/50">{o.customer?.email}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground text-xs">{o.product?.title}</td>
                    <td className="px-5 py-3.5 font-bold text-foreground text-xs">
                      ${parseFloat(o.amountPaid).toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          o.status === 'PAID'
                            ? 'bg-green-500/10 text-green-500'
                            : o.status === 'PENDING'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {displayedOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-foreground/50 text-xs">
                      No matching checkout orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-border flex items-center justify-between text-xs text-foreground/70 bg-card">
              <span>
                Page <strong className="text-foreground">{currentPage}</strong> of{' '}
                <strong className="text-foreground">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-border disabled:opacity-30 hover:bg-foreground/5 cursor-pointer font-medium"
                >
                  ← Prev
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-border disabled:opacity-30 hover:bg-foreground/5 cursor-pointer font-medium"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Inspector Panel */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 h-fit">
          <h3 className="text-lg font-bold text-foreground border-b border-border pb-3">
            Audit Inspector Panel
          </h3>

          {loading && (
            <div className="text-center py-12 text-sm text-foreground/50">
              Loading order specifications...
            </div>
          )}

          {!loading && !selectedOrder && (
            <div className="text-center py-12 text-sm text-foreground/40">
              Select an order from the directory list to run a diagnostic inspection.
            </div>
          )}

          {!loading && selectedOrder && (
            <OrderDetailsDrawer
              key={selectedOrder.id}
              order={selectedOrder}
              onResendEmail={onResendEmail}
              onRegenerateLink={onRegenerateLink}
            />
          )}
        </div>
      </div>
    </div>
  );
}

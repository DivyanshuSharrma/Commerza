'use client';

import { useState, useMemo } from 'react';

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
}

export function OrdersTab({ orders, onFetchDetails, onResendEmail, onRegenerateLink }: OrdersTabProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

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

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleResend = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      await onResendEmail(selectedOrder.id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegeneratedLink = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      const updated = await onRegenerateLink(selectedOrder.id);
      setSelectedOrder(updated);
    } finally {
      setActionLoading(false);
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
              <h3 className="font-bold text-foreground text-sm">Checkout Logs</h3>
              <span className="text-xs text-foreground/50">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
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
              <tbody className="divide-y divide-border text-sm text-foreground/75">
                {paginatedOrders.map((o) => (
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
                {paginatedOrders.length === 0 && (
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
            <div className="space-y-6 text-sm">
              {/* Customer Details */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-primary">
                    Customer Credentials
                  </h4>
                  <button
                    onClick={() => handleCopy(selectedOrder.id, 'orderId')}
                    className="text-[10px] bg-foreground/5 hover:bg-foreground/10 px-2 py-0.5 rounded text-foreground transition-all cursor-pointer"
                  >
                    {copiedField === 'orderId' ? '✓ Copied ID' : '📋 Copy Order ID'}
                  </button>
                </div>
                <div className="bg-foreground/5 p-3 rounded-lg space-y-1">
                  <div className="font-semibold text-foreground">{selectedOrder.customer.name || 'Anonymous'}</div>
                  <div className="text-xs text-foreground/70">{selectedOrder.customer.email}</div>
                  <div className="text-xs pt-1">
                    Status:{' '}
                    <span
                      className={`font-semibold ${
                        selectedOrder.customer.status === 'ACTIVE' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {selectedOrder.customer.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2 text-primary">
                  Billing Coordinates
                </h4>
                <ul className="space-y-1.5 text-xs text-foreground/80">
                  <li className="flex justify-between">
                    <span>Gateway:</span>
                    <span className="font-semibold text-foreground">
                      {selectedOrder.paymentProvider || 'None'}
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Transaction ID:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-semibold text-foreground truncate max-w-[100px]">
                        {selectedOrder.paymentId || 'Pending'}
                      </span>
                      {selectedOrder.paymentId && (
                        <button
                          onClick={() => handleCopy(selectedOrder.paymentId!, 'paymentId')}
                          className="text-[9px] bg-foreground/5 hover:bg-foreground/10 px-1 py-0.5 rounded text-foreground cursor-pointer"
                        >
                          {copiedField === 'paymentId' ? '✓' : 'Copy'}
                        </button>
                      )}
                    </div>
                  </li>
                  <li className="flex justify-between">
                    <span>Total Charged:</span>
                    <span className="font-bold text-foreground">
                      ${parseFloat(selectedOrder.amountPaid).toFixed(2)}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Delivery / Token settings */}
              <div>
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2 text-primary">
                  Delivery Token Config
                </h4>
                <ul className="space-y-1.5 text-xs text-foreground/80">
                  <li className="flex justify-between">
                    <span>Token:</span>
                    <span className="font-mono font-semibold text-foreground truncate max-w-[150px]">
                      {selectedOrder.downloadToken}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Download Clicks:</span>
                    <span className="font-bold text-foreground">
                      {selectedOrder.downloadCount} / {selectedOrder.downloadLimit}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Expiry Target:</span>
                    <span className="font-semibold text-foreground">
                      {new Date(selectedOrder.expiresAt).toLocaleDateString()}
                    </span>
                  </li>
                </ul>
              </div>

              {/* Recovery Actions */}
              <div className="border-t border-border pt-4 mt-2 space-y-2">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2 text-primary">
                  Order Recovery Options
                </h4>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleResend}
                    disabled={actionLoading || selectedOrder.status !== 'PAID'}
                    className="w-full bg-primary/10 hover:bg-primary/20 disabled:opacity-50 text-primary font-bold py-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center gap-1"
                  >
                    📩 {actionLoading ? 'Processing...' : 'Resend Receipt Email'}
                  </button>
                  <button
                    onClick={handleRegeneratedLink}
                    disabled={actionLoading}
                    className="w-full bg-yellow-600/10 hover:bg-yellow-600/20 disabled:opacity-50 text-yellow-600 font-bold py-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center gap-1"
                  >
                    🔗 {actionLoading ? 'Processing...' : 'Regenerate Download Link'}
                  </button>
                  <a
                    href={`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1'}/orders/${selectedOrder.id}/invoice`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold py-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center gap-1 border border-border"
                  >
                    📄 Download Tax Invoice (PDF)
                  </a>
                </div>
              </div>

              {/* Download History logs */}
              <div>
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2 text-primary">
                  Download History Logs
                </h4>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {selectedOrder.downloadLogs && selectedOrder.downloadLogs.length > 0 ? (
                    selectedOrder.downloadLogs.map((log) => (
                      <div
                        key={log.id}
                        className="bg-foreground/5 p-2 rounded text-xs space-y-1"
                      >
                        <div className="flex justify-between">
                          <span
                            className={`font-bold ${
                              log.success ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {log.success ? 'SUCCESS' : 'FAILED'}
                          </span>
                          <span className="text-[10px] text-foreground/45">
                            {new Date(log.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        {log.ipAddress && (
                          <div className="text-[10px] text-foreground/60 font-mono">
                            IP: {log.ipAddress}
                          </div>
                        )}
                        {log.errorMessage && (
                          <div className="text-[10px] text-red-400">Error: {log.errorMessage}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-foreground/40">
                      No download clicks logged yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Audit Timeline */}
              <div>
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2 text-primary">
                  Audit Timeline
                </h4>
                <div className="space-y-3 relative pl-4 border-l border-border text-xs">
                  <div className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span className="font-semibold text-foreground">Checkout Initiated</span>
                    <p className="text-[10px] text-foreground/50">
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedOrder.status === 'PAID' && (
                    <div className="relative">
                      <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      <span className="font-semibold text-foreground">Payment Finalized</span>
                      <p className="text-[10px] text-foreground/50">Dispatched download link</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';

export interface OrderDetail {
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

interface OrderDetailsDrawerProps {
  order: OrderDetail;
  onResendEmail: (id: string) => Promise<void>;
  onRegenerateLink: (id: string) => Promise<OrderDetail>;
}

export function OrderDetailsDrawer({
  order,
  onResendEmail,
  onRegenerateLink,
}: OrderDetailsDrawerProps) {
  const [currentOrder, setCurrentOrder] = useState<OrderDetail>(order);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleResend = async () => {
    setActionLoading(true);
    try {
      await onResendEmail(currentOrder.id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setActionLoading(true);
    try {
      const updated = await onRegenerateLink(currentOrder.id);
      setCurrentOrder(updated);
    } finally {
      setActionLoading(false);
    }
  };

  const invoiceUrl = `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1'}/orders/${currentOrder.id}/invoice`;

  return (
    <div className="space-y-6 text-sm">
      {/* Customer Details */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-primary">
            Customer Credentials
          </h4>
          <button
            onClick={() => handleCopy(currentOrder.id, 'orderId')}
            className="text-[10px] bg-foreground/5 hover:bg-foreground/10 px-2 py-0.5 rounded text-foreground transition-all cursor-pointer"
          >
            {copiedField === 'orderId' ? '✓ Copied ID' : '📋 Copy Order ID'}
          </button>
        </div>
        <div className="bg-foreground/5 p-3 rounded-lg space-y-1">
          <div className="font-semibold text-foreground">{currentOrder.customer.name || 'Anonymous'}</div>
          <div className="text-xs text-foreground/70">{currentOrder.customer.email}</div>
          <div className="text-xs pt-1">
            Status:{' '}
            <span
              className={`font-semibold ${
                currentOrder.customer.status === 'ACTIVE' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {currentOrder.customer.status}
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
            <span className="font-semibold text-foreground">{currentOrder.paymentProvider || 'None'}</span>
          </li>
          <li className="flex justify-between items-center">
            <span>Transaction ID:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-semibold text-foreground truncate max-w-[100px]">
                {currentOrder.paymentId || 'Pending'}
              </span>
              {currentOrder.paymentId && (
                <button
                  onClick={() => handleCopy(currentOrder.paymentId!, 'paymentId')}
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
              ${parseFloat(currentOrder.amountPaid).toFixed(2)}
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
              {currentOrder.downloadToken}
            </span>
          </li>
          <li className="flex justify-between">
            <span>Download Clicks:</span>
            <span className="font-bold text-foreground">
              {currentOrder.downloadCount} / {currentOrder.downloadLimit}
            </span>
          </li>
          <li className="flex justify-between">
            <span>Expiry Target:</span>
            <span className="font-semibold text-foreground">
              {new Date(currentOrder.expiresAt).toLocaleDateString()}
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
            disabled={actionLoading || currentOrder.status !== 'PAID'}
            className="w-full bg-primary/10 hover:bg-primary/20 disabled:opacity-50 text-primary font-bold py-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center gap-1"
          >
            📩 {actionLoading ? 'Processing...' : 'Resend Receipt Email'}
          </button>
          <button
            onClick={handleRegenerate}
            disabled={actionLoading}
            className="w-full bg-yellow-600/10 hover:bg-yellow-600/20 disabled:opacity-50 text-yellow-600 font-bold py-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center gap-1"
          >
            🔗 {actionLoading ? 'Processing...' : 'Regenerate Download Link'}
          </button>
          {currentOrder.status === 'PAID' ? (
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold py-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center justify-center gap-1 border border-border"
            >
              📄 Download Tax Invoice (PDF)
            </a>
          ) : (
            <div className="w-full bg-foreground/5 text-foreground/40 font-medium py-2 rounded-lg text-xs flex items-center justify-center gap-1 border border-dashed border-border select-none">
              🔒 Invoice available once settled (PAID)
            </div>
          )}
        </div>
      </div>

      {/* Download History logs */}
      <div>
        <h4 className="font-bold text-foreground text-xs uppercase tracking-wider mb-2 text-primary">
          Download History Logs
        </h4>
        <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
          {currentOrder.downloadLogs && currentOrder.downloadLogs.length > 0 ? (
            currentOrder.downloadLogs.map((log) => (
              <div key={log.id} className="bg-foreground/5 p-2 rounded text-xs space-y-1">
                <div className="flex justify-between">
                  <span className={`font-bold ${log.success ? 'text-green-500' : 'text-red-500'}`}>
                    {log.success ? 'SUCCESS' : 'FAILED'}
                  </span>
                  <span className="text-[10px] text-foreground/45">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                {log.ipAddress && (
                  <div className="text-[10px] text-foreground/60 font-mono">IP: {log.ipAddress}</div>
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
              {new Date(currentOrder.createdAt).toLocaleString()}
            </p>
          </div>
          {currentOrder.status === 'PAID' && (
            <div className="relative">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span className="font-semibold text-foreground">Payment Finalized</span>
              <p className="text-[10px] text-foreground/50">Dispatched download link</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

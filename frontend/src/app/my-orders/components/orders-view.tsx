'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formatters';

interface ProductMedia {
  id?: string;
  url: string;
  isPrimary: boolean;
}

export interface CustomerOrder {
  orderId: string;
  createdAt: string;
  amountPaid: number;
  currency: string;
  status: string;
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription?: string;
    media?: ProductMedia[];
    categories?: { id: string; name: string; slug: string }[];
  };
  downloadToken: string;
  downloadLimit: number;
  downloadCount: number;
  expiresAt: string;
  isExpired: boolean;
  isLimitExceeded: boolean;
  canDownload: boolean;
  downloadUrl: string;
  invoiceUrl: string;
}

interface OrdersViewProps {
  orders: CustomerOrder[];
  customer: { id: string; email: string; name?: string };
  onLogout: () => void;
  onRefreshOrders: () => void;
  token: string;
}

export function OrdersView({ orders, customer, onLogout, onRefreshOrders, token }: OrdersViewProps) {
  const [renewingId, setRenewingId] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<{ message: string; isError: boolean } | null>(null);

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

  const handleRenewToken = async (orderId: string) => {
    setRenewingId(orderId);
    setFeedback(null);

    try {
      const res = await fetch(`${apiUrl}/customer-portal/orders/${orderId}/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error?.message || body?.message || 'Failed to renew download link.');
      }

      setFeedback({ message: 'Download vault successfully renewed for 24 hours.', isError: false });
      onRefreshOrders();
    } catch (err: any) {
      setFeedback({ message: err.message || 'Renewal failed.', isError: true });
    } finally {
      setRenewingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Vault Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-card border border-border/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
              Verified Customer Vault
            </span>
            <span className="text-[10px] font-mono text-emerald-500 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              {orders.length} Active {orders.length === 1 ? 'License' : 'Licenses'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            My Digital Products
          </h1>
          <p className="text-xs text-foreground/60">
            Authenticated as <span className="font-semibold text-foreground">{customer.email}</span>
          </p>
        </div>

        <Button
          variant="outline"
          onClick={onLogout}
          className="text-xs font-semibold self-start sm:self-auto cursor-pointer py-2 px-4"
        >
          Sign Out of Vault
        </Button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs leading-relaxed ${
            feedback.isError
              ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="p-12 text-center bg-card border-border/80 space-y-3">
          <span className="text-4xl block">🔍</span>
          <h3 className="text-lg font-bold text-foreground">No Settled Purchases Found</h3>
          <p className="text-xs text-foreground/50 max-w-sm mx-auto">
            We could not find any active orders for this email address. Please make sure you are using the same email provided at checkout.
          </p>
          <div className="pt-2">
            <Link
              href="/store"
              className="inline-block px-5 py-2.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-xs"
            >
              Browse Catalog
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const primaryMedia = order.product.media?.find((m) => m.isPrimary) || order.product.media?.[0];
            const directDownloadUrl = `${apiUrl}/download/d/${order.downloadToken}`;
            const invoiceDownloadUrl = `${apiUrl}/orders/${order.orderId}/invoice`;

            return (
              <Card
                key={order.orderId}
                className="p-6 sm:p-8 bg-card border-border/80 shadow-xs flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
              >
                {/* Left: Product Info */}
                <div className="flex gap-4 items-start flex-1">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-foreground/5 border border-border/80 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {primaryMedia ? (
                      <img
                        src={primaryMedia.url}
                        alt={order.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-base sm:text-lg text-foreground truncate">
                        {order.product.title}
                      </h3>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        Commercial MIT
                      </Badge>
                    </div>

                    <p className="text-xs text-foreground/60 line-clamp-1 max-w-xl">
                      {order.product.shortDescription || order.product.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-foreground/50 font-mono pt-1">
                      <span>Order: #{order.orderId.slice(0, 8).toUpperCase()}</span>
                      <span>&bull;</span>
                      <span>Purchased: {formatDate(order.createdAt)}</span>
                      <span>&bull;</span>
                      <span>Quota: {order.downloadCount} of {order.downloadLimit} used</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-border/50">
                  {order.canDownload ? (
                    <a
                      href={directDownloadUrl}
                      className="px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <span>⚡</span> Download Files
                    </a>
                  ) : (
                    <Button
                      onClick={() => handleRenewToken(order.orderId)}
                      isLoading={renewingId === order.orderId}
                      className="text-xs font-bold rounded-full cursor-pointer py-2 px-4"
                    >
                      Renew Expired Link
                    </Button>
                  )}

                  <a
                    href={invoiceDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-full bg-surface-muted hover:bg-border/60 text-foreground font-semibold text-xs border border-border/80 transition-colors flex items-center gap-1.5"
                  >
                    <span>📄</span> Tax Invoice (PDF)
                  </a>

                  <Link
                    href={`/products/${order.product.slug}`}
                    className="px-3.5 py-2.5 rounded-full hover:bg-foreground/5 text-foreground/60 hover:text-foreground text-xs font-semibold transition-colors"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

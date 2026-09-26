'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Order {
  id: string;
  email: string;
  name?: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  totalPrice: string;
  product: {
    id: string;
    title: string;
  };
  downloadTokens?: {
    token: string;
    expiresAt: string;
    downloadLimit: number;
    downloadCount: number;
  }[];
}

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [attempts, setAttempts] = React.useState(0);

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

  React.useEffect(() => {
    if (!orderId) return;

    let timer: NodeJS.Timeout;

    const fetchOrder = () => {
      fetch(`${apiUrl}/orders/status/${orderId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Order verification failed.');
          return res.json();
        })
        .then((body) => {
          const fetchedOrder = body.data;
          setOrder(fetchedOrder);

          if (fetchedOrder.status === 'PAID') {
            setLoading(false);
          } else if (attempts < 6) {
            // Poll every 3 seconds for up to 6 times to wait for webhook delivery
            setAttempts((prev) => prev + 1);
            timer = setTimeout(fetchOrder, 3000);
          } else {
            setLoading(false);
          }
        })
        .catch((err) => {
          setError(err.message || 'Verification failed.');
          setLoading(false);
        });
    };

    fetchOrder();

    return () => clearTimeout(timer);
  }, [orderId, attempts]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-6"></div>
        <h2 className="text-xl font-bold text-foreground">Verifying Payment...</h2>
        <p className="text-xs text-foreground/50 mt-1 max-w-xs">
          We are confirming your payment with the gateway. This will only take a moment.
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
        <span className="text-4xl mb-4">⚠️</span>
        <h3 className="text-lg font-bold text-foreground">Verification Error</h3>
        <p className="text-xs text-foreground/50 mt-1 mb-6">
          {error || 'Unable to locate order records.'}
        </p>
        <Button onClick={() => router.push('/')}>Return to Store</Button>
      </div>
    );
  }

  const isPaid = order.status === 'PAID';
  const tokenObj = order.downloadTokens?.[0];
  const token = tokenObj?.token;
  const downloadLimit = tokenObj?.downloadLimit || 5;
  const expiresAt = tokenObj?.expiresAt ? new Date(tokenObj.expiresAt) : null;

  return (
    <div className="max-w-xl mx-auto px-4 py-12 flex-1 w-full flex flex-col justify-center animate-in fade-in duration-300">
      <div className="text-center mb-8">
        <span className="text-5xl mb-4 inline-block select-none">{isPaid ? '🎉' : '⏳'}</span>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          {isPaid ? 'Payment Successful!' : 'Payment Pending Verification'}
        </h1>
        <p className="text-xs text-foreground/50 mt-2">
          {isPaid ? 'Thank you for your purchase.' : 'Your payment is being confirmed.'}
        </p>
      </div>

      <Card className="p-6 bg-card mb-8">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
          <span className="text-xs font-bold text-foreground/60 uppercase">Order Summary</span>
          <Badge variant={isPaid ? 'success' : 'warning'}>
            {order.status}
          </Badge>
        </div>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/50">Order ID:</span>
            <span className="font-mono text-foreground font-semibold">{order.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/50">Product Name:</span>
            <span className="text-foreground font-semibold">{order.product.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/50">Customer Email:</span>
            <span className="text-foreground font-semibold">{order.email}</span>
          </div>
          <div className="flex justify-between pt-4 border-t border-border/50">
            <span className="font-bold text-foreground">Total Paid:</span>
            <span className="font-extrabold text-lg text-primary">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>
      </Card>

      {isPaid ? (
        <div className="space-y-5">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-xs text-green-700 dark:text-green-400 space-y-3 leading-relaxed">
            <div className="flex flex-col items-center justify-center border-b border-green-500/10 pb-2.5 mb-1.5 gap-1 text-center">
              <span className="font-extrabold text-sm text-green-800 dark:text-green-300 uppercase tracking-wider">✓ Payment Successful & Verified</span>
              <span className="text-[10px] text-green-600 dark:text-green-500 bg-green-500/5 px-2 py-0.5 rounded-full border border-green-500/15 font-bold">Email Sent Successfully</span>
            </div>
            <p>
              📧 A secure download link and purchase invoice has been sent to <strong className="text-foreground">{order.email}</strong>. Please <strong>check your inbox</strong> (and spam/junk folder).
            </p>
            {expiresAt && (
              <p>
                ⚠️ <strong>Download Instructions:</strong> You can download this file a maximum of <strong>{downloadLimit}</strong> times. The link is secure and will expire on <strong>{new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(expiresAt)}</strong>.
              </p>
            )}
          </div>
          {token ? (
            <Button
              className="w-full py-3.5 font-bold shadow-md cursor-pointer text-base"
              onClick={() => router.push(`/download/${token}`)}
            >
              Download Now
            </Button>
          ) : (
            <p className="text-xs text-red-500 text-center font-semibold animate-bounce">
              No download link was associated with this order. Please contact support.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-foreground/60 leading-relaxed text-center">
            We haven't received confirmation from the payment provider yet. If you have been charged, please refresh the page or contact support.
          </p>
          <Button className="w-full py-3.5 font-bold" onClick={() => window.location.reload()}>
            Refresh Order Status
          </Button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border/50 text-center">
        <Link href="/" className="text-xs font-semibold text-primary hover:underline">
          ← Continue Shopping
        </Link>
      </div>
    </div>
  );
}

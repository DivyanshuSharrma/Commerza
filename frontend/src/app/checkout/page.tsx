'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { isValidEmail } from '@/utils/assertions';
import { useCurrency } from '@/features/currency/currency-context';
import { loadRazorpayScript } from '@/features/checkout/razorpay-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Toast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';

interface Product {
  id: string;
  title: string;
  price: string;
  salePrice?: string | null;
  description: string;
}

function CheckoutForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const productId = searchParams.get('productId');

  const [product, setProduct] = React.useState<Product | null>(null);
  const [fetchingProduct, setFetchingProduct] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [couponCode, setCouponCode] = React.useState('');
  const [brand, setBrand] = React.useState<any | null>(null);
  
  const [couponDetails, setCouponDetails] = React.useState<any | null>(null);
  const [applyingCoupon, setApplyingCoupon] = React.useState(false);
  const [finalPrice, setFinalPrice] = React.useState<number>(0);
  
  const [submitting, setSubmitting] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  const [createdOrderId, setCreatedOrderId] = React.useState<string | null>(null);
  const [isMockModalOpen, setIsMockModalOpen] = React.useState(false);
  const [submittingMock, setSubmittingMock] = React.useState(false);

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api') + '/v1';

  // 1. Fetch Brand & Product details
  React.useEffect(() => {
    if (!productId) {
      setToast({ message: 'No product selected for checkout.', type: 'error' });
      setFetchingProduct(false);
      return;
    }

    // Fetch Brand Context
    fetch(`${apiUrl}/brands/subdomain/default`)
      .then((res) => {
        if (!res.ok) throw new Error('Brand lookup failed');
        return res.json();
      })
      .then((brandBody) => {
        setBrand(brandBody.data);
        // Fetch Product details
        return fetch(`${apiUrl}/products/${productId}`);
      })
      .then((res) => {
        if (!res) return;
        if (!res.ok) throw new Error('Product lookup failed');
        return res.json();
      })
      .then((body) => {
        if (!body) return;
        setProduct(body.data);
        setFinalPrice(parseFloat(body.data.salePrice || body.data.price));
      })
      .catch(() => {
        setToast({ message: 'Failed to retrieve checkout configuration.', type: 'error' });
      })
      .finally(() => {
        setFetchingProduct(false);
      });
  }, [productId]);

  // 2. Coupon Validation
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setToast(null);

    try {
      const res = await fetch(`${apiUrl}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          brandId: brand?.id,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        throw new Error(errBody?.message || 'Coupon code is invalid or disabled.');
      }

      const body = await res.json();
      const match = body.data;

      setCouponDetails(match);
      const discount = parseFloat(match.discount);
      const base = parseFloat(product!.salePrice || product!.price);
      let calculated = base;

      if (match.isPercent) {
        calculated = base - (base * discount) / 100;
      } else {
        calculated = base - discount;
      }

      setFinalPrice(Math.max(0, calculated));
      setToast({ message: 'Coupon applied successfully!', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Coupon application failed.', type: 'error' });
      setCouponDetails(null);
      if (product) setFinalPrice(parseFloat(product.salePrice || product.price));
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleConfirmMockPayment = async () => {
    if (!createdOrderId) return;
    setSubmittingMock(true);
    try {
      const res = await fetch(`${apiUrl}/orders/mock-fulfill/${createdOrderId}`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Mock fulfillment failed');
      
      router.push(`/success/${createdOrderId}`);
    } catch (err) {
      setToast({ message: 'Mock payment simulation failed.', type: 'error' });
    } finally {
      setSubmittingMock(false);
      setIsMockModalOpen(false);
    }
  };

  // 3. Checkout Submission
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !product) return;

    // Form validation
    const nextErrors: Record<string, string> = {};
    if (!isValidEmail(email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setToast(null);

    try {
      // Create Order on Backend first
      const orderRes = await fetch(`${apiUrl}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.toLowerCase(),
          name: name || undefined,
          productId: product.id,
          brandId: brand?.id,
          couponCode: couponDetails ? couponCode.trim() : undefined,
        }),
      });

      if (!orderRes.ok) {
        const errorText = await orderRes.text();
        throw new Error(`Order checkout failed: ${errorText}`);
      }

      const orderBody = await orderRes.json();
      const orderData = orderBody.data;

      const provider = orderData.payment?.provider;
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // If Razorpay Provider and Key is configured:
      if (provider === 'RAZORPAY' && keyId && keyId.startsWith('rzp_')) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          throw new Error('Razorpay SDK failed to load. Are you offline?');
        }

        const options = {
          key: keyId,
          amount: Math.round(orderData.amount * 100),
          currency: orderData.currency || 'USD',
          name: brand?.name || 'Commerza Store',
          description: `Purchase: ${product.title}`,
          order_id: orderData.payment.id,
          handler: async function () {
            setSubmitting(true);
            router.push(`/success/${orderData.orderId}`);
          },
          prefill: {
            name: name || undefined,
            email: email,
          },
          theme: {
            color: brand?.primaryColor || '#4f46e5',
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              setToast({ message: 'Payment was cancelled by the user.', type: 'error' });
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      }

      // Default: Mock, Stripe ClientSecret demo, or dev fulfillment modal
      setCreatedOrderId(orderData.orderId);
      setIsMockModalOpen(true);
      setSubmitting(false);
    } catch (err: any) {
      setToast({ message: err.message || 'Payment initiation failed. Please try again.', type: 'error' });
      setSubmitting(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 flex-1 flex flex-col justify-center animate-pulse">
        <div className="h-6 bg-foreground/10 rounded w-1/4 mb-8"></div>
        <div className="h-40 bg-foreground/5 rounded-2xl"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center">
        <span className="text-4xl mb-4">⚠️</span>
        <h3 className="text-lg font-bold text-foreground">No Product Selected</h3>
        <p className="text-xs text-foreground/50 mt-1 mb-6">Please return to the store homepage to select an item.</p>
        <Button onClick={() => router.push('/')}>Return to Store</Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 flex-1 w-full flex flex-col justify-center">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-8">
        Secure Checkout
      </h1>

      <div className="space-y-6">
        {/* Product details card */}
        <Card className="p-5 bg-card">
          <h3 className="font-bold text-foreground mb-1">{product.title}</h3>
          <p className="text-xs text-foreground/50 line-clamp-2 mb-4">{product.description}</p>
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-sm font-semibold text-foreground/60">Amount to Pay:</span>
            <div className="text-right">
              {couponDetails && (
                <div className="text-xs text-green-600 font-semibold mb-1">
                  Coupon: {couponDetails.code} (-{couponDetails.isPercent ? `${couponDetails.discount}%` : formatPrice(couponDetails.discount)})
                </div>
              )}
              <span className="text-xl font-extrabold text-primary">
                {formatPrice(finalPrice)}
              </span>
            </div>
          </div>
        </Card>

        {/* Checkout Form */}
        <form onSubmit={handlePayment} className="space-y-5">
          <Input
            label="Email Address (Required)"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            error={errors.email}
            disabled={submitting}
          />

          <Input
            label="Full Name (Optional)"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            disabled={submitting}
          />

          {/* Coupon Row */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                label="Coupon Code (Optional)"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="PROMO10"
                disabled={submitting || applyingCoupon}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={submitting || applyingCoupon || !couponCode.trim()}
              isLoading={applyingCoupon}
              onClick={handleApplyCoupon}
              className="py-3"
            >
              Apply
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full py-3.5 text-base font-bold shadow-md cursor-pointer mt-4"
            isLoading={submitting}
            disabled={submitting}
          >
            {submitting ? 'Initiating Checkout...' : `Complete Purchase • ${formatPrice(finalPrice)}`}
          </Button>
        </form>
      </div>

      {/* Dynamic Sandbox Payment Simulation Modal */}
      <Modal
        isOpen={isMockModalOpen}
        onClose={() => setIsMockModalOpen(false)}
        title="Simulate Sandbox Payment"
      >
        <div className="space-y-4">
          <p className="text-xs text-foreground/75 leading-relaxed">
            Since no Razorpay credentials are set in the environment variables, you can bypass the payment gateway by triggering the backend's secure sandbox fulfillment handler.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleConfirmMockPayment}
              isLoading={submittingMock}
              disabled={submittingMock}
              className="w-full font-bold"
            >
              Simulate Successful Payment
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsMockModalOpen(false)}
              className="w-full text-xs font-semibold"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto px-4 py-20 flex-1 flex flex-col justify-center animate-pulse">
        <div className="h-6 bg-foreground/10 rounded w-1/4 mb-8"></div>
        <div className="h-40 bg-foreground/5 rounded-2xl"></div>
      </div>
    }>
      <CheckoutForm />
    </Suspense>
  );
}

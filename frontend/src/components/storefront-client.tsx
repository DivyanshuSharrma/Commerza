'use client';

import { useState } from 'react';
import { BrandData } from '@/features/brand/brand-context.resolver';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  deliveryType: 'INTERNAL_FILE' | 'EXTERNAL_URL';
  seoTitle?: string;
  seoDescription?: string;
}

export function StorefrontClient({
  brand,
  products,
}: {
  brand: BrandData;
  products: Product[];
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    downloadToken: string;
  } | null>(null);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setLoading(true);
    setErrorToast(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    try {
      // 1. Create Pending Order & Payment Intent
      const checkoutRes = await fetch(`${apiUrl}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          productId: selectedProduct.id,
          brandId: brand.id,
        }),
      });

      if (!checkoutRes.ok) {
        throw new Error('Checkout initiation failed');
      }

      const checkoutData = await checkoutRes.json();
      const { orderId, downloadToken } = checkoutData.data;

      // 2. Since we are using MOCK payment provider by default, simulate instant success
      const fulfillRes = await fetch(`${apiUrl}/orders/mock-fulfill/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: `mock_success_${Date.now()}` }),
      });

      if (!fulfillRes.ok) {
        throw new Error('Order fulfillment failed');
      }

      setOrderResult({ orderId, downloadToken });
    } catch (err: any) {
      setErrorToast(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
      {/* Custom Error Toast */}
      {errorToast && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 font-medium">
          <span>⚠️</span>
          <span>{errorToast}</span>
          <button
            onClick={() => setErrorToast(null)}
            className="ml-4 font-bold bg-white/20 hover:bg-white/30 w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Product Catalog Grid */}
      <h2 className="text-3xl font-extrabold tracking-tight text-foreground mb-8">
        Available Products
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col bg-card border border-border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
          >
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {product.title}
              </h3>
              <p className="text-sm text-foreground/70 mb-4 line-clamp-3">
                {product.description}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-2xl font-extrabold text-primary">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="bg-primary hover:opacity-90 text-white font-medium py-2 px-5 rounded-lg transition-colors cursor-pointer"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center py-12 text-foreground/50">
            No active digital products found for this brand.
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {selectedProduct && !orderResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-foreground">Secure Checkout</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-foreground/50 hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-foreground/70 mb-4">
              You are purchasing <strong>{selectedProduct.title}</strong> for{' '}
              <strong className="text-primary">${parseFloat(selectedProduct.price).toFixed(2)}</strong>.
            </p>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/75 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/75 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:opacity-90 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-all cursor-pointer text-sm"
              >
                {loading ? 'Processing payment...' : 'Pay with Sandbox Payment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {orderResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              ✓
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Payment Successful!
            </h3>
            <p className="text-sm text-foreground/75 mb-6">
              Thank you for your purchase. Your order was successfully completed.
            </p>
            <div className="space-y-3">
              <a
                href={`http://localhost:3000/api/v1/download/d/${orderResult.downloadToken}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition-colors text-sm text-center"
              >
                Download Product
              </a>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setOrderResult(null);
                  setEmail('');
                  setName('');
                }}
                className="block w-full bg-foreground/10 hover:bg-foreground/20 text-foreground font-medium py-2 rounded-lg transition-colors text-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

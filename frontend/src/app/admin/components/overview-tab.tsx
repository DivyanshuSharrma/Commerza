'use client';

interface OverviewTabProps {
  orders: any[];
  products: any[];
}

export function OverviewTab({ orders, products }: OverviewTabProps) {
  const totalRevenue = orders
    .filter((o) => o.status === 'PAID')
    .reduce((acc, o) => acc + parseFloat(o.amountPaid), 0);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-extrabold text-foreground">Dashboard Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <span className="text-sm font-medium text-foreground/50">Total Orders</span>
          <p className="text-3xl font-extrabold text-foreground mt-2">{orders.length}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <span className="text-sm font-medium text-foreground/50">Total Revenue</span>
          <p className="text-3xl font-extrabold text-green-500 mt-2">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <span className="text-sm font-medium text-foreground/50">Active Catalog</span>
          <p className="text-3xl font-extrabold text-primary mt-2">{products.length}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">Recent Checkouts</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-foreground/5 text-xs font-semibold text-foreground/75 border-b border-border">
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Downloads</th>
              <th className="px-6 py-3">Paid Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm text-foreground/75">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-foreground/5">
                <td className="px-6 py-4 font-medium">{o.customer?.email}</td>
                <td className="px-6 py-4">{o.product?.title}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                      o.status === 'PAID'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-yellow-500/10 text-yellow-500'
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {o.downloadCount} / {o.downloadLimit}
                </td>
                <td className="px-6 py-4 font-bold">${parseFloat(o.amountPaid).toFixed(2)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-foreground/50">
                  No orders recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

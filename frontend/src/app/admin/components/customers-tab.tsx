'use client';

import { useState } from 'react';

interface Customer {
  id: string;
  email: string;
  name?: string | null;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

interface CustomersTabProps {
  customers: Customer[];
  onToggleStatus: (id: string, currentStatus: 'ACTIVE' | 'SUSPENDED') => Promise<void>;
}

export function CustomersTab({ customers, onToggleStatus }: CustomersTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmToggle, setConfirmToggle] = useState<{ id: string; status: 'ACTIVE' | 'SUSPENDED'; name: string } | null>(null);

  const pageSize = 5;

  // Filter customers
  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Paginated list
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleToggleClick = (c: Customer) => {
    setConfirmToggle({
      id: c.id,
      status: c.status,
      name: c.name || c.email,
    });
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggle) return;
    await onToggleStatus(confirmToggle.id, confirmToggle.status);
    setConfirmToggle(null);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-extrabold text-foreground">Customer Directory</h2>

      {/* Confirmation Modal */}
      {confirmToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-2xl shadow-xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-foreground mb-2">Change Account Status</h3>
            <p className="text-sm text-foreground/75 mb-6">
              Are you sure you want to {confirmToggle.status === 'ACTIVE' ? 'suspend' : 'reactivate'} the account for{' '}
              <strong>{confirmToggle.name}</strong>?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleConfirmToggle}
                className={`font-bold py-2 px-5 rounded-lg transition-colors text-sm cursor-pointer text-white ${
                  confirmToggle.status === 'ACTIVE' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {confirmToggle.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
              </button>
              <button
                onClick={() => setConfirmToggle(null)}
                className="bg-foreground/10 hover:bg-foreground/20 text-foreground font-medium py-2 px-5 rounded-lg transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-2xl shadow-sm">
        <input
          type="text"
          placeholder="Search shoppers by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:max-w-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as any);
            setCurrentPage(1);
          }}
          className="w-full sm:w-44 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Shoppers</option>
          <option value="SUSPENDED">Suspended Shoppers</option>
        </select>
      </div>

      {/* Shoppers Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">Registered Shoppers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-foreground/5 text-xs font-semibold text-foreground/75 border-b border-border">
                <th className="px-6 py-3">Customer Info</th>
                <th className="px-6 py-3">Registered On</th>
                <th className="px-6 py-3">Account Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm text-foreground/75">
              {paginated.map((c) => (
                <tr key={c.id} className="hover:bg-foreground/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{c.name || 'Anonymous Buyer'}</div>
                    <div className="text-xs text-foreground/50">{c.email}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-foreground/60">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                        c.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleToggleClick(c)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors cursor-pointer ${
                        c.status === 'ACTIVE'
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500'
                          : 'bg-green-500/10 hover:bg-green-500/20 text-green-500'
                      }`}
                    >
                      {c.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                    </button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-foreground/50">
                    No matching customer records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-3 border-t border-border bg-foreground/5 text-xs text-foreground/60">
            <span>
              Page {currentPage} of {totalPages} ({filtered.length} total shoppers)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border border-border bg-background hover:bg-foreground/5 disabled:opacity-40 rounded cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border border-border bg-background hover:bg-foreground/5 disabled:opacity-40 rounded cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

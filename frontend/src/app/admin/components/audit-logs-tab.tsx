'use client';

import { useState } from 'react';

interface AuditLog {
  id: string;
  action: string;
  details: any;
  ipAddress?: string | null;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  } | null;
}

interface AuditLogsTabProps {
  logs: AuditLog[];
}

export function AuditLogsTab({ logs }: AuditLogsTabProps) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const pageSize = 8;

  // Filter logs
  const filtered = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase());
      
    const matchesAction =
      actionFilter === 'ALL' ||
      log.action.toLowerCase().includes(actionFilter.toLowerCase());

    return matchesSearch && matchesAction;
  });

  // Paginated list
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Extract unique actions for filters
  const actionCategories = Array.from(new Set(logs.map((l) => l.action.split(':')[0] || l.action)));

  return (
    <div className="space-y-8 relative">
      <h2 className="text-3xl font-extrabold text-foreground">Administrative Audit Logs</h2>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-foreground/5">
              <h3 className="text-base font-bold text-foreground">Audit Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-foreground/50 hover:text-foreground cursor-pointer text-sm font-bold w-6 h-6 rounded-full hover:bg-foreground/5 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-foreground/50 block">Timestamp</span>
                  <span className="text-foreground font-medium">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground/50 block">Operator</span>
                  <span className="text-foreground font-medium">{selectedLog.user?.name || 'System Auto'} ({selectedLog.user?.email || 'kernel@commerza'})</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground/50 block">Action Code</span>
                  <span className="text-primary font-bold font-mono">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground/50 block">IP Address</span>
                  <span className="text-foreground font-mono">{selectedLog.ipAddress || '127.0.0.1'}</span>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <span className="text-xs font-semibold text-foreground/50 block mb-2">Metadata Context</span>
                <pre className="bg-background border border-border p-4 rounded-lg text-[11px] font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border p-4 rounded-2xl shadow-sm">
        <input
          type="text"
          placeholder="Search logs by action, email or metadata..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:max-w-xs px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
        />
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-48 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          {actionCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.toUpperCase()} Actions
            </option>
          ))}
        </select>
      </div>

      {/* Table Logs */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-bold text-foreground">Audit Timeline</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-foreground/5 text-xs font-semibold text-foreground/75 border-b border-border">
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Operator</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Details Summary</th>
                <th className="px-6 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm text-foreground/75">
              {paginated.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-foreground/5 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-xs text-foreground/60 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-foreground">{log.user?.name || 'System Auto'}</div>
                    <div className="text-xs text-foreground/50">{log.user?.email || 'kernel@commerza'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-primary/10 text-primary font-mono text-xs px-2.5 py-1 rounded font-bold">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono max-w-[220px] truncate text-foreground/50">
                    {JSON.stringify(log.details)}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-foreground/45">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-foreground/50">
                    No matching audit records recorded.
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
              Page {currentPage} of {totalPages} ({filtered.length} total logs)
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

'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface Report {
  _id: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  reportedBy: { _id: string; name: string; email: string };
  listing: { _id: string; title: string };
  createdAt: string;
}

interface Pagination { page: number; pages: number; total: number; }

export default function ReportReviews() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [activeTab, setActiveTab] = useState<'open' | 'resolved' | 'dismissed'>('open');

  const fetchReports = useCallback(async (status: string, page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${status}&skip=${(page - 1) * 50}&limit=50`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setReports(data.reports || []);
      setPagination({ page: data.page || page, pages: data.pages || 1, total: data.total || 0 });
    } catch { console.error('Error fetching reports'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReports(activeTab, 1); }, [activeTab, fetchReports]);

  const handleResolve = async (id: string) => {
    const resolution = prompt('Enter resolution details:');
    if (!resolution) return;
    try {
      const res = await fetch('/api/admin/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportId: id, action: 'resolve', resolution }) });
      if (!res.ok) throw new Error('Failed');
      fetchReports(activeTab, pagination.page);
    } catch (err) { alert(err instanceof Error ? err.message : 'Error'); }
  };

  const handleDismiss = async (id: string) => {
    try {
      const res = await fetch('/api/admin/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportId: id, action: 'dismiss', resolution: 'No action needed' }) });
      if (!res.ok) throw new Error('Failed');
      fetchReports(activeTab, pagination.page);
    } catch (err) { alert(err instanceof Error ? err.message : 'Error'); }
  };

  const tabs = ['open', 'resolved', 'dismissed'] as const;
  const tabLabel = (t: typeof tabs[number]) => t === 'open' ? `Open (${pagination.total})` : t.charAt(0).toUpperCase() + t.slice(1);

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/5">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 rounded-lg py-2 text-sm font-black transition-all ${activeTab === tab ? 'bg-white text-slate-950 shadow-sm dark:bg-teal-300 dark:text-slate-950' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}>
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-slate-400">Loading reports...</p>
      ) : reports.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
          <p className="text-slate-500 dark:text-slate-400">No reports found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report._id} className="elevated-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-black text-slate-950 dark:text-white">{report.listing.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400"><span className="text-slate-400 dark:text-slate-500">Reason:</span> {report.reason}</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{report.reportedBy.name} | {report.reportedBy.email}</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
                {activeTab === 'open' && (
                  <div className="flex flex-shrink-0 gap-2">
                    <button onClick={() => handleResolve(report._id)} className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-teal-800 dark:bg-teal-300 dark:text-slate-950">Resolve</button>
                    <button onClick={() => handleDismiss(report._id)} className="rounded-lg bg-slate-600 px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-slate-700">Dismiss</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <button onClick={() => fetchReports(activeTab, pagination.page - 1)} disabled={pagination.page === 1} className="btn-secondary disabled:translate-y-0">Previous</button>
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchReports(activeTab, pagination.page + 1)} disabled={pagination.page === pagination.pages} className="btn-secondary disabled:translate-y-0">Next</button>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface Report {
  _id: string;
  reason: string;
  status: 'open' | 'resolved' | 'dismissed';
  reportedBy: { _id: string; name: string; email: string } | null;
  listing: { _id: string; title: string } | null;
  createdAt: string;
}

interface Pagination { page: number; pages: number; total: number; }
interface ConfirmAction { title: string; message: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; }

const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

export default function ReportReviews() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [activeTab, setActiveTab] = useState<'open' | 'resolved' | 'dismissed'>('open');
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'standard'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [auditLog, setAuditLog] = useState<string[]>([]);

  const pushToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const pushAudit = (message: string) => {
    setAuditLog((items) => [`${new Date().toLocaleTimeString()} - ${message}`, ...items].slice(0, 6));
  };

  const reportSeverity = (report: Report) => /fraud|scam|abuse|fake|danger|harass|stolen/i.test(report.reason) ? 'critical' : 'standard';

  const fetchReports = useCallback(async (status: string, page = 1, quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${status}&skip=${(page - 1) * 50}&limit=50`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setReports(data.reports || []);
      setPagination({ page: data.page || page, pages: data.pages || 1, total: data.total || 0 });
    } catch {
      console.error('Error fetching reports');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(activeTab, 1);
    setSelectedIds([]);
  }, [activeTab, fetchReports]);

  useEffect(() => {
    const interval = window.setInterval(() => fetchReports(activeTab, pagination.page, true), 30000);
    return () => window.clearInterval(interval);
  }, [activeTab, fetchReports, pagination.page]);

  const processReport = async (id: string, action: 'resolve' | 'dismiss', resolution: string) => {
    const res = await fetch('/api/admin/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: id, action, resolution }),
    });
    if (!res.ok) throw new Error('Failed');
  };

  const handleResolve = (id: string) => {
    setConfirmAction({
      title: 'Resolve report',
      message: 'This closes the report as resolved and records the resolution in the audit log.',
      confirmLabel: 'Confirm Resolve',
      onConfirm: async () => {
        const resolution = notes[id] || prompt('Enter resolution details:') || '';
        if (!resolution) return;
        await processReport(id, 'resolve', resolution);
        pushToast('Report resolved');
        pushAudit(`Resolved report ${id} - ${resolution}`);
        fetchReports(activeTab, pagination.page);
      },
    });
  };

  const handleDismiss = (id: string) => {
    setConfirmAction({
      title: 'Dismiss report',
      message: 'Dismiss only when no action is needed. This action is written to the audit log.',
      confirmLabel: 'Confirm Dismiss',
      danger: true,
      onConfirm: async () => {
        const resolution = notes[id] || 'No action needed';
        await processReport(id, 'dismiss', resolution);
        pushToast('Report dismissed');
        pushAudit(`Dismissed report ${id} - ${resolution}`);
        fetchReports(activeTab, pagination.page);
      },
    });
  };

  const filteredReports = useMemo(() => {
    return reports
      .filter((report) => {
        const search = query.trim().toLowerCase();
        const createdAt = new Date(report.createdAt).getTime();
        const now = Date.now();
        const inDateRange = dateFilter === 'all' || (dateFilter === '7d' ? now - createdAt <= 7 * 24 * 60 * 60 * 1000 : now - createdAt <= 30 * 24 * 60 * 60 * 1000);
        const inSeverity = severityFilter === 'all' || reportSeverity(report) === severityFilter;
        const matchesSearch = !search || [report.listing?.title, report.reason, report.reportedBy?.name, report.reportedBy?.email]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));
        return inDateRange && inSeverity && matchesSearch;
      })
      .sort((a, b) => {
        const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortOrder === 'latest' ? -diff : diff;
      });
  }, [dateFilter, query, reports, severityFilter, sortOrder]);

  const visibleIds = filteredReports.map((report) => report._id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const statusClass = activeTab === 'open'
    ? 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200'
    : activeTab === 'resolved'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200'
      : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300';

  const toggleSelected = (id: string) => {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  };

  const toggleAllVisible = () => {
    setSelectedIds((ids) => allVisibleSelected ? ids.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...ids, ...visibleIds])));
  };

  const runBulk = (action: 'resolve' | 'dismiss') => {
    const ids = selectedIds.filter((id) => visibleIds.includes(id));
    if (!ids.length) return;
    setConfirmAction({
      title: action === 'resolve' ? 'Resolve selected reports' : 'Dismiss selected reports',
      message: `${ids.length} selected reports will be ${action === 'resolve' ? 'resolved' : 'dismissed'}.`,
      confirmLabel: action === 'resolve' ? 'Resolve Selected' : 'Dismiss Selected',
      danger: action === 'dismiss',
      onConfirm: async () => {
        for (const id of ids) await processReport(id, action, notes[id] || (action === 'resolve' ? 'Bulk resolved' : 'No action needed'));
        pushToast(`${ids.length} reports ${action === 'resolve' ? 'resolved' : 'dismissed'}`);
        pushAudit(`${action === 'resolve' ? 'Resolved' : 'Dismissed'} ${ids.length} reports`);
        setSelectedIds([]);
        fetchReports(activeTab, pagination.page);
      },
    });
  };

  const exportCsv = () => {
    const header = ['Reported Item', 'Reporter', 'Reason', 'Severity', 'Date', 'Status', 'Note'];
    const rows = filteredReports.map((report) => [
      report.listing?.title || 'Listing unavailable',
      report.reportedBy?.email || 'Reporter unavailable',
      report.reason,
      reportSeverity(report),
      new Date(report.createdAt).toLocaleString(),
      report.status,
      notes[report._id] || '',
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-reports-${activeTab}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    pushToast('Reports exported');
    pushAudit(`Exported ${filteredReports.length} report rows`);
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed right-5 top-24 z-50 rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-2xl dark:bg-white dark:text-slate-950">{toast}</div>}

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/5">
          {(['open', 'resolved', 'dismissed'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`relative rounded-lg px-4 py-2 text-sm font-black capitalize transition-all ${activeTab === tab ? 'bg-white text-slate-950 shadow-[0_0_22px_rgba(20,184,166,0.22)] after:absolute after:inset-x-3 after:-bottom-1 after:h-1 after:rounded-full after:bg-teal-500 dark:bg-teal-300 dark:text-slate-950' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}>
              {tab}
              {activeTab === tab && <span className="ml-2 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] text-white dark:bg-white dark:text-slate-950">{pagination.total}</span>}
            </button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_130px_150px_150px] xl:w-[760px]">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search reports, listings, reporters" className="field-control mt-0" />
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as 'all' | '7d' | '30d')} className="field-control mt-0" title="Filter by date">
            <option value="all">All dates</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as 'all' | 'critical' | 'standard')} className="field-control mt-0" title="Filter by severity">
            <option value="all">All severity</option>
            <option value="critical">Critical</option>
            <option value="standard">Standard</option>
          </select>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'latest' | 'oldest')} className="field-control mt-0">
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-black text-slate-700 dark:text-slate-200">{selectedIds.filter((id) => visibleIds.includes(id)).length} selected from {filteredReports.length} visible records</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => runBulk('resolve')} disabled={activeTab !== 'open' || selectedIds.length === 0} className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-300 dark:text-slate-950">Resolve selected</button>
          <button onClick={() => runBulk('dismiss')} disabled={activeTab !== 'open' || selectedIds.length === 0} className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">Dismiss selected</button>
          <button onClick={exportCsv} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-950 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white">Export CSV</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((row) => <div key={row} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-white/10" />)}</div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-400/30 dark:bg-emerald-400/10">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-black text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-200">OK</div>
          <p className="font-black text-emerald-950 dark:text-emerald-100">No matching reports</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">The current filters have no records.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm dark:border-white/10">
          <table className="min-w-[1180px] w-full border-collapse bg-white text-left dark:bg-white/[0.03]">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Select all reports" /></th>
                <th className="px-4 py-3">Reported Item</th>
                <th className="px-4 py-3">Reporter</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Admin note</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {filteredReports.map((report) => {
                const severity = reportSeverity(report);
                return (
                  <tr key={report._id} className="transition hover:bg-slate-50 dark:hover:bg-white/[0.06]">
                    <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(report._id)} onChange={() => toggleSelected(report._id)} aria-label={`Select report ${report._id}`} /></td>
                    <td className="max-w-[220px] truncate px-4 py-4 font-black text-slate-950 dark:text-white">{report.listing?.title || 'Listing unavailable'}</td>
                    <td className="max-w-[220px] truncate px-4 py-4 text-sm text-slate-500 dark:text-slate-400">{report.reportedBy ? `${report.reportedBy.name} | ${report.reportedBy.email}` : 'Reporter unavailable'}</td>
                    <td className="max-w-[260px] px-4 py-4 text-sm text-slate-500 dark:text-slate-400">{report.reason}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black capitalize ${severity === 'critical' ? 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200' : 'bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200'}`}>{severity}</span></td>
                    <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{new Date(report.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black capitalize ${statusClass}`}>{report.status}</span></td>
                    <td className="px-4 py-4"><input value={notes[report._id] || ''} onChange={(e) => setNotes((items) => ({ ...items, [report._id]: e.target.value }))} placeholder="Resolution note" className="w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-teal-500 dark:border-white/10 dark:bg-white/5" /></td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {report.listing?._id && <a href={`/listings/${report.listing._id}`} title="View reported listing" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-black text-white transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">View</a>}
                        {activeTab === 'open' && <button onClick={() => handleResolve(report._id)} title="Resolve report" className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-black text-white transition hover:-translate-y-0.5 dark:bg-teal-300 dark:text-slate-950">Resolve</button>}
                        {activeTab === 'open' && <button onClick={() => handleDismiss(report._id)} title="Dismiss report" className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-black text-white transition hover:-translate-y-0.5">Dismiss</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            Showing {filteredReports.length} of {pagination.total} {activeTab} reports. Auto-refreshes every 30 seconds.
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-sm font-black text-slate-950 dark:text-white">Audit log</p>
        <div className="mt-3 space-y-2">
          {(auditLog.length ? auditLog : ['No report actions in this session yet.']).map((item) => <p key={item} className="text-sm text-slate-500 dark:text-slate-400">{item}</p>)}
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <button onClick={() => fetchReports(activeTab, pagination.page - 1)} disabled={pagination.page === 1} className="btn-secondary disabled:translate-y-0">Previous</button>
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchReports(activeTab, pagination.page + 1)} disabled={pagination.page === pagination.pages} className="btn-secondary disabled:translate-y-0">Next</button>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-950">
            <h3 className="text-lg font-black text-slate-950 dark:text-white">{confirmAction.title}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{confirmAction.message}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setConfirmAction(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 dark:border-white/10 dark:text-slate-200">Cancel</button>
              <button onClick={async () => { const action = confirmAction; setConfirmAction(null); await action.onConfirm(); }} className={`rounded-lg px-4 py-2 text-sm font-black text-white ${confirmAction.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-700 hover:bg-teal-800'}`}>{confirmAction.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

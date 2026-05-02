'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/currency';

interface Listing {
  _id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  seller: { _id: string; name: string; email: string; college: string } | null;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Pagination { page: number; pages: number; total: number; }
interface ConfirmAction { title: string; message: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; }

const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

export default function ListingApprovals() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
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

  const fetchListings = useCallback(async (status: string, page = 1, quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings?status=${status}&skip=${(page - 1) * 50}&limit=50`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setListings(data.listings || []);
      setPagination({ page: data.page || page, pages: data.pages || 1, total: data.total || 0 });
    } catch {
      console.error('Error fetching listings');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(activeTab, 1);
    setSelectedIds([]);
  }, [activeTab, fetchListings]);

  useEffect(() => {
    const interval = window.setInterval(() => fetchListings(activeTab, pagination.page, true), 30000);
    return () => window.clearInterval(interval);
  }, [activeTab, fetchListings, pagination.page]);

  const processListing = async (id: string, action: 'approve' | 'reject', reason = '') => {
    const res = await fetch('/api/admin/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: id, action, reason }),
    });
    if (!res.ok) throw new Error('Failed');
  };

  const handleApprove = async (id: string) => {
    try {
      await processListing(id, 'approve');
      pushToast('Listing approved');
      pushAudit(`Approved listing ${id}`);
      fetchListings(activeTab, pagination.page);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleReject = (id: string) => {
    setConfirmAction({
      title: 'Reject listing',
      message: 'This removes the listing from the approval queue and records the action in the audit log.',
      confirmLabel: 'Confirm Reject',
      danger: true,
      onConfirm: async () => {
        const reason = notes[id] || prompt('Enter rejection reason (optional):') || '';
        await processListing(id, 'reject', reason);
        pushToast('Listing rejected');
        pushAudit(`Rejected listing ${id}${reason ? ` - ${reason}` : ''}`);
        fetchListings(activeTab, pagination.page);
      },
    });
  };

  const filteredListings = useMemo(() => {
    const min = Number(priceMin);
    const max = Number(priceMax);
    return listings
      .filter((listing) => {
        const search = query.trim().toLowerCase();
        const createdAt = new Date(listing.createdAt).getTime();
        const now = Date.now();
        const inDateRange = dateFilter === 'all' || (dateFilter === '7d' ? now - createdAt <= 7 * 24 * 60 * 60 * 1000 : now - createdAt <= 30 * 24 * 60 * 60 * 1000);
        const inCategory = categoryFilter === 'all' || listing.category === categoryFilter;
        const inPrice = (!priceMin || listing.price >= min) && (!priceMax || listing.price <= max);
        const matchesSearch = !search || [listing.title, listing.category, listing.condition, listing.seller?.name, listing.seller?.email]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));
        return inDateRange && inCategory && inPrice && matchesSearch;
      })
      .sort((a, b) => {
        const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        return sortOrder === 'latest' ? -diff : diff;
      });
  }, [categoryFilter, dateFilter, listings, priceMax, priceMin, query, sortOrder]);

  const categories = ['all', ...Array.from(new Set(listings.map((listing) => listing.category).filter(Boolean)))];
  const visibleIds = filteredListings.map((listing) => listing._id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const statusClass = activeTab === 'pending'
    ? 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-200'
    : activeTab === 'approved'
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200'
      : 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200';

  const toggleSelected = (id: string) => {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  };

  const toggleAllVisible = () => {
    setSelectedIds((ids) => allVisibleSelected ? ids.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...ids, ...visibleIds])));
  };

  const runBulk = (action: 'approve' | 'reject') => {
    const ids = selectedIds.filter((id) => visibleIds.includes(id));
    if (!ids.length) return;
    setConfirmAction({
      title: action === 'approve' ? 'Approve selected listings' : 'Reject selected listings',
      message: `${ids.length} selected listings will be ${action === 'approve' ? 'approved' : 'rejected'}.`,
      confirmLabel: action === 'approve' ? 'Approve Selected' : 'Reject Selected',
      danger: action === 'reject',
      onConfirm: async () => {
        for (const id of ids) await processListing(id, action, notes[id] || '');
        pushToast(`${ids.length} listings ${action === 'approve' ? 'approved' : 'rejected'}`);
        pushAudit(`${action === 'approve' ? 'Approved' : 'Rejected'} ${ids.length} listings`);
        setSelectedIds([]);
        fetchListings(activeTab, pagination.page);
      },
    });
  };

  const exportCsv = () => {
    const header = ['Title', 'Seller', 'Price', 'Category', 'Date', 'Status', 'Note'];
    const rows = filteredListings.map((listing) => [
      listing.title,
      listing.seller?.email || 'Seller unavailable',
      listing.price,
      listing.category,
      new Date(listing.createdAt).toLocaleString(),
      listing.status,
      notes[listing._id] || '',
    ]);
    const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-listings-${activeTab}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    pushToast('Listings exported');
    pushAudit(`Exported ${filteredListings.length} listing rows`);
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed right-5 top-24 z-50 rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-2xl dark:bg-white dark:text-slate-950">{toast}</div>}

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/5">
          {(['pending', 'approved', 'rejected'] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`relative rounded-lg px-4 py-2 text-sm font-black capitalize transition-all ${activeTab === tab ? 'bg-white text-slate-950 shadow-[0_0_22px_rgba(20,184,166,0.22)] after:absolute after:inset-x-3 after:-bottom-1 after:h-1 after:rounded-full after:bg-teal-500 dark:bg-teal-300 dark:text-slate-950' : 'text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'}`}>
              {tab}
              {activeTab === tab && <span className="ml-2 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] text-white dark:bg-white dark:text-slate-950">{pagination.total}</span>}
            </button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_130px_150px_110px_110px_150px] xl:w-[920px]">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, seller, category" className="field-control mt-0" />
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as 'all' | '7d' | '30d')} className="field-control mt-0" title="Filter by date">
            <option value="all">All dates</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="field-control mt-0" title="Filter by category">
            {categories.map((category) => <option key={category} value={category}>{category === 'all' ? 'All categories' : category}</option>)}
          </select>
          <input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} inputMode="numeric" placeholder="Min" className="field-control mt-0" />
          <input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} inputMode="numeric" placeholder="Max" className="field-control mt-0" />
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'latest' | 'oldest')} className="field-control mt-0">
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-black text-slate-700 dark:text-slate-200">{selectedIds.filter((id) => visibleIds.includes(id)).length} selected from {filteredListings.length} visible records</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => runBulk('approve')} disabled={activeTab !== 'pending' || selectedIds.length === 0} className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-teal-300 dark:text-slate-950">Approve selected</button>
          <button onClick={() => runBulk('reject')} disabled={activeTab !== 'pending' || selectedIds.length === 0} className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-black text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">Reject selected</button>
          <button onClick={exportCsv} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-950 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/10 dark:text-white">Export CSV</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[0, 1, 2].map((row) => <div key={row} className="h-16 animate-pulse rounded-lg bg-slate-100 dark:bg-white/10" />)}</div>
      ) : filteredListings.length === 0 ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-400/30 dark:bg-emerald-400/10">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-black text-emerald-700 shadow-sm dark:bg-white/10 dark:text-emerald-200">OK</div>
          <p className="font-black text-emerald-950 dark:text-emerald-100">No matching listings</p>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">The current filters have no records.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm dark:border-white/10">
          <table className="min-w-[1180px] w-full border-collapse bg-white text-left dark:bg-white/[0.03]">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3"><input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="Select all listings" /></th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Admin note</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {filteredListings.map((listing) => (
                <tr key={listing._id} className="transition hover:bg-slate-50 dark:hover:bg-white/[0.06]">
                  <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(listing._id)} onChange={() => toggleSelected(listing._id)} aria-label={`Select ${listing.title}`} /></td>
                  <td className="max-w-[240px] px-4 py-4"><p className="truncate font-black text-slate-950 dark:text-white">{listing.title}</p><p className="text-xs text-slate-400">{listing.condition}</p></td>
                  <td className="max-w-[220px] truncate px-4 py-4 text-sm text-slate-500 dark:text-slate-400">{listing.seller ? `${listing.seller.name} | ${listing.seller.email}` : 'Seller unavailable'}</td>
                  <td className="px-4 py-4 text-sm font-black text-slate-950 dark:text-white">{formatCurrency(listing.price)}</td>
                  <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">{listing.category}</td>
                  <td className="px-4 py-4 text-xs text-slate-500 dark:text-slate-400">{new Date(listing.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black capitalize ${statusClass}`}>{listing.status}</span></td>
                  <td className="px-4 py-4"><input value={notes[listing._id] || ''} onChange={(e) => setNotes((items) => ({ ...items, [listing._id]: e.target.value }))} placeholder="Add note" className="w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-teal-500 dark:border-white/10 dark:bg-white/5" /></td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <a href={`/listings/${listing._id}`} title="View details" className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-black text-white transition hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(15,23,42,0.28)] dark:bg-white dark:text-slate-950">View</a>
                      {activeTab === 'pending' && <button onClick={() => handleApprove(listing._id)} title="Approve listing" className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-teal-800 dark:bg-teal-300 dark:text-slate-950">Approve</button>}
                      {activeTab === 'pending' && <button onClick={() => handleReject(listing._id)} title="Reject listing" className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-rose-700">Reject</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
            Showing {filteredListings.length} of {pagination.total} {activeTab} listings. Auto-refreshes every 30 seconds.
          </div>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-sm font-black text-slate-950 dark:text-white">Audit log</p>
        <div className="mt-3 space-y-2">
          {(auditLog.length ? auditLog : ['No listing actions in this session yet.']).map((item) => <p key={item} className="text-sm text-slate-500 dark:text-slate-400">{item}</p>)}
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <button onClick={() => fetchListings(activeTab, pagination.page - 1)} disabled={pagination.page === 1} className="btn-secondary disabled:translate-y-0">Previous</button>
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchListings(activeTab, pagination.page + 1)} disabled={pagination.page === pagination.pages} className="btn-secondary disabled:translate-y-0">Next</button>
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

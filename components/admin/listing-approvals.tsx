'use client';

import React, { useCallback, useEffect, useState } from 'react';
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

export default function ListingApprovals() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const fetchListings = useCallback(async (status: string, page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings?status=${status}&skip=${(page - 1) * 50}&limit=50`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setListings(data.listings || []);
      setPagination({ page: data.page || page, pages: data.pages || 1, total: data.total || 0 });
    } catch { console.error('Error fetching listings'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchListings(activeTab, 1); }, [activeTab, fetchListings]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/admin/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: id, action: 'approve' }) });
      if (!res.ok) throw new Error('Failed');
      fetchListings(activeTab, pagination.page);
    } catch (err) { alert(err instanceof Error ? err.message : 'Error'); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason (optional):');
    try {
      const res = await fetch('/api/admin/listings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId: id, action: 'reject', reason: reason || '' }) });
      if (!res.ok) throw new Error('Failed');
      fetchListings(activeTab, pagination.page);
    } catch (err) { alert(err instanceof Error ? err.message : 'Error'); }
  };

  const tabs = ['pending', 'approved', 'rejected'] as const;
  const tabLabel = (t: typeof tabs[number]) => t === 'pending' ? `Pending (${pagination.total})` : t.charAt(0).toUpperCase() + t.slice(1);

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
        <p className="py-8 text-center text-slate-400">Loading listings...</p>
      ) : listings.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
          <p className="text-slate-500 dark:text-slate-400">No listings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div key={listing._id} className="elevated-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-black text-slate-950 dark:text-white">{listing.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatCurrency(listing.price)} | {listing.category} | {listing.condition}</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{listing.seller ? `${listing.seller.name} | ${listing.seller.email}` : 'Seller data unavailable'}</p>
                  <p className="text-xs text-slate-300 dark:text-slate-600">{new Date(listing.createdAt).toLocaleString()}</p>
                </div>
                {activeTab === 'pending' && (
                  <div className="flex flex-shrink-0 gap-2">
                    <button onClick={() => handleApprove(listing._id)} className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-teal-800 dark:bg-teal-300 dark:text-slate-950">Approve</button>
                    <button onClick={() => handleReject(listing._id)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-rose-700">Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <button onClick={() => fetchListings(activeTab, pagination.page - 1)} disabled={pagination.page === 1} className="btn-secondary disabled:translate-y-0">Previous</button>
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchListings(activeTab, pagination.page + 1)} disabled={pagination.page === pagination.pages} className="btn-secondary disabled:translate-y-0">Next</button>
        </div>
      )}
    </div>
  );
}

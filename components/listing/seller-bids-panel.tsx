'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/currency';

interface Bid {
  _id: string;
  amount: number;
  status: string;
  bidder: { name: string; email: string };
  createdAt: string;
}

export default function SellerBidsPanel({ listingId }: { listingId: string }) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionBidId, setActionBidId] = useState<string | null>(null);

  useEffect(() => {
    async function loadBids() {
      try {
        const res = await fetch(`/api/bids?listingId=${listingId}`);
        if (res.ok) setBids((await res.json()).bids);
      } catch { console.error('Failed to load bids'); }
      finally { setIsLoading(false); }
    }
    loadBids();
    const interval = setInterval(loadBids, 5000);
    return () => clearInterval(interval);
  }, [listingId]);

  async function handleBidAction(bidId: string, action: 'accepted' | 'rejected') {
    setActionBidId(bidId);
    try {
      const res = await fetch(`/api/bids/${bidId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      });
      if (res.ok) setBids((prev) => prev.map((b) => b._id === bidId ? { ...b, status: action } : b));
      else alert('Failed to update bid');
    } catch { alert('Error updating bid'); }
    finally { setActionBidId(null); }
  }

  const pendingBids = bids.filter((b) => b.status === 'pending').sort((a, b) => b.amount - a.amount);

  if (isLoading) return <p className="text-sm text-slate-500 dark:text-slate-400">Loading bids...</p>;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Incoming bids</h2>

      {pendingBids.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No pending bids yet</p>
      ) : (
        <div className="space-y-3">
          {pendingBids.map((bid) => (
            <div key={bid._id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/40 p-4">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(bid.amount)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{bid.bidder.name} · {bid.bidder.email}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleBidAction(bid._id, 'accepted')} disabled={actionBidId === bid._id}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-50 transition-colors">
                  Accept
                </button>
                <button onClick={() => handleBidAction(bid._id, 'rejected')} disabled={actionBidId === bid._id}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50 transition-colors">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {bids.filter((b) => b.status !== 'pending').length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">History</h3>
          <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
            {bids.filter((b) => b.status !== 'pending').map((bid) => (
              <div key={bid._id} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 dark:text-white">{formatCurrency(bid.amount)}</span>
                  <span className={`text-xs font-semibold ${bid.status === 'accepted' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{bid.bidder.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

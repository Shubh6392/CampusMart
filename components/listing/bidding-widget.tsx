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

interface BiddingWidgetProps {
  listingId: string;
  listingPrice: number;
  sellerId: string;
  userId?: string;
  userRole?: string;
}

export default function BiddingWidget({ listingId, listingPrice, sellerId, userId }: BiddingWidgetProps) {
  const [bidAmount, setBidAmount] = useState('');
  const [bids, setBids] = useState<Bid[]>([]);
  const [highestBid, setHighestBid] = useState<Bid | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBids() {
      try {
        const res = await fetch(`/api/bids?listingId=${listingId}`);
        if (res.ok) {
          const data = await res.json();
          setBids(data.bids);
          setHighestBid(data.highestBid);
          if (data.highestBid) setBidAmount((data.highestBid.amount + 1).toString());
        }
      } catch { console.error('Failed to load bids'); }
      finally { setIsLoading(false); }
    }
    loadBids();
  }, [listingId]);

  async function handleSubmitBid(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const minBid = highestBid ? highestBid.amount + 1 : listingPrice + 1;
    if (!bidAmount || Number(bidAmount) < minBid) { setError(`Bid must be at least ${formatCurrency(minBid)}`); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, amount: Number(bidAmount) })
      });
      if (res.ok) {
        const data = await res.json();
        setBids((prev) => [data.bid, ...prev]);
        setHighestBid(data.bid);
        setBidAmount((Number(bidAmount) + 1).toString());
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to place bid');
      }
    } catch { setError('Error placing bid. Please try again.'); }
    finally { setIsSubmitting(false); }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Bid option</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Make an offer</h2>
      </div>

      <div className="rounded-lg bg-[linear-gradient(135deg,rgba(240,253,250,0.96),rgba(236,254,255,0.78))] p-5 shadow-[inset_0_0_0_1px_rgba(45,212,191,0.24)] dark:bg-[linear-gradient(135deg,rgba(45,212,191,0.12),rgba(14,165,233,0.08))]">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {highestBid ? 'Highest bid' : 'Starting price'}
        </p>
        <p className="price-live mt-2 text-4xl font-black tracking-[0.015em] text-teal-700 dark:text-teal-300">
          {formatCurrency(highestBid ? highestBid.amount : listingPrice)}
        </p>
        {highestBid && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">by {highestBid.bidder.name} / pending acceptance</p>}
      </div>

      {userId === sellerId ? (
        <div className="rounded-lg bg-slate-50 p-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.25)] dark:bg-white/[0.04]">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">You listed this item</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">View incoming bids below</p>
        </div>
      ) : (
        <form onSubmit={handleSubmitBid} className="space-y-4">
          <div>
            <label htmlFor="bid-amount" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Your bid amount (Rs)</label>
            <input
              id="bid-amount" type="number" step="0.01" value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={formatCurrency(listingPrice + 1)}
              className="field-control"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Your bid must be higher than current.
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Minimum: {formatCurrency(highestBid ? highestBid.amount + 1 : listingPrice + 1)}
            </p>
          </div>
          {error && <p className="rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
          <button type="submit" disabled={isSubmitting || isLoading}
            className="btn-primary min-h-12 w-full text-sm font-black">
            {isSubmitting ? 'Placing bid...' : 'Place bid'}
          </button>
        </form>
      )}

      {bids.length > 0 && (
        <div className="border-t border-slate-200 pt-5 dark:border-white/10">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bid history</h3>
          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto">
            {bids.map((bid) => (
              <div key={bid._id} className="rounded-lg bg-slate-50 p-3 text-sm shadow-[inset_0_0_0_1px_rgba(148,163,184,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[inset_0_0_0_1px_rgba(45,212,191,0.35),0_12px_30px_rgba(15,118,110,0.10)] dark:bg-white/[0.04]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(bid.amount)}</span>
                  <span className={`text-xs font-semibold ${bid.status === 'accepted' ? 'text-green-600 dark:text-green-400' : bid.status === 'rejected' ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{bid.bidder.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/currency';

interface Analytics {
  users: { total: number; buyers: number; sellers: number; admins: number };
  listings: { total: number; pending: number; approved: number; rejected: number; sold: number };
  bids: { total: number; pending: number; accepted: number; rejected: number };
  messages: number;
  reports: { total: number; open: number; resolved: number; dismissed: number };
  engagement: { totalViews: number; avgListingPrice: number };
}

type StatCardData = { label: string; value: string | number; sub?: string };
type StatSection = { title: string; cards: StatCardData[] };

const StatCard = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/40 p-4">
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    {sub && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
  </div>
);

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        if (!res.ok) throw new Error('Failed');
        setAnalytics(await res.json());
      } catch { console.error('Error fetching analytics'); }
      finally { setLoading(false); }
    };
    fetch_();
    const interval = setInterval(fetch_, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p className="text-center py-8 text-slate-400">Loading analytics...</p>;
  if (!analytics) return <p className="text-center py-8 text-red-500 dark:text-red-400">Failed to load analytics</p>;

  const pct = (n: number, t: number) => t ? `${Math.round((n / t) * 100)}% of total` : undefined;
  const sections: StatSection[] = [
    { title: 'User Statistics', cards: [
      { label: 'Total Users', value: analytics.users.total },
      { label: 'Buyers', value: analytics.users.buyers, sub: pct(analytics.users.buyers, analytics.users.total) },
      { label: 'Sellers', value: analytics.users.sellers, sub: pct(analytics.users.sellers, analytics.users.total) },
      { label: 'Admins', value: analytics.users.admins },
    ]},
    { title: 'Listing Statistics', cards: [
      { label: 'Total', value: analytics.listings.total },
      { label: 'Pending', value: analytics.listings.pending },
      { label: 'Approved', value: analytics.listings.approved },
      { label: 'Rejected', value: analytics.listings.rejected },
      { label: 'Sold', value: analytics.listings.sold },
    ]},
    { title: 'Bidding Activity', cards: [
      { label: 'Total Bids', value: analytics.bids.total },
      { label: 'Pending', value: analytics.bids.pending },
      { label: 'Accepted', value: analytics.bids.accepted },
      { label: 'Rejected', value: analytics.bids.rejected },
    ]},
    { title: 'Engagement', cards: [
      { label: 'Total Views', value: analytics.engagement.totalViews.toLocaleString() },
      { label: 'Avg Price', value: formatCurrency(analytics.engagement.avgListingPrice) },
      { label: 'Messages', value: analytics.messages.toLocaleString() },
    ]},
    { title: 'Moderation', cards: [
      { label: 'Total Reports', value: analytics.reports.total },
      { label: 'Open', value: analytics.reports.open },
      { label: 'Resolved', value: analytics.reports.resolved },
      { label: 'Dismissed', value: analytics.reports.dismissed },
    ]},
  ];

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">{section.title}</h3>
          <div className={`grid gap-4 sm:grid-cols-2 ${section.cards.length >= 5 ? 'lg:grid-cols-5' : section.cards.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
            {section.cards.map((c) => <StatCard key={c.label} label={c.label} value={c.value} sub={c.sub} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

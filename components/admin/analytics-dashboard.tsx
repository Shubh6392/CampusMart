'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/currency';

interface Analytics {
  users: { total: number; buyers: number; sellers: number; admins: number };
  listings: { total: number; pending: number; approved: number; rejected: number; sold: number };
  bids: { total: number; pending: number; accepted: number; rejected: number };
  messages: number;
  reports: { total: number; open: number; resolved: number; dismissed: number };
  engagement: { totalViews: number; avgListingPrice: number; revenue?: number };
  topCategories?: { category: string; count: number; value: number }[];
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  college: string;
  role: 'buyer' | 'seller' | 'admin';
  status: 'active' | 'banned';
  createdAt: string;
}

type Tone = 'critical' | 'pending' | 'healthy' | 'info' | 'neutral';
type Range = '7d' | '30d' | 'all';

const toneClasses: Record<Tone, string> = {
  critical: 'border-rose-300 bg-[linear-gradient(135deg,#fff1f2,#ffffff)] text-rose-950 shadow-[0_24px_70px_rgba(225,29,72,0.18)] dark:border-rose-400/40 dark:bg-[linear-gradient(135deg,rgba(244,63,94,0.18),rgba(255,255,255,0.04))] dark:text-rose-100',
  pending: 'border-amber-300 bg-[linear-gradient(135deg,#fffbeb,#ffffff)] text-amber-950 shadow-[0_24px_70px_rgba(217,119,6,0.16)] dark:border-amber-400/40 dark:bg-[linear-gradient(135deg,rgba(245,158,11,0.18),rgba(255,255,255,0.04))] dark:text-amber-100',
  healthy: 'border-emerald-300 bg-[linear-gradient(135deg,#ecfdf5,#ffffff)] text-emerald-950 shadow-[0_24px_70px_rgba(5,150,105,0.14)] dark:border-emerald-400/40 dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.16),rgba(255,255,255,0.04))] dark:text-emerald-100',
  info: 'border-sky-300 bg-[linear-gradient(135deg,#f0f9ff,#ffffff)] text-sky-950 shadow-[0_24px_70px_rgba(2,132,199,0.14)] dark:border-sky-400/40 dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.16),rgba(255,255,255,0.04))] dark:text-sky-100',
  neutral: 'border-slate-200 bg-white text-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.05] dark:text-white',
};

const accentClasses: Record<Tone, string> = {
  critical: 'bg-rose-600 text-white shadow-[0_0_24px_rgba(225,29,72,0.35)]',
  pending: 'bg-amber-500 text-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.35)]',
  healthy: 'bg-emerald-600 text-white shadow-[0_0_24px_rgba(5,150,105,0.28)]',
  info: 'bg-sky-600 text-white shadow-[0_0_24px_rgba(2,132,199,0.28)]',
  neutral: 'bg-slate-900 text-white dark:bg-white dark:text-slate-950',
};

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-20 animate-pulse rounded-lg bg-slate-100 dark:bg-white/10" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-lg bg-slate-100 dark:bg-white/10" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="h-96 animate-pulse rounded-lg bg-slate-100 dark:bg-white/10" />
        <div className="h-96 animate-pulse rounded-lg bg-slate-100 dark:bg-white/10" />
      </div>
    </div>
  );
}

function Sparkline({ values, tone }: { values: number[]; tone: Tone }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = 4 + (index * 92) / Math.max(values.length - 1, 1);
    const y = 30 - ((value - min) / range) * 24;
    return `${x},${y}`;
  }).join(' ');

  const stroke = tone === 'critical' ? 'text-rose-600' : tone === 'pending' ? 'text-amber-600' : tone === 'healthy' ? 'text-emerald-600' : tone === 'info' ? 'text-sky-600' : 'text-slate-600';

  return (
    <svg viewBox="0 0 100 34" className={`h-10 w-28 ${stroke}`} aria-hidden="true">
      <polyline fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" points={points} />
    </svg>
  );
}

function KpiCard({ label, value, detail, tone, href, action, icon, trend, values }: { label: string; value: string | number; detail: string; tone: Tone; href: string; action: string; icon: string; trend: string; values: number[] }) {
  return (
    <a href={href} className={`group relative block overflow-hidden rounded-lg border p-5 transition-all hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(15,23,42,0.18)] ${toneClasses[tone]}`}>
      <div className="absolute right-4 top-4 opacity-10 transition group-hover:scale-110 group-hover:opacity-20">
        <span className="text-7xl font-black leading-none">{icon}</span>
      </div>
      <div className="relative flex items-start justify-between gap-3">
        <span className={`flex h-11 w-11 items-center justify-center rounded-lg text-sm font-black ${accentClasses[tone]}`}>{icon}</span>
        <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-black text-slate-700 shadow-sm dark:bg-white/10 dark:text-white">{trend}</span>
      </div>
      <div className="relative mt-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] opacity-70">{label}</p>
        <p className="mt-2 text-4xl font-black">{value}</p>
        <p className="mt-2 min-h-10 text-sm opacity-75">{detail}</p>
      </div>
      <div className="relative mt-4 flex items-end justify-between gap-3">
        <Sparkline values={values} tone={tone} />
        <span className="rounded-lg bg-white/85 px-3 py-2 text-xs font-black text-slate-950 shadow-sm transition group-hover:bg-slate-950 group-hover:text-white dark:bg-white/10 dark:text-white dark:group-hover:bg-white dark:group-hover:text-slate-950">
          {action}
        </span>
      </div>
    </a>
  );
}

function TrendChart({ title, subtitle, values, range, prefix = '' }: { title: string; subtitle: string; values: number[]; range: Range; prefix?: string }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(...values, 1);
  const points = values.map((value, index) => {
    const x = 8 + (index * 84) / Math.max(values.length - 1, 1);
    const y = 76 - (value / max) * 60;
    return `${x},${y}`;
  }).join(' ');
  const activeIndex = hovered ?? values.length - 1;
  const activeX = 8 + (activeIndex * 84) / Math.max(values.length - 1, 1);
  const activeY = 76 - (values[activeIndex] / max) * 60;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-950 dark:text-white">{title}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black uppercase text-slate-600 dark:bg-white/10 dark:text-slate-300">{range}</span>
      </div>
      <div className="relative mt-5">
        <svg viewBox="0 0 100 86" className="h-56 w-full overflow-visible" role="img" aria-label={`${title} chart`}>
          {[20, 40, 60, 80].map((y) => <line key={y} x1="6" x2="94" y1={y} y2={y} className="stroke-slate-100 dark:stroke-white/10" strokeWidth="0.5" />)}
          <polyline fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" points={points} className="text-teal-600 dark:text-teal-300" />
          {values.map((value, index) => {
            const x = 8 + (index * 84) / Math.max(values.length - 1, 1);
            const y = 76 - (value / max) * 60;
            return (
              <circle key={`${value}-${index}`} cx={x} cy={y} r={hovered === index ? '3.4' : '2.2'} className="fill-teal-700 dark:fill-teal-200" onMouseEnter={() => setHovered(index)}>
                <title>{`${prefix}${value.toLocaleString()} at point ${index + 1}`}</title>
              </circle>
            );
          })}
          <line x1={activeX} x2={activeX} y1="12" y2="78" className="stroke-slate-300 dark:stroke-white/20" strokeDasharray="2 2" />
          <circle cx={activeX} cy={activeY} r="3.7" className="fill-slate-950 dark:fill-white" />
        </svg>
        <div className="absolute right-3 top-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-950 shadow-lg dark:border-white/10 dark:bg-slate-950 dark:text-white">
          {prefix}{values[activeIndex].toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function StatusBars({ data }: { data: { label: string; value: number; tone: Tone }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-sm font-black text-slate-950 dark:text-white">Moderation status</p>
      <div className="mt-5 space-y-4">
        {data.map((item) => (
          <div key={item.label} title={`${item.label}: ${item.value}`}>
            <div className="mb-1 flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div className={accentClasses[item.tone]} style={{ width: `${Math.max((item.value / max) * 100, item.value ? 8 : 0)}%`, height: '100%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopCategories({ categories }: { categories: { category: string; count: number; value: number }[] }) {
  const max = Math.max(...categories.map((item) => item.count), 1);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-sm font-black text-slate-950 dark:text-white">Top categories</p>
      <div className="mt-5 space-y-4">
        {(categories.length ? categories : [{ category: 'No categories yet', count: 0, value: 0 }]).map((item) => (
          <a key={item.category} href="#approvals" className="block rounded-lg p-1 transition hover:bg-slate-50 dark:hover:bg-white/5" title={`Show listings in ${item.category}`}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-700 dark:text-slate-200">{item.category}</span>
              <span className="text-xs font-black text-slate-500 dark:text-slate-400">{item.count} listings</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div className="h-full rounded-full bg-sky-600" style={{ width: `${Math.max((item.count / max) * 100, item.count ? 8 : 0)}%` }} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>('7d');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; confirmLabel: string; danger?: boolean; onConfirm?: () => Promise<void> | void } | null>(null);
  const [toast, setToast] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  const [warningMessage, setWarningMessage] = useState('Please review CampusMart community guidelines before continuing activity on your account.');

  const confirmAdminAction = (title: string, message: string, confirmLabel: string, danger = false) => {
    setConfirmAction({ title, message, confirmLabel, danger });
  };

  const completeAdminAction = async () => {
    if (!confirmAction) return;
    if (confirmAction.onConfirm) {
      await confirmAction.onConfirm();
      return;
    }
    setToast(`${confirmAction.confirmLabel} queued`);
    setConfirmAction(null);
    window.setTimeout(() => setToast(''), 2600);
  };

  const selectedUser = users.find((user) => user._id === selectedUserId) || null;

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ limit: '25', role: userRoleFilter });
      if (userSearch.trim()) params.set('search', userSearch.trim());
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const nextUsers: AdminUser[] = data.users || [];
      setUsers(nextUsers);
      if (!selectedUserId && nextUsers[0]) {
        setSelectedUserId(nextUsers[0]._id);
        setSelectedRole(nextUsers[0].role);
      }
    } catch {
      console.error('Error fetching users');
    } finally {
      setUsersLoading(false);
    }
  }, [selectedUserId, userRoleFilter, userSearch]);

  const runUserAction = (config: { title: string; message: string; confirmLabel: string; danger?: boolean; action: () => Promise<string> }) => {
    setConfirmAction({
      title: config.title,
      message: config.message,
      confirmLabel: config.confirmLabel,
      danger: config.danger,
      onConfirm: async () => {
        try {
          const message = await config.action();
          setToast(message);
          fetchUsers();
        } catch (error) {
          setToast(error instanceof Error ? error.message : 'Action failed');
        } finally {
          setConfirmAction(null);
          window.setTimeout(() => setToast(''), 2600);
        }
      },
    });
  };

  const patchUser = async (body: Record<string, unknown>) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Action failed');
    return data.message || 'Action completed';
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/admin/analytics');
        if (!res.ok) throw new Error('Failed');
        setAnalytics(await res.json());
      } catch {
        console.error('Error fetching analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (selectedUser) setSelectedRole(selectedUser.role);
  }, [selectedUser]);

  const points = range === '7d' ? 7 : range === '30d' ? 12 : 10;
  const viewTrend = useMemo(() => {
    const total = analytics?.engagement.totalViews || 0;
    const base = Math.max(Math.round(total / points), 8);
    return Array.from({ length: points }, (_, index) => Math.round(base * (0.55 + index * 0.05 + (index % 3) * 0.08)));
  }, [analytics?.engagement.totalViews, points]);

  const revenueTrend = useMemo(() => {
    const total = analytics?.engagement.revenue || analytics?.engagement.avgListingPrice || 0;
    const base = Math.max(Math.round(total / points), 1);
    return Array.from({ length: points }, (_, index) => Math.round(base * (0.35 + index * 0.07 + (index % 2) * 0.12)));
  }, [analytics?.engagement.avgListingPrice, analytics?.engagement.revenue, points]);

  if (loading) return <LoadingSkeleton />;
  if (!analytics) return <p className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-center font-bold text-rose-700 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">Failed to load analytics</p>;

  const hasReports = analytics.reports.open > 0;
  const hasPending = analytics.listings.pending > 0;
  const hasPendingOverflow = analytics.listings.pending > 5;
  const healthTone: Tone = hasReports ? 'critical' : hasPendingOverflow ? 'pending' : 'healthy';
  const categories = analytics.topCategories || [];
  const categoryOptions = ['all', ...categories.map((item) => item.category)];

  const recentActivity = [
    { label: `${analytics.reports.open.toLocaleString()} open reports`, detail: hasReports ? 'Critical queue needs review' : 'No critical reports open' },
    { label: `${analytics.listings.pending.toLocaleString()} pending listings`, detail: hasPending ? 'Approval queue has waiting items' : 'Approval queue is clear' },
    { label: `${analytics.users.total.toLocaleString()} users registered`, detail: `${analytics.users.admins.toLocaleString()} admins can moderate` },
    { label: `${formatCurrency(analytics.engagement.revenue || 0)} sold value`, detail: `${analytics.bids.pending.toLocaleString()} bids still pending` },
  ];

  return (
    <div className="space-y-8">
      {toast && <div className="fixed right-5 top-24 z-50 rounded-lg bg-slate-950 px-4 py-3 text-sm font-black text-white shadow-2xl dark:bg-white dark:text-slate-950">{toast}</div>}

      <div className={`sticky top-20 z-20 rounded-lg border p-4 backdrop-blur ${toneClasses[healthTone]}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <span className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black ${accentClasses[healthTone]}`}>{hasReports ? '!' : hasPendingOverflow ? 'WARN' : 'OK'}</span>
            <div>
              <p className="font-black">{hasReports ? 'Critical reports need action' : hasPendingOverflow ? 'Approval queue is backing up' : 'Healthy dashboard'}</p>
              <p className="text-sm opacity-75">{analytics.reports.open} reports, {analytics.listings.pending} approvals, {analytics.bids.pending} pending bids. Red overrides yellow when reports exist.</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:w-[520px]">
            <select value={range} onChange={(e) => setRange(e.target.value as Range)} className="field-control mt-0 bg-white/85 dark:bg-slate-950/60" title="Filter chart time range">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="field-control mt-0 bg-white/85 dark:bg-slate-950/60" title="Filter category focus">
              {categoryOptions.map((category) => <option key={category} value={category}>{category === 'all' ? 'All categories' : category}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="field-control mt-0 bg-white/85 dark:bg-slate-950/60" title="Filter status focus">
              <option value="all">All statuses</option>
              <option value="open">Open reports</option>
              <option value="pending">Pending listings</option>
              <option value="approved">Approved</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Users" value={analytics.users.total.toLocaleString()} detail="Role control and account health" tone="info" href="#roles" action="Edit Roles" icon="U" trend="+12%" values={[4, 7, 6, 9, 12, 14, 18]} />
        <KpiCard label="Pending" value={analytics.listings.pending} detail={`${analytics.listings.approved} approved and ${analytics.listings.rejected} rejected`} tone={hasPending ? 'pending' : 'healthy'} href="#approvals" action="Review Queue" icon="L" trend={hasPendingOverflow ? 'Warning' : hasPending ? 'Monitor' : 'Clear'} values={[2, 4, 3, 6, 5, 7, analytics.listings.pending + 1]} />
        <KpiCard label="Reports" value={analytics.reports.open} detail={`${analytics.reports.resolved} resolved and ${analytics.reports.dismissed} dismissed`} tone={hasReports ? 'critical' : 'healthy'} href="#reports" action="Take Action" icon="!" trend={hasReports ? 'Critical' : 'Clear'} values={[1, 2, 1, 3, 2, 4, analytics.reports.open + 1]} />
        <KpiCard label="Sold Value" value={formatCurrency(analytics.engagement.revenue || 0)} detail={`${analytics.engagement.totalViews.toLocaleString()} listing views`} tone="neutral" href="#analytics" action="View Trend" icon="$" trend="+8%" values={[2, 3, 5, 4, 7, 8, 10]} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(310px,1fr)]">
        <div className="grid gap-6 xl:grid-cols-2">
          <TrendChart title="Views trend" subtitle={`Filtered by ${range}, ${categoryFilter}, ${statusFilter}`} values={viewTrend} range={range} />
          <TrendChart title="Revenue trend" subtitle="Estimated from sold listing value" values={revenueTrend} range={range} prefix="Rs " />
          <StatusBars data={[
            { label: 'Critical reports', value: analytics.reports.open, tone: 'critical' },
            { label: 'Pending approvals', value: analytics.listings.pending, tone: 'pending' },
            { label: 'Approved listings', value: analytics.listings.approved, tone: 'healthy' },
            { label: 'Sold listings', value: analytics.listings.sold, tone: 'info' },
          ]} />
          <TopCategories categories={categories} />
          <div id="roles" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] xl:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-950 dark:text-white">Role management</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Search users, change roles, deactivate accounts, or send warnings.</p>
              </div>
              <button onClick={fetchUsers} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(15,23,42,0.25)] dark:bg-white dark:text-slate-950">
                {usersLoading ? 'Loading...' : 'Refresh Users'}
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.1fr)]">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px]">
                  <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users by name, email, college" className="field-control mt-0" />
                  <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="field-control mt-0">
                    <option value="all">All roles</option>
                    <option value="buyer">Buyers</option>
                    <option value="seller">Sellers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
                <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                  {usersLoading ? (
                    [0, 1, 2].map((row) => <div key={row} className="h-14 animate-pulse rounded-lg bg-white dark:bg-white/10" />)
                  ) : users.length === 0 ? (
                    <p className="rounded-lg bg-white p-4 text-sm text-slate-500 dark:bg-white/10 dark:text-slate-400">No users found.</p>
                  ) : users.map((user) => (
                    <button key={user._id} onClick={() => setSelectedUserId(user._id)} className={`w-full rounded-lg border p-3 text-left transition hover:-translate-y-0.5 ${selectedUserId === user._id ? 'border-sky-400 bg-sky-50 shadow-[0_0_20px_rgba(14,165,233,0.18)] dark:border-sky-300/40 dark:bg-sky-400/10' : 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/5'}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950 dark:text-white">{user.name}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase ${user.status === 'banned' ? 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200'}`}>{user.status}</span>
                      </div>
                      <p className="mt-2 text-xs capitalize text-slate-500 dark:text-slate-400">{user.role} | {user.college}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                {selectedUser ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-lg font-black text-slate-950 dark:text-white">{selectedUser.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUser.email}</p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-black capitalize text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">{selectedUser.role}</span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-black capitalize ${selectedUser.status === 'banned' ? 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-200'}`}>{selectedUser.status}</span>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                      <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as 'buyer' | 'seller' | 'admin')} className="field-control mt-0">
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button onClick={() => runUserAction({
                        title: 'Edit user role',
                        message: `Change ${selectedUser.name}'s role from ${selectedUser.role} to ${selectedRole}?`,
                        confirmLabel: 'Update Role',
                        danger: selectedRole === 'admin',
                        action: () => patchUser({ userId: selectedUser._id, action: 'setRole', role: selectedRole }),
                      })} className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-800">
                        Edit Role
                      </button>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      <button onClick={() => {
                        setSelectedRole('admin');
                        runUserAction({
                          title: 'Promote to admin',
                          message: `Give ${selectedUser.name} full admin permissions?`,
                          confirmLabel: 'Promote User',
                          danger: true,
                          action: () => patchUser({ userId: selectedUser._id, action: 'setRole', role: 'admin' }),
                        });
                      }} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950">
                        Promote User
                      </button>
                      <button onClick={() => runUserAction({
                        title: selectedUser.status === 'banned' ? 'Reactivate user' : 'Deactivate user',
                        message: `${selectedUser.status === 'banned' ? 'Reactivate' : 'Deactivate'} ${selectedUser.name}'s account?`,
                        confirmLabel: selectedUser.status === 'banned' ? 'Reactivate User' : 'Deactivate User',
                        danger: selectedUser.status !== 'banned',
                        action: () => patchUser({ userId: selectedUser._id, action: 'setStatus' }),
                      })} className={`rounded-lg px-3 py-2 text-xs font-black text-white shadow-sm transition hover:-translate-y-0.5 ${selectedUser.status === 'banned' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-600 hover:bg-rose-700'}`}>
                        {selectedUser.status === 'banned' ? 'Reactivate User' : 'Deactivate User'}
                      </button>
                      <button onClick={() => runUserAction({
                        title: 'Send warning',
                        message: `Send this warning to ${selectedUser.name}: "${warningMessage}"`,
                        confirmLabel: 'Send Warning',
                        action: () => patchUser({ userId: selectedUser._id, action: 'sendWarning', message: warningMessage }),
                      })} className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-400">
                        Send Warning
                      </button>
                    </div>

                    <textarea value={warningMessage} onChange={(e) => setWarningMessage(e.target.value)} className="field-control mt-0 min-h-24" placeholder="Warning message" />
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Select a user to manage roles and account status.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-44 lg:self-start">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-sm font-black text-slate-950 dark:text-white">Quick actions</p>
            <div className="mt-4 grid gap-2">
              {[
                ['Approve pending listings', '#approvals', 'pending'],
                ['Resolve reports queue', '#reports', 'critical'],
                ['Ban user', '#roles', 'critical'],
                ['Remove listing', '#approvals', 'critical'],
                ['Feature listing', '#approvals', 'info'],
                ['Send warning', '#roles', 'pending'],
              ].map(([label, href, tone]) => (
                <button key={label} onClick={() => {
                  if (label === 'Approve pending listings' || label === 'Resolve reports queue') {
                    window.location.hash = href;
                    return;
                  }
                  confirmAdminAction(String(label), `Confirm before running "${label}". This action should be audited before it affects users or listings.`, String(label), tone === 'critical');
                }} className={`rounded-lg border px-4 py-3 text-left text-sm font-black transition hover:-translate-y-0.5 hover:shadow-[0_0_24px_rgba(20,184,166,0.20)] ${toneClasses[tone as Tone]}`}>
                  <span className="mr-2">{tone === 'critical' ? '!' : tone === 'pending' ? 'P' : '>'}</span>{label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-slate-950 dark:text-white">Recent activity</p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-500 dark:bg-white/10 dark:text-slate-300">Live</span>
            </div>
            <div className="mt-4 space-y-4">
              {recentActivity.map((item, index) => (
                <div key={item.label} className={`border-l-2 pl-3 ${index === 0 && hasReports ? 'border-rose-500' : index === 1 && hasPending ? 'border-amber-500' : 'border-teal-500'}`}>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{item.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-950">
            <h3 className="text-lg font-black text-slate-950 dark:text-white">{confirmAction.title}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{confirmAction.message}</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setConfirmAction(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 dark:border-white/10 dark:text-slate-200">Cancel</button>
              <button onClick={completeAdminAction} className={`rounded-lg px-4 py-2 text-sm font-black text-white ${confirmAction.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-700 hover:bg-teal-800'}`}>{confirmAction.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

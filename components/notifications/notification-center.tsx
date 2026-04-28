'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/lib/currency';

interface Notification {
  _id: string;
  type: 'message' | 'bid' | 'listingUpdate';
  payload: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

interface Pagination { page: number; pages: number; total: number; unreadCount: number; }

export default function NotificationCenter() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0, unreadCount: 0 });
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const fetchNotifications = async (page = 1, unreadOnly = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?skip=${(page - 1) * 20}&limit=20&unreadOnly=${unreadOnly}`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setNotifications(data.notifications || []);
      setPagination({ page: data.page || page, pages: data.pages || 1, total: data.total || 0, unreadCount: data.unreadCount || 0 });
    } catch { console.error('Error fetching notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (session?.user) {
      fetchNotifications(1, showUnreadOnly);
      const interval = setInterval(() => fetchNotifications(1, showUnreadOnly), 5000);
      return () => clearInterval(interval);
    }
  }, [session?.user, showUnreadOnly]);

  const getMessage = (n: Notification) => {
    const p = n.payload as any;
    if (n.type === 'message') return `New message from ${p.senderName || 'someone'}`;
    if (n.type === 'bid') return `New bid of ${typeof p.bidAmount === 'number' ? formatCurrency(p.bidAmount) : 'Rs ?'} on your listing`;
    if (n.type === 'listingUpdate') return `Your listing "${p.listingTitle || 'item'}" was ${p.status}`;
    return 'New notification';
  };

  const getLabel = (type: string) => ({ message: 'Message', bid: 'Bid', listingUpdate: 'Listing' }[type] || 'Alert');

  if (!session?.user) {
    return <div className="p-6"><p className="text-sm font-semibold text-amber-700 dark:text-amber-200">Please sign in to view notifications.</p></div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{pagination.unreadCount} unread</p>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <input type="checkbox" checked={showUnreadOnly} onChange={(e) => setShowUnreadOnly(e.target.checked)} className="cursor-pointer rounded border-slate-300" />
            Unread only
          </label>
          {pagination.unreadCount > 0 && (
            <button onClick={async () => { await fetch('/api/notifications', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'markAllAsRead' }) }); fetchNotifications(1, showUnreadOnly); }} className="text-sm font-black text-teal-700 transition hover:text-teal-900 dark:text-teal-300">
              Mark all read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-slate-400">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
          <p className="text-slate-500 dark:text-slate-400">{showUnreadOnly ? 'All notifications are read' : 'No notifications yet'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n._id} className={`rounded-lg border p-4 transition-colors ${n.read ? 'border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]' : 'border-teal-200 bg-teal-50 dark:border-teal-300/25 dark:bg-teal-300/10'}`}>
              <div className="flex items-start gap-3">
                <span className="status-pill flex-shrink-0">{getLabel(n.type)}</span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${n.read ? 'text-slate-600 dark:text-slate-300' : 'font-black text-slate-950 dark:text-white'}`}>{getMessage(n)}</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  {!n.read && (
                    <button onClick={async () => { await fetch(`/api/notifications/${n._id}`, { method: 'PUT' }); fetchNotifications(pagination.page, showUnreadOnly); }} className="text-xs font-black text-teal-700 hover:text-teal-900 dark:text-teal-300">
                      Mark read
                    </button>
                  )}
                  <button onClick={async () => { await fetch(`/api/notifications/${n._id}`, { method: 'DELETE' }); fetchNotifications(pagination.page, showUnreadOnly); }} className="text-xs font-semibold text-slate-400 hover:text-rose-600 dark:hover:text-rose-300">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => fetchNotifications(pagination.page - 1, showUnreadOnly)} disabled={pagination.page === 1} className="btn-secondary disabled:translate-y-0">Previous</button>
          <span className="px-4 py-3 text-sm font-bold text-slate-500 dark:text-slate-400">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchNotifications(pagination.page + 1, showUnreadOnly)} disabled={pagination.page === pagination.pages} className="btn-secondary disabled:translate-y-0">Next</button>
        </div>
      )}
    </div>
  );
}

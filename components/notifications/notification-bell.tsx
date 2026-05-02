'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface NotificationItem {
  _id: string;
  type: 'message' | 'bid' | 'listingUpdate';
  payload?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

const notificationLabel = (notification: NotificationItem) => {
  const title = typeof notification.payload?.title === 'string' ? notification.payload.title : '';
  const message = typeof notification.payload?.message === 'string' ? notification.payload.message : '';
  if (message) return message;
  if (notification.type === 'message') return title || 'New message received';
  if (notification.type === 'bid') return title || 'New bid activity';
  return title || 'Listing update available';
};

export default function NotificationBell() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useMemo(() => async () => {
    if (!session?.user) return;
    try {
      const res = await fetch('/api/notifications?limit=5');
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
      setNotifications(data.notifications || []);
    } catch {}
  }, [session?.user]);

  useEffect(() => {
    if (!session?.user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications, session?.user]);

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Open notifications">
        <svg className="h-5 w-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
            <p className="text-sm font-black text-slate-950 dark:text-white">Notifications</p>
            <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-black text-red-700 dark:bg-red-400/10 dark:text-red-200">{unreadCount} unread</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">No notifications yet.</p>
            ) : notifications.map((notification) => (
              <Link key={notification._id} href="/notifications" onClick={() => setOpen(false)} className="block border-b border-slate-100 px-4 py-3 transition hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5">
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.read ? 'bg-slate-300' : 'bg-red-500'}`} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950 dark:text-white">{notificationLabel(notification)}</p>
                    <p className="mt-1 text-xs capitalize text-slate-500 dark:text-slate-400">{notification.type} | {new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/notifications" onClick={() => setOpen(false)} className="block bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-slate-100 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

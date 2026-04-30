'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Message {
  _id: string;
  content: string;
  from: { _id: string; name: string; email: string };
  to: { _id: string; name: string; email: string };
  read: boolean;
  createdAt: string;
}

const quickReplies = [
  'Is this still available?',
  'Can we meet on campus today?',
  'What is your final price?',
  'Could you share a few more details?'
];

function getInitials(name?: string) {
  return (name || 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatMessageTime(date: string) {
  return new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

function formatDayLabel(date: string) {
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) return 'Today';
  if (messageDate.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return new Intl.DateTimeFormat([], { month: 'short', day: 'numeric', year: 'numeric' }).format(messageDate);
}

export default function ChatWidget({ listingId, sellerId, sellerName, listingTitle }: { listingId: string; sellerId: string; sellerName: string; listingTitle?: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const userId = (session?.user as any)?.id;
  const conversationId = [listingId, ...[userId, sellerId].sort()].join('_');

  const scrollToBottom = useCallback(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, []);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}&limit=100`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setMessages(data);
      for (const msg of data) {
        if (msg.to._id === userId && !msg.read) {
          await fetch(`/api/messages/${msg._id}`, { method: 'PUT' }).catch(console.error);
        }
      }
    } catch { setError('Failed to load messages'); }
    finally { setLoading(false); }
  }, [conversationId, userId]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages]);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isOnline) return;
    setSending(true); setError('');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, listingId, recipientId: sellerId, content: content.trim() })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to send'); }
      setContent('');
      await fetchMessages();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to send message'); }
    finally { setSending(false); }
  };

  if (!session) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Please <a href="/auth/signin" className="underline underline-offset-4">sign in</a> to message the seller.</p>
      </div>
    );
  }
  if (userId === sellerId) {
    return (
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-5 dark:border-teal-300/25 dark:bg-teal-300/10">
        <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">This is your listing. You&apos;ll see buyer messages here.</p>
      </div>
    );
  }

  return (
    <div className="surface-panel flex min-h-[640px] flex-col overflow-hidden">
      <div className="border-b border-slate-200/80 bg-white/85 px-5 py-4 backdrop-blur dark:border-white/10 dark:bg-slate-950/35 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white shadow-sm dark:bg-teal-300 dark:text-slate-950">
              {getInitials(sellerName)}
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="truncate text-base font-black text-slate-950 dark:text-white">{sellerName}</h3>
                <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-300/25 dark:bg-emerald-300/10 dark:text-emerald-200 sm:inline-flex">
                  Trusted chat
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
                {listingTitle || 'CampusMart conversation'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]' : 'bg-slate-400'}`} />
            {isOnline ? 'Connected' : 'Offline'}
          </div>
        </div>
      </div>

      {error && <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{error}</div>}

      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-4 py-5 dark:bg-slate-950/20 sm:px-6">
        {loading ? (
          <div className="space-y-3 py-8">
            <div className="h-16 w-2/3 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />
            <div className="ml-auto h-20 w-3/4 animate-pulse rounded-lg bg-teal-100 dark:bg-teal-300/15" />
            <div className="h-14 w-1/2 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />
          </div>
        ) : messages.length === 0 ? (
          <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white text-2xl shadow-sm dark:border-white/10 dark:bg-white/5">
              @
            </div>
            <h4 className="mt-5 text-lg font-black text-slate-950 dark:text-white">Start a clear conversation</h4>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Confirm price, availability, pickup location, and timing before you meet.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const mine = msg.from._id === userId;
            const previous = messages[index - 1];
            const showDay = !previous || new Date(previous.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();
            return (
              <React.Fragment key={msg._id}>
                {showDay && (
                  <div className="flex justify-center">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:border-white/10 dark:bg-white/5">
                      {formatDayLabel(msg.createdAt)}
                    </span>
                  </div>
                )}
                <div className={`flex items-end gap-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                  {!mine && (
                    <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-white/10 dark:text-white dark:ring-white/10">
                      {getInitials(msg.from.name)}
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-lg px-4 py-3 shadow-sm sm:max-w-[68%] ${mine ? 'bg-teal-700 text-white dark:bg-teal-300 dark:text-slate-950' : 'border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-white/10 dark:text-slate-100'}`}>
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">{msg.content}</p>
                    <div className={`mt-2 flex items-center gap-2 text-[11px] font-semibold ${mine ? 'text-teal-100 dark:text-teal-900' : 'text-slate-400'}`}>
                      <span>{formatMessageTime(msg.createdAt)}</span>
                      {mine && <span>{msg.read ? 'Read' : 'Sent'}</span>}
                    </div>
                  </div>
                  {mine && (
                    <div className="mb-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-white shadow-sm dark:bg-teal-300 dark:text-slate-950">
                      {getInitials(session.user?.name || 'Me')}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200/80 bg-white/95 px-4 py-4 dark:border-white/10 dark:bg-slate-950/35 sm:px-6">
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => setContent(reply)}
              className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:border-teal-300/40 dark:hover:bg-teal-300/10 dark:hover:text-teal-100"
            >
              {reply}
            </button>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex items-end gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a message..."
            disabled={sending || !isOnline}
            rows={2}
            maxLength={1000}
            className="field-control mt-0 min-h-[52px] flex-1 resize-none py-3 disabled:opacity-50"
          />
          <button type="submit" disabled={sending || !content.trim() || !isOnline}
            className="btn-primary h-[52px] px-5">
            {sending ? 'Sending' : 'Send'}
          </button>
        </form>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs font-semibold text-slate-400">
          <span>{!isOnline ? 'You are offline. Reconnect to send.' : 'Messages refresh automatically.'}</span>
          <span>{content.length}/1000</span>
        </div>
      </div>
    </div>
  );
}

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

export default function ChatWidget({ listingId, sellerId, sellerName }: { listingId: string; sellerId: string; sellerName: string }) {
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
      <div className="rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4">
        <p className="text-sm text-amber-700 dark:text-amber-300">Please <a href="/auth/signin" className="font-semibold underline">sign in</a> to message the seller.</p>
      </div>
    );
  }
  if (userId === sellerId) {
    return (
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-300/25 dark:bg-teal-300/10">
        <p className="text-sm font-semibold text-teal-800 dark:text-teal-200">This is your listing. You&apos;ll see buyer messages here.</p>
      </div>
    );
  }

  return (
    <div className="surface-panel flex flex-col overflow-hidden">
      <div className="border-b border-slate-200/80 bg-white/70 px-5 py-4 dark:border-white/10 dark:bg-white/[0.03]">
        <h3 className="font-black text-slate-950 dark:text-white">{sellerName}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-green-500' : 'bg-slate-400'}`} />
          {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>

      {error && <div className="border-b border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-5 py-2 text-sm text-red-600 dark:text-red-400">{error}</div>}

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ maxHeight: '400px' }}>
        {loading ? (
          <p className="text-center text-sm text-slate-400 py-8">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-8">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => {
            const mine = msg.from._id === userId;
            return (
              <div key={msg._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-lg px-4 py-2.5 ${mine ? 'bg-teal-700 text-white dark:bg-teal-300 dark:text-slate-950' : 'bg-slate-100 text-slate-900 dark:bg-white/10 dark:text-slate-100'}`}>
                  <p className="text-sm break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${mine ? 'text-teal-100 dark:text-teal-900' : 'text-slate-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-slate-200/80 px-5 py-4 dark:border-white/10">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text" value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="Say something..." disabled={sending || !isOnline}
            className="field-control mt-0 flex-1 py-2.5 disabled:opacity-50"
          />
          <button type="submit" disabled={sending || !content.trim() || !isOnline}
            className="btn-primary px-5 py-2.5">
            {sending ? '...' : 'Send'}
          </button>
        </form>
        {!isOnline && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">You&apos;re offline. Messages will send when you reconnect.</p>}
      </div>
    </div>
  );
}

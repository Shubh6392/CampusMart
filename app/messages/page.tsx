'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatWidget from '@/components/chat/chat-widget';
import Header from '@/components/header';

interface Conversation {
  listing: { _id: string; title: string };
  otherUser: { _id: string; name: string; email: string };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  conversationId: string;
}

function formatInboxTime(date?: string) {
  if (!date) return '';
  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit' }).format(messageDate);
  }

  if (messageDate.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return new Intl.DateTimeFormat([], { month: 'short', day: 'numeric' }).format(messageDate);
}

function getInitials(name?: string) {
  return (name || 'User')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function MessagesLoading() {
  return (
    <div className="app-shell">
      <Header />
      <div className="flex items-center justify-center py-32">
        <p className="font-semibold text-slate-500 dark:text-slate-400">Loading messages...</p>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => { if (status === 'unauthenticated') router.push('/auth/signin'); }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/conversations')
      .then((r) => r.json())
      .then((data) => { setConversations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    const convId = searchParams.get('conversationId');
    if (convId && conversations.length > 0) {
      const match = conversations.find((c) => c.conversationId === convId);
      if (match) setSelected(match);
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (!selected && conversations.length > 0) setSelected(conversations[0]);
  }, [selected, conversations]);

  const filteredConversations = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return conversations;
    return conversations.filter((conv) => {
      return [
        conv.otherUser?.name,
        conv.otherUser?.email,
        conv.listing?.title,
        conv.lastMessage
      ].some((value) => value?.toLowerCase().includes(normalized));
    });
  }, [conversations, query]);

  const unreadTotal = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);

  if (status === 'loading' || loading) return <MessagesLoading />;

  return (
    <div className="app-shell">
      <Header />
      <main className="py-8 sm:py-12">
        <div className="app-container space-y-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Inbox</p>
              <h1 className="section-title mt-3">Messages</h1>
              <p className="muted-copy mt-4 max-w-2xl text-base sm:text-lg">Keep every CampusMart negotiation, pickup detail, and listing question in one focused workspace.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-auto sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white/85 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Threads</p>
                <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{conversations.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/85 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Unread</p>
                <p className="mt-1 text-2xl font-black text-teal-700 dark:text-teal-300">{unreadTotal}</p>
              </div>
              <div className="col-span-2 rounded-lg border border-slate-200 bg-white/85 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.06] sm:col-span-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Status</p>
                <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200">Active</p>
              </div>
            </div>
          </div>

          <div className="grid min-h-[720px] grid-cols-1 gap-5 lg:grid-cols-[390px_minmax(0,1fr)] lg:items-stretch">
            <aside className="surface-panel flex overflow-hidden lg:min-h-[720px]">
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="border-b border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-black text-slate-950 dark:text-white">Conversations</h2>
                      <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{filteredConversations.length} visible</p>
                    </div>
                    {unreadTotal > 0 && (
                      <span className="rounded-full bg-teal-700 px-2.5 py-1 text-xs font-black text-white dark:bg-teal-300 dark:text-slate-950">{unreadTotal}</span>
                    )}
                  </div>
                  <div className="mt-4">
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search messages"
                      className="field-control mt-0 h-11"
                    />
                  </div>
                </div>

                {conversations.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white text-2xl shadow-sm dark:border-white/10 dark:bg-white/5">@</div>
                    <h3 className="mt-5 text-lg font-black text-slate-950 dark:text-white">No conversations yet</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">When buyers or sellers reply, your active discussions will appear here.</p>
                    <Link href="/listings" className="btn-secondary mt-5 px-4 py-2.5">Browse listings</Link>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center p-8 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                    No conversations match your search.
                  </div>
              ) : (
                  <ul className="flex-1 overflow-y-auto">
                  {filteredConversations.map((conv) => (
                    <li key={conv.conversationId}>
                      <button
                        onClick={() => setSelected(conv)}
                        className={`w-full border-b border-slate-100 px-4 py-4 text-left transition-colors hover:bg-teal-50/70 dark:border-white/10 dark:hover:bg-white/10 ${
                          selected?.conversationId === conv.conversationId ? 'bg-teal-50 dark:bg-teal-300/10' : 'bg-white/40 dark:bg-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-xs font-black text-white shadow-sm dark:bg-teal-300 dark:text-slate-950">
                            {getInitials(conv.otherUser?.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <span className="truncate text-sm font-black text-slate-950 dark:text-white">{conv.otherUser?.name || 'Unknown'}</span>
                              <span className="shrink-0 text-[11px] font-bold text-slate-400">{formatInboxTime(conv.lastMessageTime)}</span>
                            </div>
                            <p className="mt-1 truncate text-xs font-bold text-slate-500 dark:text-slate-400">{conv.listing?.title || 'Listing'}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <p className="min-w-0 flex-1 truncate text-xs text-slate-400 dark:text-slate-500">{conv.lastMessage || 'No preview available'}</p>
                              {conv.unreadCount > 0 && <span className="shrink-0 rounded-full bg-teal-700 px-2 py-0.5 text-[11px] font-black text-white dark:bg-teal-300 dark:text-slate-950">{conv.unreadCount}</span>}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              </div>
            </aside>

            <section className="min-w-0">
              {selected ? (
                <div className="space-y-4">
                  <div className="surface-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-sm font-black text-white shadow-sm dark:bg-teal-300 dark:text-slate-950">
                        {getInitials(selected.otherUser?.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Conversation</p>
                        <h2 className="mt-1 truncate text-2xl font-black text-slate-950 dark:text-white">{selected.otherUser.name}</h2>
                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{selected.otherUser.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link href={`/listings/${selected.listing._id}`} className="btn-secondary px-4 py-2.5">
                        View listing
                      </Link>
                      <Link href={`/users/${selected.otherUser._id}`} className="btn-primary px-4 py-2.5">
                        View profile
                      </Link>
                    </div>
                  </div>

                  <ChatWidget listingId={selected.listing._id} sellerId={selected.otherUser._id} sellerName={selected.otherUser.name} listingTitle={selected.listing.title} />
                </div>
              ) : (
                <div className="surface-panel flex min-h-[640px] items-center justify-center p-12 text-center">
                  <div>
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg border border-slate-200 bg-white text-2xl shadow-sm dark:border-white/10 dark:bg-white/5">@</div>
                    <h3 className="mt-5 text-lg font-black text-slate-950 dark:text-white">Select a conversation</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your active thread will open here.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

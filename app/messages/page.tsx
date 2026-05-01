'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatWidget from '@/components/chat/chat-widget';
import Header from '@/components/header';

interface Conversation {
  listing: { _id: string; title: string; price?: number; images?: string[] };
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
      <main className="py-6 sm:py-8">
        <div className="app-container space-y-5">
          <div className="flex flex-col gap-3">
            <div>
              <p className="eyebrow">Inbox</p>
              <h1 className="section-title mt-2">Messages</h1>
            </div>
          </div>

          <div className="grid min-h-[720px] grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-stretch xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="surface-panel flex overflow-hidden lg:min-h-[720px]">
              <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
                <div className="border-b border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mb-4 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/[0.04]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Threads</p>
                      <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{conversations.length}</p>
                    </div>
                    <div className="rounded-lg bg-teal-50 px-3 py-2 dark:bg-teal-300/10">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Unread</p>
                      <p className="mt-1 text-lg font-black text-teal-700 dark:text-teal-200">{unreadTotal}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 px-3 py-2 dark:bg-emerald-300/10">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">Status</p>
                      <p className="mt-1 text-xs font-black text-emerald-700 dark:text-emerald-200">Active</p>
                    </div>
                  </div>
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
                  <ul className="flex-1 overflow-x-hidden overflow-y-auto">
                  {filteredConversations.map((conv) => (
                    <li key={conv.conversationId}>
                      <button
                        onClick={() => setSelected(conv)}
                        className={`w-full border-b border-l-[3px] border-b-slate-100 px-4 py-4 text-left transition-all duration-200 hover:bg-teal-50/80 hover:shadow-[inset_10px_0_22px_rgba(20,184,166,0.10)] dark:border-b-white/10 dark:hover:bg-white/10 ${
                          selected?.conversationId === conv.conversationId ? 'border-l-teal-500 bg-[rgba(20,184,166,0.10)] shadow-[inset_10px_0_22px_rgba(20,184,166,0.16),0_10px_26px_rgba(15,118,110,0.10)] dark:border-l-teal-300 dark:bg-teal-300/15 dark:shadow-[inset_10px_0_22px_rgba(45,212,191,0.10)]' : 'border-l-transparent bg-white/40 dark:bg-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xs font-black shadow-sm ${
                            selected?.conversationId === conv.conversationId ? 'bg-teal-700 text-white ring-4 ring-teal-500/15 dark:bg-teal-300 dark:text-slate-950' : 'bg-slate-950 text-white dark:bg-teal-300 dark:text-slate-950'
                          }`}>
                            {getInitials(conv.otherUser?.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <span className="truncate text-sm font-black text-slate-950 dark:text-white">{conv.otherUser?.name || 'Unknown'}</span>
                              <span className="shrink-0 text-[11px] font-bold text-slate-400">{formatInboxTime(conv.lastMessageTime)}</span>
                            </div>
                            <p className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{conv.listing?.title || 'Listing'}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <p className="min-w-0 flex-1 truncate text-xs font-medium text-slate-400 dark:text-slate-500">{conv.lastMessage || 'No preview available'}</p>
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
                <div className="flex min-h-[720px] flex-col overflow-hidden bg-white/45 dark:bg-white/[0.025]">
                  <div className="flex items-center border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-950/35">
                    <div className="flex min-w-0 items-center gap-2">
                      <h2 className="truncate text-base font-black text-slate-950 dark:text-white">{selected.otherUser.name}</h2>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200">Active</span>
                    </div>
                  </div>

                  <ChatWidget
                    listingId={selected.listing._id}
                    sellerId={selected.otherUser._id}
                    sellerName={selected.otherUser.name}
                    listingTitle={selected.listing.title}
                    listingPrice={selected.listing.price}
                    listingImage={selected.listing.images?.[0]}
                    frameless
                    hideHeader
                    stickyListingBar
                  />
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

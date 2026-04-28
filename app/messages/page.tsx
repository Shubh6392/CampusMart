'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
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

  if (status === 'loading' || loading) return <MessagesLoading />;

  return (
    <div className="app-shell">
      <Header />
      <main className="py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 space-y-6">
          <div className="surface-panel p-7 sm:p-10">
            <p className="eyebrow">Inbox</p>
            <h1 className="section-title mt-3">Messages</h1>
            <p className="muted-copy mt-4 text-lg">Keep negotiations, pickup details, and listing questions in one place.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-start">
            <div className="surface-panel overflow-hidden md:col-span-1">
              {conversations.length === 0 ? (
                <p className="p-6 text-sm font-semibold text-slate-500 dark:text-slate-400">No conversations yet.</p>
              ) : (
                <ul>
                  {conversations.map((conv) => (
                    <li key={conv.conversationId}>
                      <button
                        onClick={() => setSelected(conv)}
                        className={`w-full border-b border-slate-100 px-4 py-4 text-left transition-colors hover:bg-teal-50 dark:border-white/10 dark:hover:bg-white/10 ${
                          selected?.conversationId === conv.conversationId ? 'bg-teal-50 dark:bg-teal-300/10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-black text-slate-950 dark:text-white">{conv.otherUser?.name || 'Unknown'}</span>
                          {conv.unreadCount > 0 && <span className="rounded-full bg-teal-700 px-2 py-0.5 text-xs font-black text-white dark:bg-teal-300 dark:text-slate-950">{conv.unreadCount}</span>}
                        </div>
                        <p className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{conv.listing?.title || 'Listing'}</p>
                        <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500">{conv.lastMessage}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="md:col-span-2">
              {selected ? (
                <div className="space-y-4">
                  <div className="surface-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Conversation</p>
                      <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{selected.otherUser.name}</h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selected.otherUser.email}</p>
                    </div>
                    <Link href={`/users/${selected.otherUser._id}`} className="btn-secondary">
                      View profile
                    </Link>
                  </div>

                  <ChatWidget listingId={selected.listing._id} sellerId={selected.otherUser._id} sellerName={selected.otherUser.name} />
                </div>
              ) : (
                <div className="surface-panel p-12 text-center font-semibold text-slate-400">
                  Select a conversation to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

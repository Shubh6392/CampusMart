'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ListingCard from '@/components/listing/listing-card';
import Header from '@/components/header';

interface BookmarkedListing {
  _id: string;
  listing: { _id: string; title: string; price: number; images: string[]; category: string; condition: string; campus: string; seller: { _id: string; name: string; email: string } };
  createdAt: string;
}

interface Pagination { page: number; pages: number; total: number; }

export default function BookmarksView() {
  const { status } = useSession();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0 });

  useEffect(() => { if (status === 'unauthenticated') router.push('/auth/signin'); }, [status, router]);

  const fetchBookmarks = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookmarks?skip=${(page - 1) * 12}&limit=12`);
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setBookmarks(data.bookmarks || []);
      setPagination({ page: data.page || page, pages: data.pages || 1, total: data.total || 0 });
    } catch { console.error('Error fetching bookmarks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (status === 'authenticated') fetchBookmarks(); }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="app-shell">
        <Header />
        <main className="py-10 sm:py-16">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 animate-pulse rounded-lg bg-slate-200/80 dark:bg-white/10" />)}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 space-y-10">
          <div className="surface-panel p-7 sm:p-10">
            <p className="eyebrow">Bookmarks</p>
            <h1 className="section-title mt-3">Saved Listings</h1>
            <p className="muted-copy mt-4 text-lg">{pagination.total} listing{pagination.total !== 1 ? 's' : ''} saved for later review.</p>
          </div>

          {bookmarks.length === 0 ? (
            <div className="surface-panel p-16 text-center">
              <p className="text-xl font-black text-slate-950 dark:text-white">No bookmarks yet</p>
              <p className="mt-2 text-slate-400 dark:text-slate-500">Browse listings and save items you want to revisit.</p>
              <Link href="/listings" className="btn-primary mt-6">Browse Listings</Link>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark._id} className="group relative">
                    <ListingCard id={bookmark.listing._id} title={bookmark.listing.title} price={bookmark.listing.price} category={bookmark.listing.category} condition={bookmark.listing.condition} image={bookmark.listing.images?.[0]} campus={bookmark.listing.campus} />
                    <button onClick={async () => { await fetch(`/api/bookmarks/${bookmark._id}`, { method: 'DELETE' }); fetchBookmarks(pagination.page); }} className="absolute right-3 top-3 rounded-lg bg-rose-600 px-2 py-1 text-xs font-black text-white opacity-0 transition-opacity hover:bg-rose-700 group-hover:opacity-100">
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="surface-panel flex items-center justify-between p-5">
                  <button onClick={() => fetchBookmarks(pagination.page - 1)} disabled={pagination.page === 1} className="btn-secondary disabled:translate-y-0">Previous</button>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Page {pagination.page} of {pagination.pages}</span>
                  <button onClick={() => fetchBookmarks(pagination.page + 1)} disabled={pagination.page === pagination.pages} className="btn-secondary disabled:translate-y-0">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

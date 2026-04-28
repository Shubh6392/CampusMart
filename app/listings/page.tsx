'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import ListingCard from '@/components/listing/listing-card';
import ListingFilters from '@/components/listing/listing-filters';

interface ListingItem {
  _id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  campus: string;
  isDemo?: boolean;
}

export default function ListingsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    params.set('page', page.toString());
    params.set('limit', '12');
    return params.toString();
  }, [search, category, page]);

  useEffect(() => {
    async function fetchListings() {
      setIsLoading(true);
      const res = await fetch(`/api/listings?${query}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
      }
      setIsLoading(false);
    }
    fetchListings();
  }, [query]);

  return (
    <div className="app-shell">
      <Header />
      <main className="py-10 sm:py-16">
        <div className="app-container space-y-10">
          <div className="surface-panel overflow-hidden">
            <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-4">
                <p className="eyebrow">Marketplace</p>
                <h1 className="section-title">Find Campus Deals</h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                  Discover verified listings with clear pricing, live bids, and direct seller messaging.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/listings/new" className="btn-primary">Post a Listing</Link>
                <Link href="/" className="btn-secondary">Back Home</Link>
              </div>
            </div>
          </div>

          <div className="surface-panel p-5 sm:p-6">
            <ListingFilters search={search} onSearchChange={setSearch} category={category} onCategoryChange={setCategory} />
          </div>

          {listings.some((l) => l.isDemo) && page === 1 && !search && !category && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-300/25 dark:bg-amber-300/10">
              <h3 className="font-black text-slate-950 dark:text-white">Demo inventory is visible</h3>
              <p className="mt-1 text-sm font-medium text-amber-800 dark:text-amber-200">Demo listings help the marketplace feel populated. Post your own item when you are ready for real trading.</p>
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-lg bg-slate-200/80 dark:bg-white/10" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((item) => (
                <ListingCard key={item._id} id={item._id} title={item.title} category={item.category} condition={item.condition} price={item.price} image={item.images?.[0]} campus={item.campus} isDemo={item.isDemo} />
              ))}
            </div>
          ) : (
            <div className="surface-panel p-14 text-center">
              <p className="text-xl font-black text-slate-950 dark:text-white">No listings found</p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Try a broader search or clear the category filter.</p>
            </div>
          )}

          <div className="surface-panel flex items-center justify-between p-4 sm:p-5">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(p - 1, 1))} className="btn-secondary disabled:translate-y-0">
              Previous
            </button>
            <span className="text-sm font-black text-slate-700 dark:text-white">Page <span className="text-teal-700 dark:text-teal-300">{page}</span></span>
            <button onClick={() => setPage((p) => p + 1)} className="btn-secondary">
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

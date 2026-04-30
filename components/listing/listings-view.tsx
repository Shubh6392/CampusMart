'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

interface ListingsViewProps {
  initialSearch?: string;
  initialCategory?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
}

export default function ListingsView({
  initialSearch = '',
  initialCategory = '',
  initialMinPrice = '',
  initialMaxPrice = ''
}: ListingsViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('page', page.toString());
    params.set('limit', '12');
    return params.toString();
  }, [search, category, minPrice, maxPrice, page]);

  const hasActiveFilters = Boolean(search.trim() || category || minPrice || maxPrice);
  const totalPages = Math.max(Math.ceil(total / 12), 1);
  const firstResult = total === 0 ? 0 : (page - 1) * 12 + 1;
  const lastResult = Math.min(page * 12, total);
  const selectedCategory = category.replace(/-/g, ' ');

  useEffect(() => {
    let ignore = false;

    async function fetchListings() {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/listings?${query}`);
        if (!res.ok) {
          throw new Error('Unable to load listings right now.');
        }
        const data = await res.json();
        if (!ignore) {
          setListings(data.listings || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        if (!ignore) {
          setListings([]);
          setTotal(0);
          setError(err instanceof Error ? err.message : 'Unable to load listings right now.');
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    fetchListings();

    return () => {
      ignore = true;
    };
  }, [query, reloadKey]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value);
    setPage(1);
  };

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value);
    setPage(1);
  };

  const handleFilterSubmit = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    router.replace(params.toString() ? `/listings?${params.toString()}` : '/listings');
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    router.replace('/listings');
  };

  const activeFilterText = [
    search.trim() ? `"${search.trim()}"` : '',
    category ? selectedCategory : '',
    minPrice ? `from ₹${minPrice}` : '',
    maxPrice ? `under ₹${maxPrice}` : ''
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="app-shell">
      <Header />
      <main className="py-8 sm:py-12">
        <div className="app-container space-y-8">
          <section className="surface-panel overflow-hidden">
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-4">
                <p className="eyebrow">Marketplace</p>
                <h1 className="section-title">Find Campus Deals</h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                  Discover approved campus listings with clear pricing, direct seller messaging, and faster filtering for serious buyers.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/listings/new" className="btn-primary">Post a Listing</Link>
                <Link href="/" className="btn-secondary">Back Home</Link>
              </div>
            </div>
            <div className="grid border-t border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-3">
              <div className="border-b border-slate-200/80 p-5 dark:border-white/10 sm:border-b-0 sm:border-r">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Available inventory</p>
                <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{total}</p>
              </div>
              <div className="border-b border-slate-200/80 p-5 dark:border-white/10 sm:border-b-0 sm:border-r">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Current page</p>
                <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{page} of {totalPages}</p>
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Buyer confidence</p>
                <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Approved</p>
              </div>
            </div>
          </section>

          <div className="surface-panel p-5 sm:p-6">
            <ListingFilters
              search={search}
              onSearchChange={handleSearchChange}
              category={category}
              onCategoryChange={handleCategoryChange}
              minPrice={minPrice}
              onMinPriceChange={handleMinPriceChange}
              maxPrice={maxPrice}
              onMaxPriceChange={handleMaxPriceChange}
              onSubmit={handleFilterSubmit}
              onClear={handleClearFilters}
            />
            {hasActiveFilters && (
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4 text-sm dark:border-white/10">
                <span className="font-bold text-slate-600 dark:text-slate-300">Active filters:</span>
                {search.trim() && <span className="status-pill">Search: {search.trim()}</span>}
                {category && <span className="status-pill capitalize">Category: {selectedCategory}</span>}
                {minPrice && <span className="status-pill">Min: ₹{minPrice}</span>}
                {maxPrice && <span className="status-pill">Max: ₹{maxPrice}</span>}
              </div>
            )}
          </div>

          {listings.some((l) => l.isDemo) && page === 1 && !hasActiveFilters && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-300/25 dark:bg-amber-300/10">
              <h3 className="font-black text-slate-950 dark:text-white">Demo inventory is visible</h3>
              <p className="mt-1 text-sm font-medium text-amber-800 dark:text-amber-200">Demo listings help the marketplace feel populated. Post your own item when you are ready for real trading.</p>
            </div>
          )}

          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Listings</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Marketplace inventory</h2>
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {isLoading ? 'Refreshing results...' : total > 0 ? `Showing ${firstResult}-${lastResult} of ${total}` : 'No results to display'}
            </p>
          </div>

          {error ? (
            <div className="surface-panel p-10 text-center">
              <p className="text-xl font-black text-slate-950 dark:text-white">Listings could not be loaded</p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">{error}</p>
              <button onClick={() => setReloadKey((key) => key + 1)} className="btn-primary mt-6">Try again</button>
            </div>
          ) : isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[410px] animate-pulse rounded-lg border border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/10" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {listings.map((item) => (
                <ListingCard key={item._id} id={item._id} title={item.title} category={item.category} condition={item.condition} price={item.price} image={item.images?.[0]} campus={item.campus} isDemo={item.isDemo} />
              ))}
            </div>
          ) : (
            <div className="surface-panel p-14 text-center">
              <p className="text-xl font-black text-slate-950 dark:text-white">
                {activeFilterText ? `No listings found for ${activeFilterText}` : 'No listings found'}
              </p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Try a broader search or clear the filters.</p>
              {hasActiveFilters && <button onClick={handleClearFilters} className="btn-primary mt-6">Clear filters</button>}
            </div>
          )}

          <div className="surface-panel flex items-center justify-between gap-4 p-4 sm:p-5">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(p - 1, 1))} className="btn-secondary disabled:translate-y-0">
              Previous
            </button>
            <span className="text-sm font-black text-slate-700 dark:text-white">Page <span className="text-teal-700 dark:text-teal-300">{page}</span></span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-secondary disabled:translate-y-0 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

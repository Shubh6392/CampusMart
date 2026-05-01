'use client';

import { useEffect, useMemo, useState } from 'react';
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
  initialCondition?: string;
  initialMinPrice?: string;
  initialMaxPrice?: string;
  initialSort?: string;
}

export default function ListingsView({
  initialSearch = '',
  initialCategory = '',
  initialCondition = '',
  initialMinPrice = '',
  initialMaxPrice = '',
  initialSort = 'newest'
}: ListingsViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [condition, setCondition] = useState(initialCondition);
  const [minPrice, setMinPrice] = useState(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [sort, setSort] = useState(initialSort);
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
    if (condition) params.set('condition', condition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('sort', sort);
    params.set('page', page.toString());
    params.set('limit', '12');
    return params.toString();
  }, [search, category, condition, minPrice, maxPrice, sort, page]);

  const hasActiveFilters = Boolean(search.trim() || category || condition || minPrice || maxPrice);
  const totalPages = Math.max(Math.ceil(total / 12), 1);
  const firstResult = total === 0 ? 0 : (page - 1) * 12 + 1;
  const lastResult = Math.min(page * 12, total);
  const selectedCategory = category.replace(/-/g, ' ');
  const selectedCondition = condition.replace(/-/g, ' ');
  const filterChipClass = 'inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300';
  const quickFilters = [
    { label: 'Electronics', value: 'electronics' },
    { label: 'Books', value: 'books' },
    { label: 'Hostel needs', value: 'hostel-needs' },
    { label: 'Furniture', value: 'furniture' },
    { label: 'Study essentials', value: 'study-essentials' }
  ];
  const visiblePages = useMemo(() => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    const length = Math.min(totalPages, 5);
    return Array.from({ length }, (_, index) => start + index);
  }, [page, totalPages]);

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

  const handleConditionChange = (value: string) => {
    setCondition(value);
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
    if (condition) params.set('condition', condition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sort !== 'newest') params.set('sort', sort);
    router.replace(params.toString() ? `/listings?${params.toString()}` : '/listings');
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
    router.replace('/listings');
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (category) params.set('category', category);
    if (condition) params.set('condition', condition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (value !== 'newest') params.set('sort', value);
    router.replace(params.toString() ? `/listings?${params.toString()}` : '/listings');
  };

  const handleQuickCategory = (value: string) => {
    const nextCategory = category === value ? '' : value;
    setCategory(nextCategory);
    setPage(1);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (nextCategory) params.set('category', nextCategory);
    if (condition) params.set('condition', condition);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sort !== 'newest') params.set('sort', sort);
    router.replace(params.toString() ? `/listings?${params.toString()}` : '/listings');
  };

  const activeFilterText = [
    search.trim() ? `"${search.trim()}"` : '',
    category ? selectedCategory : '',
    condition ? selectedCondition : '',
    minPrice ? `from Rs ${minPrice}` : '',
    maxPrice ? `under Rs ${maxPrice}` : ''
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="app-shell">
      <Header />
      <main className="py-6 sm:py-8">
        <div className="app-container space-y-8">
          <section className="surface-panel overflow-hidden">
            <div className="p-5 sm:p-6">
              <div>
                <p className="eyebrow">Marketplace</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">Find Campus Deals</h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200/80 bg-slate-50/80 px-5 py-3 text-sm font-bold text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 sm:px-6">
              <span><span className="text-slate-950 dark:text-white">{total}</span> items</span>
              <span>Page <span className="text-slate-950 dark:text-white">{page}/{totalPages}</span></span>
              <span>Approved</span>
            </div>
          </section>

          <div className="sticky top-[92px] z-30 rounded-lg border border-slate-200/60 bg-white/90 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/85 dark:shadow-[0_12px_30px_rgba(0,0,0,0.28)] lg:top-[74px]">
            <ListingFilters
              search={search}
              onSearchChange={handleSearchChange}
              category={category}
              onCategoryChange={handleCategoryChange}
              condition={condition}
              onConditionChange={handleConditionChange}
              minPrice={minPrice}
              onMinPriceChange={handleMinPriceChange}
              maxPrice={maxPrice}
              onMaxPriceChange={handleMaxPriceChange}
              onSubmit={handleFilterSubmit}
              onClear={handleClearFilters}
            />
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200/70 pt-4 dark:border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Quick filters</span>
              {quickFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => handleQuickCategory(filter.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03] ${
                    category === filter.value
                      ? 'border-teal-300 bg-teal-50 text-teal-700 shadow-[0_0_0_1px_rgba(20,184,166,0.18),0_12px_28px_rgba(20,184,166,0.24)] dark:border-teal-300/40 dark:bg-teal-300/10 dark:text-teal-200 dark:shadow-[0_0_0_1px_rgba(94,234,212,0.16),0_12px_30px_rgba(45,212,191,0.16)]'
                      : 'border-slate-200/80 bg-white/70 text-slate-500 shadow-sm hover:border-teal-200 hover:text-slate-800 hover:shadow-[0_10px_24px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-white dark:hover:shadow-[0_10px_24px_rgba(0,0,0,0.24)]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3 text-sm dark:border-white/10">
                <span className="font-bold text-slate-600 dark:text-slate-300">Active filters:</span>
                {search.trim() && <span className={filterChipClass}>Search: {search.trim()}</span>}
                {category && <span className={`${filterChipClass} capitalize`}>Category: {selectedCategory}</span>}
                {condition && <span className={`${filterChipClass} capitalize`}>Condition: {selectedCondition}</span>}
                {minPrice && <span className={filterChipClass}>Min: Rs {minPrice}</span>}
                {maxPrice && <span className={filterChipClass}>Max: Rs {maxPrice}</span>}
              </div>
            )}
          </div>

          <section className="relative overflow-hidden rounded-lg border border-slate-200/80 bg-[linear-gradient(135deg,rgba(240,253,250,0.7),rgba(255,255,255,0.92)_44%,rgba(240,249,255,0.72))] px-4 py-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(20,184,166,0.10),rgba(15,23,42,0.70)_46%,rgba(14,165,233,0.08))] sm:px-6">
          <div className="pointer-events-none absolute left-8 top-0 h-px w-48 bg-gradient-to-r from-teal-400/70 to-transparent" />
          <div className="pointer-events-none absolute right-6 top-6 h-24 w-24 rounded-full bg-teal-300/10 blur-2xl dark:bg-teal-300/12" />
          <div className="relative flex flex-col gap-4 border-b border-slate-200/80 pb-5 dark:border-white/10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Listings</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Marketplace <span className="text-teal-700 drop-shadow-[0_0_18px_rgba(20,184,166,0.20)] dark:text-teal-300">inventory</span>
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <p className="pb-3 text-sm font-bold text-slate-500 dark:text-slate-400 sm:pb-0">
                {isLoading ? 'Refreshing results...' : total > 0 ? `Showing ${firstResult}-${lastResult} of ${total}` : 'No results to display'}
              </p>
              <label className="block min-w-[210px]">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Sort by</span>
                <select value={sort} onChange={(event) => handleSortChange(event.target.value)} className="field-control mt-1 h-9 border-slate-200/70 px-3 py-1.5 bg-white dark:border-white/10 dark:bg-neutral-950/60">
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price Low to High</option>
                  <option value="price-desc">Price High to Low</option>
                </select>
              </label>
            </div>
          </div>

          {error ? (
            <div className="surface-panel mt-8 p-10 text-center">
              <p className="text-xl font-black text-slate-950 dark:text-white">Listings could not be loaded</p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">{error}</p>
              <button onClick={() => setReloadKey((key) => key + 1)} className="btn-primary mt-6">Try again</button>
            </div>
          ) : isLoading ? (
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[420px] overflow-hidden rounded-lg border border-slate-200 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/10">
                  <div className="h-56 animate-pulse bg-slate-200 dark:bg-white/10" />
                  <div className="space-y-4 p-5">
                    <div className="flex gap-2">
                      <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                      <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-white/10" />
                    </div>
                    <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
                    <div className="h-5 w-3/5 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
                    <div className="pt-10">
                      <div className="h-8 w-28 animate-pulse rounded bg-slate-200 dark:bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {listings.map((item) => (
                <ListingCard key={item._id} id={item._id} title={item.title} category={item.category} condition={item.condition} price={item.price} image={item.images?.[0]} campus={item.campus} isDemo={item.isDemo} />
              ))}
            </div>
          ) : (
            <div className="surface-panel mt-8 p-14 text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-xl font-black text-slate-400 dark:border-white/10 dark:bg-white/[0.04]">0</div>
              <p className="text-xl font-black text-slate-950 dark:text-white">
                {activeFilterText ? `No items found for ${activeFilterText}` : 'No items found'}
              </p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Try adjusting filters or using a broader search.</p>
              {hasActiveFilters && <button onClick={handleClearFilters} className="btn-primary mt-6">Clear filters</button>}
            </div>
          )}
          </section>

          <div className="surface-panel flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {total > 0 ? `Showing ${firstResult}-${lastResult} of ${total}` : 'No listings'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => Math.max(p - 1, 1))} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-45 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                &lt;&lt;
              </button>
              {visiblePages.map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`h-12 min-w-12 rounded-lg px-4 text-sm font-black transition hover:-translate-y-0.5 hover:shadow-md ${
                    pageNumber === page
                      ? 'scale-105 bg-teal-500 text-white shadow-[0_0_0_1px_rgba(20,184,166,0.20),0_16px_34px_rgba(20,184,166,0.36)] dark:text-slate-950'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300'
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button aria-label="Next page" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(p + 1, totalPages))} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-45 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

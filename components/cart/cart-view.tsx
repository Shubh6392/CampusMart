'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/header';
import ListingCard from '@/components/listing/listing-card';
import { formatCurrency } from '@/lib/currency';

const CART_STORAGE_KEY = 'campusmart_cart_items';

interface CartListing {
  _id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  condition: string;
  campus: string;
}

function readCartItems() {
  if (typeof window === 'undefined') return [];
  try {
    const value = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeCartItems(items: string[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(Array.from(new Set(items))));
  window.dispatchEvent(new Event('campusmart-cart-updated'));
}

export default function CartView() {
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [items, setItems] = useState<CartListing[]>([]);
  const [loading, setLoading] = useState(true);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items]);

  const refreshCart = useCallback(async () => {
    const ids = readCartItems();
    setCartIds(ids);

    if (ids.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/listings?ids=${ids.join(',')}&limit=${ids.length}`);
      if (!res.ok) throw new Error('Failed to load cart');
      const data = await res.json();
      const listings = Array.isArray(data.listings) ? data.listings : [];
      const ordered = ids
        .map((id) => listings.find((listing: CartListing) => listing._id === id))
        .filter(Boolean);
      setItems(ordered);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();

    const onStorage = () => refreshCart();
    window.addEventListener('storage', onStorage);
    window.addEventListener('campusmart-cart-updated', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('campusmart-cart-updated', onStorage);
    };
  }, [refreshCart]);

  const removeItem = (listingId: string) => {
    const nextItems = cartIds.filter((id) => id !== listingId);
    writeCartItems(nextItems);
    setCartIds(nextItems);
    setItems((current) => current.filter((item) => item._id !== listingId));
  };

  const clearCart = () => {
    writeCartItems([]);
    setCartIds([]);
    setItems([]);
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="py-10 sm:py-16">
        <div className="app-container space-y-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Cart</p>
              <h1 className="section-title mt-3">Your Cart</h1>
              <p className="muted-copy mt-4 max-w-2xl text-lg">Review items you are interested in before contacting sellers or placing bids.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
              <div className="rounded-lg border border-slate-200 bg-white/85 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Items</p>
                <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">{items.length}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white/85 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Total</p>
                <p className="mt-1 truncate text-2xl font-black text-teal-700 dark:text-teal-300">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-72 animate-pulse rounded-lg bg-slate-200/80 dark:bg-white/10" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="surface-panel p-12 text-center sm:p-16">
              <p className="text-xl font-black text-slate-950 dark:text-white">Your cart is empty</p>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Add items from listing pages and they will appear here.</p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/listings" className="btn-primary">Browse Listings</Link>
                <Link href="/bookmarks" className="btn-secondary">View Saved Items</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{items.length} item{items.length !== 1 ? 's' : ''} ready for review.</p>
                <button type="button" onClick={clearCart} className="btn-secondary px-4 py-2.5">Clear Cart</button>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <div key={item._id} className="group relative">
                    <ListingCard id={item._id} title={item.title} price={item.price} category={item.category} condition={item.condition} image={item.images?.[0]} campus={item.campus} />
                    <button
                      type="button"
                      onClick={() => removeItem(item._id)}
                      className="absolute right-3 top-3 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-black text-white opacity-0 shadow-sm transition-opacity hover:bg-rose-700 group-hover:opacity-100 dark:bg-white dark:text-slate-950 dark:hover:bg-rose-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

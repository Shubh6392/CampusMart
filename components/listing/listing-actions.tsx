'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const CART_STORAGE_KEY = 'campusmart_cart_items';

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

export default function ListingActions({ listingId, isOwner }: { listingId: string; isOwner: boolean }) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setInCart(readCartItems().includes(listingId));
  }, [listingId]);

  useEffect(() => {
    if (!session?.user) return;

    const checkBookmark = async () => {
      try {
        const res = await fetch('/api/bookmarks?limit=1000');
        if (!res.ok) return;
        const data = await res.json();
        setFavorited(data.bookmarks?.some((bookmark: any) => bookmark.listing?._id === listingId) || false);
      } catch {}
    };

    checkBookmark();
  }, [session?.user, listingId]);

  const toggleSaved = async () => {
    if (!session?.user) {
      window.location.href = '/auth/signin';
      return;
    }

    setSaving(true);
    try {
      if (favorited) {
        await fetch(`/api/bookmarks/${listingId}`, { method: 'POST' });
        setFavorited(false);
      } else {
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId })
        });
        if (res.ok || res.status === 409) setFavorited(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleCart = () => {
    const items = readCartItems();
    const nextItems = inCart ? items.filter((item) => item !== listingId) : [...items, listingId];
    writeCartItems(nextItems);
    setInCart(!inCart);
  };

  if (isOwner) {
    return (
      <div className="grid gap-3">
        <Link href="/messages" className="btn-primary flex w-full py-4">View Messages from Buyers</Link>
        <Link href="/bookmarks" className="btn-secondary flex w-full py-4">Open Saved Items</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={toggleCart}
          className={inCart ? 'btn-secondary w-full py-4' : 'btn-primary w-full py-4'}
        >
          {inCart ? 'Remove from Cart' : 'Add to Cart'}
        </button>
        <button
          type="button"
          onClick={toggleSaved}
          disabled={saving}
          className="btn-secondary w-full py-4 disabled:translate-y-0"
        >
          {saving ? 'Saving...' : favorited ? 'Saved Item' : 'Save Item'}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/cart" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-teal-300/40 dark:hover:bg-teal-300/10">
          Go to Cart
        </Link>
        <Link href="/bookmarks" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-black text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-teal-300/40 dark:hover:bg-teal-300/10">
          View Saved Items
        </Link>
      </div>
    </div>
  );
}

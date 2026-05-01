'use client';

import { useEffect, useState } from 'react';

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
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    setInCart(readCartItems().includes(listingId));
  }, [listingId]);

  const toggleCart = () => {
    const items = readCartItems();
    const nextItems = inCart ? items.filter((item) => item !== listingId) : [...items, listingId];
    writeCartItems(nextItems);
    setInCart(!inCart);
  };

  if (isOwner) {
    return (
      <div className="grid gap-3">
        <a href="/messages" className="btn-primary flex w-full py-4">View Messages from Buyers</a>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        onClick={toggleCart}
        className="flex min-h-14 w-full items-center justify-center rounded-xl bg-teal-500 px-5 py-4 text-base font-black text-white shadow-[0_16px_34px_rgba(20,184,166,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-400 hover:shadow-[0_20px_42px_rgba(20,184,166,0.34)] focus:outline-none focus:ring-4 focus:ring-teal-500/20 dark:text-slate-950"
      >
        {inCart ? 'Remove from Cart' : 'Add to Cart'}
      </button>
      <a
        href={`/listings/${listingId}/chat`}
        className="flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white/70 px-5 py-3 text-sm font-black text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:border-teal-300/40 dark:hover:bg-teal-300/10"
      >
        Message Seller
      </a>
    </div>
  );
}

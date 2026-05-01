'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import ThemeToggle from '@/components/theme-toggle';
import Image from 'next/image';
import LogoutButton from '@/components/logout-button';
import { useEffect, useState } from 'react';

const CART_STORAGE_KEY = 'campusmart_cart_items';

function readCartCount() {
  if (typeof window === 'undefined') return 0;
  try {
    const value = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export default function Header() {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const isAdmin = (session?.user as any)?.role === 'admin';
  const navLink = 'rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white';
  const userName = session?.user?.name?.trim() || 'My Account';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'A';

  useEffect(() => {
    const updateCartCount = () => setCartCount(readCartCount());
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('campusmart-cart-updated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('campusmart-cart-updated', updateCartCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/75">
      <div className="app-container grid gap-3 py-3 lg:grid-cols-[auto_minmax(360px,1fr)_auto] lg:items-center">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 shadow-lg shadow-teal-700/20 dark:bg-teal-400">
            <span className="text-lg font-black text-white dark:text-slate-950">C</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-black text-slate-950 dark:text-white">CampusMart</span>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-gray-300">Verified campus trade</p>
          </div>
        </Link>

        <form action="/listings" method="get" className="order-3 flex min-h-[48px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition focus-within:border-teal-400 focus-within:ring-4 focus-within:ring-teal-500/10 dark:border-white/10 dark:bg-white/[0.06] lg:order-none">
          <label htmlFor="site-search" className="sr-only">Search CampusMart</label>
          <svg className="h-5 w-5 shrink-0 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            id="site-search"
            name="search"
            type="search"
            placeholder="Search products, categories, or pickup points"
            className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500 sm:text-base"
          />
          <button type="submit" className="hidden rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-teal-400 dark:text-slate-950 sm:inline-flex">
            Search
          </button>
        </form>

        <nav className="flex items-center justify-end gap-1 sm:gap-2">
          {session?.user ? (
            <>
              <Link href="/listings" className={`${navLink} hidden sm:inline-flex`}>Browse</Link>
              <Link href="/messages" className={`${navLink} hidden md:inline-flex`}>Messages</Link>
              <Link href="/bookmarks" className={`${navLink} hidden sm:inline-flex`}>Saved</Link>
              <Link href="/listings/new" className="hidden rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-[0_12px_30px_rgba(20,184,166,0.20)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-teal-400 dark:text-slate-950 sm:inline-flex">
                Sell Item
              </Link>
              <Link href="/cart" className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Open cart" title="Cart">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-700 px-1 text-[10px] font-black text-white shadow-sm dark:bg-teal-300 dark:text-slate-950">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <Link href="/notifications" className={`${navLink} hidden lg:inline-flex`}>Alerts</Link>
              <Link href="/profile" className="account-pill group" aria-label="Open profile" title="My account">
                <span className="account-pill-avatar">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={userName}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </span>
              </Link>
              {isAdmin && (
                <Link href="/dashboard/admin" className="rounded-lg border border-amber-300/80 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 transition-colors hover:bg-amber-100 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-200">Admin</Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/listings" className={`${navLink} hidden sm:inline-flex`}>Browse</Link>
              <Link href="/listings/new" className="hidden rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-[0_12px_30px_rgba(20,184,166,0.20)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-teal-400 dark:text-slate-950 md:inline-flex">
                Sell Item
              </Link>
              <Link href="/cart" className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white" aria-label="Open cart" title="Cart">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-700 px-1 text-[10px] font-black text-white shadow-sm dark:bg-teal-300 dark:text-slate-950">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <Link href="/auth/signin" className="btn-secondary px-4 py-2">Sign In</Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

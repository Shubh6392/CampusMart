'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import ThemeToggle from '@/components/theme-toggle';
import Image from 'next/image';
import LogoutButton from '@/components/logout-button';

export default function Header() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'admin';
  const navLink = 'rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-teal-50 hover:text-teal-800 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white';
  const userName = session?.user?.name?.trim() || 'My Account';
  const firstName = userName.split(' ')[0] || 'Account';
  const userRole = (session?.user as any)?.role || 'member';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'A';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-950/75">
      <div className="app-container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 shadow-lg shadow-teal-700/20 dark:bg-teal-400">
            <span className="text-lg font-black text-white dark:text-slate-950">C</span>
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-black text-slate-950 dark:text-white">CampusMart</span>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Verified campus trade</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {session?.user ? (
            <>
              <Link href="/listings" className={navLink}>Browse</Link>
              <Link href="/messages" className={navLink}>Messages</Link>
              <Link href="/bookmarks" className={`${navLink} hidden sm:inline-flex`}>Saved</Link>
              <Link href="/notifications" className={`${navLink} hidden md:inline-flex`}>Alerts</Link>
              <Link href="/profile" className="account-pill group">
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
                <span className="hidden min-w-0 text-left sm:flex sm:flex-col">
                  <span className="truncate text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 transition-colors group-hover:text-teal-600 dark:text-slate-500 dark:group-hover:text-teal-300">
                    My account
                  </span>
                  <span className="truncate text-sm font-black text-slate-900 transition-colors group-hover:text-teal-800 dark:text-white dark:group-hover:text-teal-200">
                    {firstName}
                  </span>
                </span>
                <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 transition-colors group-hover:bg-teal-50 group-hover:text-teal-700 dark:bg-white/10 dark:text-slate-300 dark:group-hover:bg-teal-400/10 dark:group-hover:text-teal-200 lg:inline-flex">
                  {userRole}
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
              <Link href="/auth/signin" className="btn-primary px-4 py-2">Sign In</Link>
            </>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

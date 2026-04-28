'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-200 dark:hover:bg-rose-300/15"
    >
      Logout
    </button>
  );
}

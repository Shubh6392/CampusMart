'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function FavoriteButton({ listingId, initialFavorited = false }: { listingId: string; initialFavorited?: boolean }) {
  const { data: session } = useSession();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    const check = async () => {
      try {
        const res = await fetch('/api/bookmarks?limit=1000');
        if (!res.ok) return;
        const data = await res.json();
        setFavorited(data.bookmarks?.some((b: any) => b.listing._id === listingId) || false);
      } catch {}
    };
    check();
  }, [session?.user, listingId]);

  const handleToggle = async () => {
    if (!session?.user) { window.location.href = '/auth/signin'; return; }
    setLoading(true);
    try {
      if (favorited) {
        await fetch(`/api/bookmarks/${listingId}`, { method: 'POST' });
        setFavorited(false);
      } else {
        const res = await fetch('/api/bookmarks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listingId }) });
        if (res.status === 409 || res.ok) setFavorited(true);
      }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <button onClick={handleToggle} disabled={loading}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors disabled:opacity-50 ${
        favorited
          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-500/30'
          : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
      }`}
    >
      {favorited ? (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M10 1.5l2.5 5h5.46l-4.43 3.22 1.7 5.22L10 12.26l-4.27 3.12 1.7-5.22L2.04 6.5H7.5L10 1.5z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 20 20" strokeWidth={1.5}>
          <path d="M10 1.5l2.5 5h5.46l-4.43 3.22 1.7 5.22L10 12.26l-4.27 3.12 1.7-5.22L2.04 6.5H7.5L10 1.5z" />
        </svg>
      )}
    </button>
  );
}

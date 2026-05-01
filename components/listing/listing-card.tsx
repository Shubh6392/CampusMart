import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/currency';
import FavoriteButton from '@/components/bookmarks/favorite-button';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  image?: string;
  campus: string;
  isDemo?: boolean;
}

export default function ListingCard({ id, title, price, category, condition, image, campus, isDemo }: ListingCardProps) {
  const location = campus?.trim().toLowerCase() === 'campus pickup' ? '' : campus;
  const fallbackImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80';
  const imageSrc = image || fallbackImage;
  const card = (
    <div className="group relative flex h-full min-h-[420px] cursor-pointer overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-white/[0.06] dark:hover:shadow-[0_24px_58px_rgba(0,0,0,0.36)]">
      {!isDemo && <Link href={`/listings/${id}`} className="absolute inset-0 z-10" aria-label={`View ${title}`} />}
      {!isDemo && (
        <div className="pointer-events-none absolute right-3 top-3 z-20 flex translate-y-1 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Link href={`/listings/${id}`} className="pointer-events-auto rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-lg transition hover:bg-teal-500 hover:text-white dark:bg-neutral-950/90 dark:text-slate-200">
            View
          </Link>
          <div className="pointer-events-auto rounded-full bg-white/95 p-0.5 shadow-lg dark:bg-neutral-950/90">
            <FavoriteButton listingId={id} />
          </div>
          <Link href={`/listings/${id}/chat`} className="pointer-events-auto rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-lg transition hover:bg-teal-500 hover:text-white dark:bg-neutral-950/90 dark:text-slate-200">
            Chat
          </Link>
        </div>
      )}
      <div className="flex w-full flex-col">
      <div className="relative h-56 w-full shrink-0 overflow-hidden bg-slate-100 dark:bg-neutral-800">
        <Image src={imageSrc} alt={image ? title : 'Campus marketplace item'} fill className="object-cover brightness-[0.92] saturate-[0.95] transition duration-500 ease-out group-hover:scale-[1.03] group-hover:brightness-100 group-hover:saturate-100" loading="lazy" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.4),transparent)]" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex min-h-[30px] flex-wrap items-start gap-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 capitalize dark:border-white/10 dark:bg-white/[0.04]">{category}</span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 capitalize dark:border-white/10 dark:bg-white/[0.03]">{condition}</span>
        </div>
        <h2 className="mt-4 line-clamp-2 min-h-[3.25rem] text-lg font-semibold leading-7 text-slate-950 dark:text-white">{title}</h2>
        <div className="mt-auto space-y-3 border-t border-slate-100 pt-4 dark:border-white/10">
          <div className="flex min-h-[36px] items-end justify-between gap-3">
            <span className="block text-xl font-bold text-teal-400">{formatCurrency(price)}</span>
            <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-black text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-200">Verified</span>
          </div>
          {location && <span className="block truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{location}</span>}
        </div>
      </div>
      </div>
    </div>
  );

  return card;
}

import Link from 'next/link';
import Image from 'next/image';
import { formatCurrency } from '@/lib/currency';

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
  const card = (
    <div className={`group elevated-card flex h-full overflow-hidden transition-all duration-300 ease-out ${isDemo ? 'cursor-default' : 'elevated-card-hover cursor-pointer'}`}>
      <div className="flex w-full flex-col">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-neutral-800">
        {image ? (
          <Image src={image} alt={title} fill className="object-cover transition-transform duration-500 ease-out group-hover:scale-110" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-gray-300">
            Image pending
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/35 to-transparent opacity-70" />
        {isDemo && <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 shadow-sm dark:bg-amber-300/20 dark:text-amber-200">Demo</span>}
      </div>
      <div className="flex flex-1 flex-col space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="status-pill capitalize">{category}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-white/10 dark:text-gray-300 capitalize">{condition}</span>
        </div>
        <h2 className="line-clamp-2 min-h-[3.5rem] text-lg font-black leading-7 text-slate-950 dark:text-white">{title}</h2>
        <div className="mt-auto border-t border-slate-100 pt-4 dark:border-white/10">
          <div className="flex items-end justify-between gap-3">
          <span className="text-2xl font-black text-teal-700 dark:text-teal-300">{formatCurrency(price)}</span>
          <span className="max-w-[45%] truncate text-xs font-semibold text-slate-500 dark:text-gray-300">{campus}</span>
          </div>
          {!isDemo && (
            <div className="mt-4 flex items-center justify-between text-xs font-black uppercase tracking-[0.14em] text-gray-300">
              <span>Verified listing</span>
              <span className="text-teal-700 transition group-hover:translate-x-1 dark:text-teal-300">View</span>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );

  return isDemo ? card : <Link href={`/listings/${id}`}>{card}</Link>;
}

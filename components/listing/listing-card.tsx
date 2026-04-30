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
    <div className={`group elevated-card overflow-hidden ${isDemo ? 'cursor-default' : 'elevated-card-hover cursor-pointer'}`}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-neutral-800">
        {image ? (
          <Image src={image} alt={title} fill className="object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400 dark:text-slate-500">
            Image pending
          </div>
        )}
        {isDemo && <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800 dark:bg-amber-300/20 dark:text-amber-200">Demo</span>}
      </div>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="status-pill capitalize">{category}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-white/10 dark:text-slate-300 capitalize">{condition}</span>
        </div>
        <h2 className="line-clamp-2 min-h-[3.5rem] text-lg font-black leading-7 text-slate-950 dark:text-white">{title}</h2>
        <div className="flex items-end justify-between gap-3">
          <span className="text-2xl font-black text-teal-700 dark:text-teal-300">{formatCurrency(price)}</span>
          <span className="max-w-[45%] truncate text-xs font-semibold text-slate-500 dark:text-slate-400">{campus}</span>
        </div>
      </div>
    </div>
  );

  return isDemo ? card : <Link href={`/listings/${id}`}>{card}</Link>;
}

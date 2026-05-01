import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Listing from '@/models/Listing';
import BiddingWidget from '@/components/listing/bidding-widget';
import SellerBidsPanel from '@/components/listing/seller-bids-panel';
import ListingActions from '@/components/listing/listing-actions';
import Header from '@/components/header';
import Image from 'next/image';
import { formatCurrency } from '@/lib/currency';
import FavoriteButton from '@/components/bookmarks/favorite-button';

function formatPostedTime(value?: Date | string) {
  if (!value) return 'Recently posted';
  const created = new Date(value);
  const diffMs = Date.now() - created.getTime();
  const days = Math.max(Math.floor(diffMs / 86400000), 0);
  if (days === 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  return `Posted ${days} days ago`;
}

function formatUpdatedTime(value?: Date | string) {
  if (!value) return 'Recently updated';
  const updated = new Date(value);
  const diffMs = Date.now() - updated.getTime();
  const days = Math.max(Math.floor(diffMs / 86400000), 0);
  if (days === 0) return 'Last updated today';
  if (days === 1) return 'Last updated yesterday';
  return `Last updated ${days} days ago`;
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  await connectToDatabase();
  const listing = await Listing.findById(params.id).populate('seller', 'name email').lean() as any;
  if (!listing || listing.status !== 'approved') notFound();

  const primaryImage = listing.images?.[0];
  const allImages = listing.images?.length ? listing.images.slice(0, 4) : [];
  const thumbnailImages = allImages.length > 1 ? allImages : primaryImage ? [primaryImage, primaryImage, primaryImage, primaryImage] : [];
  const isOwner = session?.user?.id === listing.seller._id.toString();
  const descriptionPoints = String(listing.description || '')
    .split(/\n+|(?<=\.)\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="app-shell">
      <Header />
      <main className="py-10 sm:py-16">
        <div className="app-container space-y-8">
          <Link href="/listings" className="inline-flex items-center gap-2 text-sm font-bold text-teal-700/75 transition hover:text-teal-900 hover:underline hover:underline-offset-4 dark:text-teal-300/75 dark:hover:text-teal-200">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Listings
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
            <div className="space-y-4">
              {primaryImage ? (
                <div className="group relative min-h-[420px] overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-lg transition-all duration-300 hover:shadow-[0_28px_80px_rgba(15,118,110,0.18)] dark:border-white/10 dark:bg-white/5 dark:hover:shadow-[0_28px_80px_rgba(20,184,166,0.14)] lg:min-h-[620px]">
                  <Image src={primaryImage} alt={listing.title} fill sizes="(max-width: 768px) 100vw, 58vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.32),transparent_42%)]" />
                  <a
                    href={primaryImage}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open preview"
                    title="Open preview"
                    className="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-[0_16px_34px_rgba(15,23,42,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-teal-50 hover:text-teal-700 hover:shadow-[0_18px_42px_rgba(20,184,166,0.24)] dark:bg-neutral-950/90 dark:text-white dark:hover:bg-teal-300/15 dark:hover:text-teal-200"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4.2-4.2" />
                      <path d="M11 8v6" />
                      <path d="M8 11h6" />
                    </svg>
                  </a>
                </div>
              ) : (
                <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-slate-200 bg-[linear-gradient(135deg,#e2e8f0,#f8fafc_48%,#ccfbf1)] font-semibold text-slate-400 dark:border-white/10 dark:bg-[linear-gradient(135deg,#1f2937,#0f172a_52%,#134e4a)]">
                  Image pending
                </div>
              )}
              {thumbnailImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {thumbnailImages.map((image: string, index: number) => (
                    <a key={`${image}-${index}`} href={image} target="_blank" rel="noreferrer" className={`relative aspect-video overflow-hidden rounded-lg border bg-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:border-teal-300 hover:shadow-[0_14px_34px_rgba(15,118,110,0.14)] dark:bg-white/5 ${index === 0 ? 'border-teal-400 ring-2 ring-teal-400/20' : 'border-slate-200 dark:border-white/10'}`}>
                      <Image src={image} alt={`${listing.title} ${index + 1}`} fill sizes="(max-width: 768px) 25vw, 12vw" className="object-cover transition-transform duration-500 hover:scale-105" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col rounded-lg bg-white/88 p-6 shadow-[0_14px_42px_rgba(15,23,42,0.055)] backdrop-blur transition-all duration-300 dark:bg-white/[0.055] dark:shadow-[0_14px_42px_rgba(0,0,0,0.16)] sm:p-8 lg:sticky lg:top-[100px]">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <p className="eyebrow">{listing.category}</p>
                  <div className="flex flex-wrap gap-2 text-xs font-black text-slate-600 dark:text-slate-300">
                    <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">Popular item</span>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-sky-700 dark:bg-sky-400/10 dark:text-sky-200">12 people viewing</span>
                  </div>
                </div>
                {!isOwner && <FavoriteButton listingId={listing._id.toString()} />}
              </div>
              <h1 className="mt-6 text-3xl font-bold leading-tight text-slate-950 dark:text-white sm:text-4xl">{listing.title}</h1>
              <p className="price-live mt-4 text-6xl font-black tracking-[0.015em] text-teal-600 dark:text-teal-300 sm:text-7xl">{formatCurrency(listing.price)}</p>

              <div className="mt-8 flex flex-wrap gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 capitalize dark:border-white/10 dark:bg-white/[0.04]">{listing.condition}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-white/10 dark:bg-white/[0.04]">{listing.campus}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 dark:border-white/10 dark:bg-white/[0.04]">{listing.views} views</span>
              </div>

              <div className="my-8 h-px bg-slate-200 dark:bg-white/10" />

              <ListingActions listingId={listing._id.toString()} isOwner={isOwner} />

              <div className="my-8 h-px bg-slate-200 dark:bg-white/10" />

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Seller</p>
                    <p className="mt-2 text-lg font-black text-slate-950 dark:text-white">{listing.seller.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{listing.seller.email}</p>
                  </div>
                  <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-200">Verified</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>4.8 seller rating</span>
                  <span>/</span>
                  <span>{formatPostedTime(listing.createdAt)}</span>
                  <span>/</span>
                  <span>{formatUpdatedTime(listing.updatedAt)}</span>
                  <span>/</span>
                  <span>{listing.campus}</span>
                </div>
                <Link href={`/users/${listing.seller._id.toString()}`} className="inline-flex text-sm font-bold text-teal-700 transition hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200">
                  View seller profile
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
            <div className="surface-panel p-8 transition-all duration-300 hover:shadow-[0_24px_70px_rgba(15,118,110,0.10)] dark:hover:shadow-[0_24px_70px_rgba(20,184,166,0.09)] sm:p-10">
              <div className="max-w-[660px]">
                <p className="eyebrow">Product details</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Highlights</h2>
                <div className="mt-4 grid gap-4 text-sm font-bold text-slate-600 dark:text-slate-300 sm:grid-cols-3">
                  <div className="rounded-lg bg-slate-50/70 p-4 dark:bg-white/[0.025]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-700 dark:bg-teal-300/10 dark:text-teal-200">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 7 10 17l-5-5" />
                      </svg>
                    </div>
                    <p className="mt-4 text-xs uppercase tracking-widest text-slate-400">Condition</p>
                    <p className="mt-2 capitalize text-slate-900 dark:text-white">{listing.condition}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50/70 p-4 dark:bg-white/[0.025]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-50 text-sky-700 dark:bg-sky-300/10 dark:text-sky-200">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 21s7-5.1 7-11a7 7 0 1 0-14 0c0 5.9 7 11 7 11Z" />
                        <circle cx="12" cy="10" r="2.5" />
                      </svg>
                    </div>
                    <p className="mt-4 text-xs uppercase tracking-widest text-slate-400">Campus</p>
                    <p className="mt-2 text-slate-900 dark:text-white">{listing.campus}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50/70 p-4 dark:bg-white/[0.025]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-700 dark:bg-rose-300/10 dark:text-rose-200">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                    <p className="mt-4 text-xs uppercase tracking-widest text-slate-400">Interest</p>
                    <p className="mt-2 text-slate-900 dark:text-white">{listing.views} views</p>
                  </div>
                </div>

                <h3 className="mt-9 text-xl font-black text-slate-950 dark:text-white">Description</h3>
                <div className="mt-6 space-y-5 text-base leading-8 text-slate-600 dark:text-slate-300 sm:leading-9">
                {descriptionPoints.length > 1 ? (
                  <ul className="space-y-3">
                    {descriptionPoints.map((point, index) => (
                      <li key={`${point}-${index}`} className="flex gap-3">
                        <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="whitespace-pre-wrap">{listing.description}</p>
                )}
                </div>
              </div>
            </div>

            <div className="surface-panel p-6 transition-all duration-300 hover:shadow-[0_24px_70px_rgba(15,118,110,0.10)] dark:hover:shadow-[0_24px_70px_rgba(20,184,166,0.09)] sm:p-8">
              {isOwner ? (
                <SellerBidsPanel listingId={params.id} />
              ) : (
                <BiddingWidget listingId={params.id} listingPrice={listing.price} sellerId={listing.seller._id.toString()} userId={session?.user?.id} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

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

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  await connectToDatabase();
  const listing = await Listing.findById(params.id).populate('seller', 'name email').lean() as any;
  if (!listing || listing.status !== 'approved') notFound();

  const primaryImage = listing.images?.[0];
  const galleryImages = listing.images?.slice(1, 4) || [];
  const isOwner = session?.user?.id === listing.seller._id.toString();

  return (
    <div className="app-shell">
      <Header />
      <main className="py-10 sm:py-16">
        <div className="app-container space-y-10">
          <Link href="/listings" className="inline-flex text-sm font-bold text-teal-700 transition hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200">
            Back to Listings
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.95fr] lg:items-start">
            <div className="space-y-5">
              {primaryImage ? (
                <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-lg dark:border-white/10 dark:bg-white/5">
                  <Image src={primaryImage} alt={listing.title} fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover transition-transform duration-500 hover:scale-105" />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-lg border border-slate-200 bg-slate-100 font-semibold text-slate-400 dark:border-white/10 dark:bg-white/5">
                  Image pending
                </div>
              )}
              {galleryImages.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {galleryImages.map((image: string, index: number) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-white/10 dark:bg-white/5">
                      <Image src={image} alt={`${listing.title} ${index + 2}`} fill sizes="(max-width: 768px) 33vw, 20vw" className="object-cover transition-transform duration-500 hover:scale-110" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="surface-panel p-8">
                <p className="eyebrow">{listing.category}</p>
                <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 dark:text-white">{listing.title}</h1>
                <p className="mt-4 text-4xl font-black text-teal-700 dark:text-teal-300">{formatCurrency(listing.price)}</p>
              </div>

              <div className="surface-panel p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Seller</p>
                <p className="mt-3 text-lg font-black text-slate-950 dark:text-white">{listing.seller.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{listing.seller.email}</p>
                <Link
                  href={`/users/${listing.seller._id.toString()}`}
                  className="mt-4 inline-flex text-sm font-bold text-teal-700 transition hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200"
                >
                  View seller profile
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Condition', value: listing.condition },
                  { label: 'Campus', value: listing.campus },
                  { label: 'Views', value: listing.views },
                ].map((d) => (
                  <div key={d.label} className="elevated-card p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{d.label}</p>
                    <p className="mt-2 truncate font-black capitalize text-slate-950 dark:text-white">{d.value}</p>
                  </div>
                ))}
              </div>

              <ListingActions listingId={listing._id.toString()} isOwner={isOwner} />

              {!isOwner && (
                <Link href={`/listings/${listing._id}/chat`} className="btn-secondary flex w-full py-4">Send Message to Seller</Link>
              )}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="surface-panel p-8 lg:col-span-2">
              <h2 className="mb-6 text-2xl font-black text-slate-950 dark:text-white">Description</h2>
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-slate-600 dark:text-slate-300">{listing.description}</p>
            </div>
            <div className="surface-panel h-fit p-8">
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

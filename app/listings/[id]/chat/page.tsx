import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import Listing from '@/models/Listing';
import ChatWidget from '@/components/chat/chat-widget';
import Header from '@/components/header';

export const metadata: Metadata = { title: 'Chat - CampusMart' };

export default async function ChatPage({ params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const listing = await Listing.findById(params.id).populate('seller', 'name email').lean() as any;
    if (!listing?.seller) notFound();

    return (
      <div className="app-shell">
        <Header />
        <main className="py-8 sm:py-12">
          <div className="app-container max-w-6xl space-y-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Link href={`/listings/${params.id}`} className="mb-5 inline-flex text-sm font-bold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200">
                  Back to listing
                </Link>
                <p className="eyebrow">Direct Message</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl">{listing.title}</h1>
                <p className="muted-copy mt-4 text-base sm:text-lg">Chat with <span className="font-black text-slate-950 dark:text-white">{listing.seller.name}</span> about price, availability, and pickup details.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
                <div className="rounded-lg border border-slate-200 bg-white/85 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Seller</p>
                  <p className="mt-1 truncate text-sm font-black text-slate-950 dark:text-white">{listing.seller.name}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white/85 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Status</p>
                  <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200">Secure chat</p>
                </div>
              </div>
            </div>
            <ChatWidget listingId={params.id} sellerId={listing.seller._id.toString()} sellerName={listing.seller.name} listingTitle={listing.title} />
          </div>
        </main>
      </div>
    );
  } catch {
    notFound();
  }
}

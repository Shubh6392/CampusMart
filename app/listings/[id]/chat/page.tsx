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
        <main className="py-10 sm:py-16">
          <div className="app-container space-y-8">
            <div className="surface-panel p-7 sm:p-10">
              <Link href={`/listings/${params.id}`} className="mb-6 inline-flex text-sm font-bold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200">
                Back to Listing
              </Link>
              <p className="eyebrow">Direct Message</p>
              <h1 className="mt-3 text-4xl font-black text-slate-950 dark:text-white">{listing.title}</h1>
              <p className="muted-copy mt-3">Chat with <span className="font-black text-slate-950 dark:text-white">{listing.seller.name}</span> about this item.</p>
            </div>
            <ChatWidget listingId={params.id} sellerId={listing.seller._id.toString()} sellerName={listing.seller.name} />
          </div>
        </main>
      </div>
    );
  } catch {
    notFound();
  }
}

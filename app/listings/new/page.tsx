import Link from 'next/link';
import Header from '@/components/header';
import ListingForm from '@/components/listing/listing-form';

export default function NewListingPage() {
  return (
    <div className="app-shell">
      <Header />
      <main className="py-10 sm:py-16">
        <div className="app-container space-y-8">
          <div className="surface-panel p-7 sm:p-10">
            <Link href="/listings" className="mb-6 inline-flex text-sm font-bold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200">
              Back to Listings
            </Link>
            <p className="eyebrow">New Listing</p>
            <h1 className="section-title mt-3">Post Your Item</h1>
            <p className="muted-copy mt-4 max-w-2xl text-lg leading-8">
              Add polished details, clear photos, and a fair price so verified students can act quickly.
            </p>
          </div>

          <div className="surface-panel overflow-hidden">
            <div className="border-b border-slate-200/80 bg-white/70 px-7 py-6 dark:border-white/10 dark:bg-white/[0.03] sm:px-8">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Listing Details</h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">Photos, pricing, and pickup context help buyers decide faster.</p>
            </div>
            <div className="p-7 sm:p-8">
              <ListingForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import Header from '@/components/header';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Bid from '@/models/Bid';
import Bookmark from '@/models/Bookmark';
import Listing from '@/models/Listing';
import Message from '@/models/Message';
import User from '@/models/User';
import Image from 'next/image';
import { formatCurrency } from '@/lib/currency';

function formatMemberSince(value?: Date | string) {
  if (!value) return 'Recently joined';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function getInitials(name?: string | null) {
  if (!name) return 'U';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'U';
}

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  await connectToDatabase();

  const user = await User.findById(params.id)
    .select('name email image college role status domain createdAt')
    .lean() as any;

  if (!user || user.status === 'banned') {
    notFound();
  }

  const isOwner = session?.user?.id === user._id.toString();

  const [
    listings,
    liveListings,
    soldListings,
    totalViews,
    totalBids,
    conversationCount,
    bookmarkCount,
  ] = await Promise.all([
    Listing.find({ seller: user._id, status: { $in: ['approved', 'sold'] } })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('_id title price category condition images status campus createdAt views')
      .lean(),
    Listing.countDocuments({ seller: user._id, status: 'approved' }),
    Listing.countDocuments({ seller: user._id, status: 'sold' }),
    Listing.aggregate([
      { $match: { seller: user._id } },
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]),
    Bid.countDocuments({ bidder: user._id }),
    Message.distinct('conversationId', {
      $or: [{ from: user._id }, { to: user._id }],
    }).then((ids) => ids.length),
    isOwner ? Bookmark.countDocuments({ user: user._id }) : Promise.resolve(0),
  ]);

  const totalViewsValue = totalViews[0]?.total ?? 0;
  const averagePrice = listings.length
    ? Math.round(listings.reduce((sum: number, listing: any) => sum + (listing.price || 0), 0) / listings.length)
    : 0;

  const publicStats = [
    {
      label: 'Live listings',
      value: liveListings.toString(),
      detail: 'Items currently visible on the marketplace',
    },
    {
      label: 'Sold items',
      value: soldListings.toString(),
      detail: 'Completed marketplace transactions',
    },
    {
      label: 'Profile views',
      value: totalViewsValue.toString(),
      detail: 'Total listing views earned across this account',
    },
    {
      label: 'Conversations',
      value: conversationCount.toString(),
      detail: 'Marketplace chats started with this member',
    },
  ];

  const ownerStats = [
    {
      label: 'Saved items',
      value: bookmarkCount.toString(),
      detail: 'Products you bookmarked for later',
    },
    {
      label: 'Bids placed',
      value: totalBids.toString(),
      detail: 'Offers submitted across the marketplace',
    },
    {
      label: 'Average listing price',
      value: averagePrice > 0 ? formatCurrency(averagePrice, { decimals: 0 }) : 'Rs 0',
      detail: 'Average price from your recent public listings',
    },
  ];

  return (
    <div className="app-shell">
      <Header />
      <main className="py-10 sm:py-16">
        <div className="app-container space-y-8">
          <section className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(13,148,136,0.14),rgba(255,255,255,0.96)_42%,rgba(251,146,60,0.14))] px-6 py-8 shadow-[0_25px_100px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(20,184,166,0.16),rgba(15,23,42,0.95)_42%,rgba(251,146,60,0.12))] sm:px-8 sm:py-10 lg:px-10">
            <div className="pointer-events-none absolute -right-12 top-8 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-300/15" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 -translate-x-1/4 translate-y-1/4 rounded-full bg-orange-300/30 blur-3xl dark:bg-orange-300/10" />

            <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <div>
                <p className="eyebrow">{isOwner ? 'Your profile' : 'Member profile'}</p>
                <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-3xl border border-white/70 object-cover shadow-lg dark:border-white/10"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-950 text-3xl font-black text-white shadow-lg dark:bg-white dark:text-slate-950">
                      {getInitials(user.name)}
                    </div>
                  )}

                  <div>
                    <h1 className="text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl">
                      {user.name}
                    </h1>
                    <p className="muted-copy mt-3 max-w-2xl text-lg leading-8">
                      {user.role === 'seller'
                        ? 'Active campus seller with public listings, pricing history, and buyer activity.'
                        : user.role === 'admin'
                          ? 'Marketplace administrator profile.'
                          : 'Verified campus member participating in the marketplace community.'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="status-pill capitalize">{user.role}</span>
                  <span className="rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                    {user.college}
                  </span>
                  <span className="rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                    Member since {formatMemberSince(user.createdAt)}
                  </span>
                </div>
              </div>

              <div className="surface-panel rounded-[1.5rem] p-6">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Profile details
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Email</p>
                    <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Campus</p>
                    <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{user.college}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Email domain</p>
                    <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{user.domain}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Account status</p>
                    <p className="mt-1 text-base font-semibold capitalize text-slate-900 dark:text-white">{user.status}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <Link href="/listings" className="btn-secondary w-full">
                    Browse marketplace
                  </Link>
                  {isOwner ? (
                    <Link href="/dashboard" className="btn-primary w-full">
                      Open dashboard
                    </Link>
                  ) : (
                    <Link href="/messages" className="btn-primary w-full">
                      Open messages
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {publicStats.map((stat) => (
              <div key={stat.label} className="metric-card">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-4 text-4xl font-black text-slate-950 dark:text-white">{stat.value}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{stat.detail}</p>
              </div>
            ))}
          </section>

          {isOwner && (
            <section className="surface-panel rounded-[1.75rem] p-6 sm:p-8">
              <p className="eyebrow">Private snapshot</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">Your personal account overview</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {ownerStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">{stat.value}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="surface-panel rounded-[1.75rem] p-6 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Marketplace presence</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">Recent public listings</h2>
              </div>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Latest approved or sold items
              </span>
            </div>

            {listings.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {listings.map((listing: any) => (
                  <Link key={listing._id.toString()} href={`/listings/${listing._id.toString()}`} className="insight-card group">
                    {listing.images?.[0] ? (
                      <div className="relative mb-4 h-44 overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10">
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="mb-4 flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm font-semibold text-slate-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-500">
                        No image
                      </div>
                    )}

                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
                      {listing.category}
                    </p>
                    <h3 className="mt-3 line-clamp-2 text-xl font-black text-slate-950 transition-colors group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">
                      {listing.title}
                    </h3>
                    <p className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
                      {formatCurrency(listing.price)}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                      <span>{listing.condition}</span>
                      <span>{listing.campus}</span>
                      <span className="capitalize">{listing.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300/80 bg-slate-50/80 p-6 text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400">
                No public listings are available for this member yet.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

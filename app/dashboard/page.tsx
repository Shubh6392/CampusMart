import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import Header from '@/components/header';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Bid from '@/models/Bid';
import Bookmark from '@/models/Bookmark';
import Listing from '@/models/Listing';
import Message from '@/models/Message';
import Notification from '@/models/Notification';
import { formatCurrency } from '@/lib/currency';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');

  const userId = session.user.id;
  if (!userId) redirect('/auth/signin');

  let activeListings = 0;
  let pendingListings = 0;
  let soldListings = 0;
  let totalViews = 0;
  let averageListingPrice = 0;
  let savedItems = 0;
  let unreadNotifications = 0;
  let unreadMessages = 0;
  let bidsReceived = 0;
  let acceptedBids = 0;

  try {
    await connectToDatabase();

    const [
      listings,
      bookmarkCount,
      notificationCount,
      messageCount,
    ] = await Promise.all([
      Listing.find({ seller: userId }).select('_id status views price').lean(),
      Bookmark.countDocuments({ user: userId }),
      Notification.countDocuments({ user: userId, read: false }),
      Message.countDocuments({ to: userId, read: false }),
    ]);

    const listingIds = listings.map((listing: any) => listing._id);
    const [bidCount, acceptedBidCount] = await Promise.all([
      listingIds.length ? Bid.countDocuments({ listing: { $in: listingIds } }) : Promise.resolve(0),
      listingIds.length ? Bid.countDocuments({ listing: { $in: listingIds }, status: 'accepted' }) : Promise.resolve(0),
    ]);

    activeListings = listings.filter((listing: any) => listing.status === 'approved').length;
    pendingListings = listings.filter((listing: any) => listing.status === 'pending').length;
    soldListings = listings.filter((listing: any) => listing.status === 'sold').length;
    totalViews = listings.reduce((sum: number, listing: any) => sum + (listing.views || 0), 0);
    averageListingPrice = listings.length
      ? Math.round(
          listings.reduce((sum: number, listing: any) => sum + (listing.price || 0), 0) / listings.length
        )
      : 0;
    savedItems = bookmarkCount;
    unreadNotifications = notificationCount;
    unreadMessages = messageCount;
    bidsReceived = bidCount;
    acceptedBids = acceptedBidCount;
  } catch (error) {
    console.error('Dashboard metrics error:', error);
  }

  const conversionRate = bidsReceived > 0 ? Math.round((acceptedBids / bidsReceived) * 100) : 0;
  const responseHealth = unreadMessages === 0 ? 'Excellent' : unreadMessages <= 3 ? 'Healthy' : 'Needs attention';
  const memberName = session.user.name?.split(' ')[0] || 'there';
  const campusName = session.user.college || session.user.domain || 'your campus';

  const heroHighlights = [
    `${activeListings} live listings`,
    `${unreadMessages} unread messages`,
    `${bidsReceived} total offers received`,
  ];

  const primaryMetrics = [
    {
      label: 'Live listings',
      value: activeListings.toString(),
      detail: pendingListings > 0 ? `${pendingListings} awaiting approval` : 'All submitted items are in motion',
      tone: 'teal',
    },
    {
      label: 'Inbox pressure',
      value: unreadMessages.toString(),
      detail: responseHealth === 'Excellent' ? 'No unread buyer conversations' : `${responseHealth} response health`,
      tone: 'amber',
    },
    {
      label: 'Bookmarks',
      value: savedItems.toString(),
      detail: savedItems > 0 ? 'Demand signals worth revisiting' : 'Start curating potential buys',
      tone: 'blue',
    },
    {
      label: 'Notifications',
      value: unreadNotifications.toString(),
      detail: unreadNotifications > 0 ? 'Fresh marketplace updates waiting' : 'You are fully caught up',
      tone: 'rose',
    },
  ];

  const actionCards = [
    {
      eyebrow: 'Revenue motion',
      title: 'Launch a polished new listing',
      text: 'Use strong photos, confident pricing, and pickup details to reduce friction and improve trust.',
      cta: 'Create Listing',
      href: '/listings/new',
    },
    {
      eyebrow: 'Buyer pipeline',
      title: 'Re-engage your highest-intent shoppers',
      text: 'Reply to active chats, review offer history, and convert open interest into a completed handoff.',
      cta: 'Open Messages',
      href: '/messages',
    },
    {
      eyebrow: 'Market watch',
      title: 'Track saved opportunities and price movement',
      text: 'Use bookmarks as your shortlist for quick comparisons when the right item becomes available.',
      cta: 'Review Saved Items',
      href: '/bookmarks',
    },
  ];

  const operationalCards = [
    {
      title: 'Offer conversion',
      value: `${conversionRate}%`,
      detail: acceptedBids > 0 ? `${acceptedBids} accepted offers from ${bidsReceived} total bids` : 'No accepted offers yet',
    },
    {
      title: 'Listing velocity',
      value: `${totalViews}`,
      detail: totalViews > 0 ? 'Total views across your inventory' : 'Visibility will grow as listings go live',
    },
    {
      title: 'Average ticket',
      value: averageListingPrice > 0 ? formatCurrency(averageListingPrice, { decimals: 0 }) : 'Rs 0',
      detail: averageListingPrice > 0 ? 'Average price of your listed inventory' : 'Create listings to benchmark pricing',
    },
    {
      title: 'Completed sales',
      value: soldListings.toString(),
      detail: soldListings > 0 ? 'Items successfully closed out' : 'Your sold history will appear here',
    },
  ];

  const workspaceSections = [
    {
      title: 'Listings',
      detail: 'Review approvals, optimize pricing, and keep active inventory sharp.',
      href: '/listings',
      tag: activeListings > 0 ? `${activeListings} active` : 'Start selling',
    },
    {
      title: 'Messages',
      detail: 'Handle buyer questions quickly to protect momentum.',
      href: '/messages',
      tag: unreadMessages > 0 ? `${unreadMessages} unread` : 'Inbox clear',
    },
    {
      title: 'Saved Items',
      detail: 'Monitor interesting deals and move fast when value appears.',
      href: '/bookmarks',
      tag: savedItems > 0 ? `${savedItems} saved` : 'No saved items',
    },
    {
      title: 'Notifications',
      detail: 'Catch offer updates, approvals, and listing changes in one place.',
      href: '/notifications',
      tag: unreadNotifications > 0 ? `${unreadNotifications} new` : 'All caught up',
    },
  ];

  const priorityQueue = [
    {
      label: 'Pending approvals',
      value: pendingListings,
      text: pendingListings > 0 ? 'Listings waiting on review before they can go live.' : 'No approvals blocking your inventory today.',
      href: '/listings',
    },
    {
      label: 'Unread buyer chats',
      value: unreadMessages,
      text: unreadMessages > 0 ? 'Fast replies keep negotiation heat high and reduce drop-off.' : 'Response times look great right now.',
      href: '/messages',
    },
    {
      label: 'Fresh alerts',
      value: unreadNotifications,
      text: unreadNotifications > 0 ? 'Marketplace system updates and offer changes are waiting.' : 'Nothing urgent in your alert feed.',
      href: '/notifications',
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
                <p className="eyebrow">User dashboard</p>
                <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-slate-950 dark:text-white sm:text-5xl">
                  Welcome back, {memberName}. Your marketplace is moving across {campusName}.
                </h1>
                <p className="muted-copy mt-4 max-w-2xl text-lg leading-8">
                  This workspace brings together your inventory, buyer conversations, saved demand signals, and operational alerts in one sharper control surface.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {heroHighlights.map((item) => (
                    <div key={item} className="rounded-full border border-slate-300/70 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/listings/new" className="btn-primary">
                    Create Listing
                  </Link>
                  <Link href="/messages" className="btn-secondary">
                    Review Messages
                  </Link>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="surface-panel rounded-[1.5rem] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Performance snapshot</p>
                      <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Commerce health</h2>
                    </div>
                    <span className="status-pill">Live</span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {operationalCards.slice(0, 2).map((card) => (
                      <div key={card.title} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{card.title}</p>
                        <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{card.value}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Response health', value: responseHealth },
                    { label: 'Offer wins', value: acceptedBids.toString() },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.05]">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
                      <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {primaryMetrics.map((metric) => (
              <div key={metric.label} className="metric-card">
                <div className={`metric-glow metric-glow-${metric.tone}`} />
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{metric.label}</p>
                <p className="mt-4 text-4xl font-black text-slate-950 dark:text-white">{metric.value}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{metric.detail}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="surface-panel rounded-[1.75rem] p-6 sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="eyebrow">Enterprise actions</p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">High-impact next moves</h2>
                </div>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Prioritized for seller velocity</span>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                {actionCards.map((card) => (
                  <Link key={card.title} href={card.href} className="insight-card group">
                    <p className="eyebrow">{card.eyebrow}</p>
                    <h3 className="mt-3 text-2xl font-black text-slate-950 transition-colors group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{card.text}</p>
                    <div className="mt-6 text-sm font-black uppercase tracking-[0.16em] text-teal-700 dark:text-teal-300">
                      {card.cta}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="surface-panel rounded-[1.75rem] p-6 sm:p-8">
              <p className="eyebrow">Priority queue</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">What needs attention now</h2>

              <div className="mt-6 space-y-4">
                {priorityQueue.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-teal-300/40 dark:hover:bg-white/[0.06]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white dark:bg-white dark:text-slate-950">
                      {item.value}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-950 dark:text-white">{item.label}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.text}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="surface-panel rounded-[1.75rem] p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow">Workspace</p>
                  <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">Core navigation</h2>
                </div>
                <span className="hidden rounded-full border border-slate-300/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:border-white/10 dark:text-slate-400 sm:inline-flex">
                  All channels
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {workspaceSections.map((section) => (
                  <Link key={section.title} href={section.href} className="insight-card group min-h-[190px]">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xl font-black text-slate-950 transition-colors group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">
                        {section.title}
                      </h3>
                      <span className="rounded-full border border-slate-300/80 px-3 py-1 text-xs font-bold text-slate-600 dark:border-white/10 dark:text-slate-300">
                        {section.tag}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{section.detail}</p>
                    <div className="mt-6 text-sm font-black uppercase tracking-[0.16em] text-slate-950 dark:text-white">
                      Open workspace
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="surface-panel rounded-[1.75rem] p-6 sm:p-8">
              <p className="eyebrow">Operating insights</p>
              <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">Seller performance board</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {operationalCards.map((card) => (
                  <div key={card.title} className="rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
                    <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{card.title}</p>
                    <p className="mt-3 text-4xl font-black text-slate-950 dark:text-white">{card.value}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">{card.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.03]">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Recommended operating pattern</p>
                <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                  Enterprise storefronts usually win with three habits: keep listings fresh, answer buyers quickly, and turn alerts into action before interest cools.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

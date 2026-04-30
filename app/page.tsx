import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import Header from '@/components/header';
import { listingCategories } from '@/lib/listing-categories';

const categoryTabs = [
  'Study Essentials',
  'Mobiles',
  'Electronics',
  'Hostel Needs',
  'Room Setup',
  'Books',
  'Cycles',
  'Sports',
].map((label) => listingCategories.find((category) => category.label === label)!);

const spotlightCards = [
  {
    title: 'Laptop deals for campus',
    subtitle: 'Verified devices from student sellers',
    detail: 'Refurbished and ready for classes, projects, and internships.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    theme: 'from-sky-100 via-white to-cyan-100',
    accent: 'text-blue-700',
  },
  {
    title: 'Hostel comfort picks',
    subtitle: 'Set up your room faster',
    detail: 'Chairs, lamps, storage, and smart utility items that actually help on campus.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    theme: 'from-emerald-100 via-white to-teal-100',
    accent: 'text-emerald-700',
  },
  {
    title: 'Phones with great value',
    subtitle: 'Daily drivers under student budgets',
    detail: 'Affordable smartphones and accessories from trusted campus accounts.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
    theme: 'from-slate-900 via-slate-800 to-slate-700',
    accent: 'text-blue-200',
  },
];

const quickDeals = [
  {
    title: 'Stationery combo',
    price: 'From Rs 12',
    href: '/listings?search=Stationery+combo',
    image: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Desk audio setup',
    price: 'From Rs 39',
    href: '/listings?search=Desk+audio+setup',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Cycle commute gear',
    price: 'From Rs 18',
    href: '/listings?search=Cycle+commute+gear',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=700&q=80',
  },
];

const curatedShelf = [
  {
    title: 'Classroom basics',
    text: 'Notebooks, pens, folders, and everyday study supplies.',
    href: '/listings?search=Classroom+basics',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Lab and project gear',
    text: 'Calculators, kits, and practical tools for academic work.',
    href: '/listings?search=Lab+and+project+gear',
    image: 'https://picsum.photos/seed/labgear/700/700',
  },
  {
    title: 'Creator corner',
    text: 'Camera, audio, and desk accessories for building ideas.',
    href: '/listings?search=Creator+corner',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Hostel utility',
    text: 'Bottles, locks, organizers, and compact room essentials.',
    href: '/listings?search=Hostel+utility',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=700&q=80',
  },
];

const featured = [
  {
    title: 'MacBook Air M1',
    price: 'Rs 899',
    category: 'Electronics',
    detail: 'Ideal for coding, design, and project work.',
    href: '/listings?search=MacBook+Air+M1',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Study desk setup',
    price: 'Rs 140',
    category: 'Furniture',
    detail: 'A cleaner room setup for classes and long sessions.',
    href: '/listings?search=Study+desk+setup',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Textbook bundle',
    price: 'Rs 65',
    category: 'Books',
    detail: 'Semester-ready reading at student-friendly pricing.',
    href: '/listings?search=Textbook+bundle',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
  },
];

const proof = [
  { value: '100%', label: 'Verified student access' },
  { value: '< 2 min', label: 'Average listing setup' },
  { value: '24/7', label: 'Alerts and moderation' },
];

const benefitCards = [
  {
    title: 'Verified access',
    text: 'Student accounts, campus context, and moderation keep marketplace noise low.',
  },
  {
    title: 'Real-time decisions',
    text: 'Messaging, bid history, and alerts make every next step visible.',
  },
  {
    title: 'Operational polish',
    text: 'Admin approvals, reporting, and analytics help the marketplace scale responsibly.',
  },
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isSignedIn = Boolean(session?.user);
  const userName = session?.user?.name?.trim() || 'My Account';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'A';

  return (
    <main className="app-shell">
      <Header />

      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white/80 pb-14 pt-6 dark:border-white/10 dark:bg-neutral-950/30">
        <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_36%),radial-gradient(circle_at_top_right,rgba(45,212,191,0.12),transparent_30%)]" />
        <div className="app-container space-y-8">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl bg-yellow-300 px-4 py-2 text-sm font-black text-slate-900">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">C</span>
                  CampusMart
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 dark:bg-teal-300/10 dark:text-teal-200">
                  Verified student marketplace
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                <span className="rounded-full bg-slate-100 px-3 py-2 dark:bg-white/10">Campus pickup active</span>
                <span className="rounded-full bg-slate-100 px-3 py-2 dark:bg-white/10">Safer peer-to-peer trade</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center">
              <form action="/listings" method="get" className="flex-1 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-white/[0.03]">
                <label htmlFor="home-marketplace-search" className="sr-only">
                  Search marketplace items
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3 px-3 py-2 text-slate-500 dark:text-slate-400">
                    <span className="hidden text-sm font-black uppercase tracking-[0.2em] text-slate-400 sm:inline">
                      Search
                    </span>
                    <input
                      id="home-marketplace-search"
                      name="search"
                      type="search"
                      placeholder="Find laptops, books, room setup items, cycles, and student deals"
                      className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-400 sm:text-base"
                    />
                  </div>
                  <button type="submit" className="btn-primary px-5 py-3">
                    Search
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
                <Link href="/listings" className="rounded-xl px-4 py-3 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">
                  Explore marketplace
                </Link>
                {isSignedIn ? (
                  <Link href="/profile" className="account-pill group" aria-label="Open profile" title="My account">
                    <span className="account-pill-avatar">
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={userName}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </span>
                  </Link>
                ) : (
                  <Link href="/auth/signin" className="rounded-xl px-4 py-3 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">
                    Login
                  </Link>
                )}
                <Link href={isSignedIn ? '/bookmarks' : '/listings'} className="rounded-xl px-4 py-3 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10">
                  Saved
                </Link>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <div className="flex min-w-max gap-3">
                {categoryTabs.map((tab, index) => (
                  <Link
                    key={tab.value}
                    href={`/listings?category=${encodeURIComponent(tab.value)}`}
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                      index === 0
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                        : 'bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15'
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
            <div className="rounded-[2.2rem] border border-slate-200/80 bg-[linear-gradient(135deg,#ffffff,rgba(236,253,245,0.9)_55%,rgba(224,242,254,0.9))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(20,184,166,0.08),rgba(56,189,248,0.10))] sm:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div>
                  <div className="status-pill">Campus-only marketplace</div>
                  <h1 className="mt-5 max-w-3xl text-5xl font-black leading-[1.02] text-slate-950 dark:text-white sm:text-6xl">
                    Buy, sell, and move campus essentials with people you already trust.
                  </h1>
                  <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                    CampusMart brings together fast discovery, verified access, messaging, bids, and moderation in one student-focused marketplace that feels real and easy to use.
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                    <Link href={isSignedIn ? '/listings/new' : '/listings'} className="btn-primary px-8 py-4 text-base">
                      {isSignedIn ? 'Post a Listing' : 'Explore Listings'}
                    </Link>
                    <Link href={isSignedIn ? '/messages' : '/auth/signin'} className="btn-secondary px-8 py-4 text-base">
                      {isSignedIn ? 'Open Messages' : 'Join with Campus Email'}
                    </Link>
                  </div>

                  <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
                    {proof.map((item) => (
                      <div key={item.label} className="rounded-[1.4rem] border border-white/70 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
                        <p className="text-2xl font-black text-teal-700 dark:text-teal-300">{item.value}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="surface-panel overflow-hidden p-3">
                  <div className="relative aspect-[4/4.7] overflow-hidden rounded-[1.6rem]">
                    <Image
                      src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=80"
                      alt="Students on campus reviewing items together"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-x-4 top-4 rounded-[1.2rem] border border-white/25 bg-white/90 p-4 text-slate-900 backdrop-blur dark:bg-slate-950/75 dark:text-white">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-200">Live campus activity</p>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-sm font-semibold">
                        <span>12 new bids</span>
                        <span>8 active chats</span>
                        <span>4 approvals</span>
                      </div>
                    </div>
                    <div className="absolute inset-x-4 bottom-4 rounded-[1.2rem] border border-white/20 bg-neutral-950/72 p-4 text-white backdrop-blur">
                      <p className="text-sm font-black">Faster handoffs, cleaner communication, safer campus trade.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {spotlightCards.map((card, index) => {
                const darkCard = index === 2;
                return (
                  <article
                    key={card.title}
                    className={`overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-gradient-to-br ${card.theme} shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10`}
                  >
                    <div className="grid h-full gap-4 p-5 sm:grid-cols-[1fr_120px] sm:items-center">
                      <div className={darkCard ? 'text-white' : 'text-slate-900'}>
                        <p className={`text-xs font-black uppercase tracking-[0.22em] ${card.accent}`}>Spotlight</p>
                        <h2 className="mt-2 text-2xl font-black leading-tight">{card.title}</h2>
                        <p className={`mt-2 text-sm font-bold ${darkCard ? 'text-white' : 'text-slate-700'}`}>{card.subtitle}</p>
                        <p className={`mt-2 text-sm leading-6 ${darkCard ? 'text-slate-200' : 'text-slate-600'}`}>{card.detail}</p>
                      </div>
                      <div className="relative overflow-hidden rounded-[1.2rem] bg-white/40">
                        <Image src={card.image} alt={card.title} fill className="object-cover" />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="app-container py-14 sm:py-18">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.05]">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Quick deals</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">Useful items students buy quickly</h2>
              </div>
              <Link href="/listings" className="text-sm font-bold text-teal-700 dark:text-teal-300">
                Browse all
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {quickDeals.map((item) => (
                <Link key={item.title} href={item.href} className="group rounded-[1.5rem] bg-slate-50 p-3 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_50px_rgba(15,118,110,0.12)] dark:bg-white/[0.04] dark:hover:bg-white/[0.07]">
                  <div className="relative aspect-[4/4.1] overflow-hidden rounded-[1.15rem]">
                    <Image src={item.image} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <p className="mt-3 text-lg font-black text-slate-900 dark:text-white">{item.price}</p>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{item.title}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(255,255,255,0.94))] p-5 shadow-[0_18px_60px_rgba(16,185,129,0.08)] dark:border-emerald-300/20 dark:bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(255,255,255,0.04))]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-200">Campus picks</p>
                <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">A cleaner catalog for actual student life</h2>
              </div>
              <Link href="/listings" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow-sm dark:bg-slate-950 dark:text-white">
                See all
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {curatedShelf.map((item) => (
                <Link key={item.title} href={item.href} className="group overflow-hidden rounded-[1.3rem] bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(16,185,129,0.14)] dark:bg-slate-950/40">
                  <div className="relative aspect-[4/4.1] overflow-hidden rounded-[1rem]">
                    <Image src={item.image} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-black text-slate-900 dark:text-white">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{item.text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white/70 py-16 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="app-container">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Featured inventory</p>
              <h2 className="section-title mt-3">Fresh finds near you</h2>
            </div>
            <Link href="/listings" className="btn-secondary w-fit">Browse All</Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {featured.map((item) => (
              <Link key={item.title} href={item.href} className="elevated-card elevated-card-hover group overflow-hidden">
                <div className="relative aspect-[5/3] overflow-hidden bg-slate-100 dark:bg-neutral-800">
                  <Image src={item.image} alt={item.title} fill className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <span className="status-pill">{item.category}</span>
                  <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</p>
                  <p className="mt-4 text-2xl font-black text-teal-700 dark:text-teal-300">{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="app-container py-16 sm:py-20">
        <div className="mb-8 max-w-3xl">
          <p className="eyebrow">Why it works</p>
          <h2 className="section-title mt-3">Built like a real marketplace, tuned for a campus community.</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {benefitCards.map((item, index) => (
            <div key={item.title} className="surface-panel p-7">
              <div className={`mb-5 h-1.5 w-16 rounded-full ${index === 0 ? 'bg-teal-600 dark:bg-teal-300' : index === 1 ? 'bg-sky-600 dark:bg-sky-300' : 'bg-amber-500 dark:bg-amber-300'}`} />
              <h3 className="text-xl font-black text-slate-950 dark:text-white">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="app-container pb-16 sm:pb-24">
        <div className="grid gap-8 rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,253,250,0.94))] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.05),rgba(20,184,166,0.10))] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <h2 className="section-title mt-3">Move your next campus deal forward.</h2>
            <p className="muted-copy mt-4 max-w-2xl text-lg leading-8">
              List an item, review active offers, or start with a quick browse of what students around you are trading today.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={isSignedIn ? '/listings/new' : '/auth/signin'} className="btn-primary">
              {isSignedIn ? 'Post a Listing' : 'Get Started'}
            </Link>
            <Link href="/listings" className="btn-secondary">View Marketplace</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 bg-white/70 py-8 dark:border-white/10 dark:bg-neutral-950/40">
        <div className="app-container flex flex-col gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 CampusMart. All rights reserved.</p>
          <p>Built for verified student commerce.</p>
        </div>
      </footer>
    </main>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import Header from '@/components/header';
import { formatCurrency } from '@/lib/currency';
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

const featuredProducts = [
  {
    id: 'macbook-air-m1',
    title: 'MacBook Air M1, 8GB RAM',
    price: 899,
    category: 'Electronics',
    condition: 'Like new',
    seller: 'Aarav Mehta',
    location: 'North Campus',
    posted: '18 min ago',
    badge: 'Trending',
    href: '/listings?search=MacBook+Air+M1',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'engineering-books',
    title: 'Engineering textbook bundle',
    price: 65,
    category: 'Books',
    condition: 'Used',
    seller: 'Nisha Rao',
    location: 'Library block',
    posted: '32 min ago',
    badge: 'Just Posted',
    href: '/listings?search=Engineering+textbook+bundle',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'study-desk-setup',
    title: 'Study desk with lamp',
    price: 140,
    category: 'Room Setup',
    condition: 'Good',
    seller: 'Kabir Singh',
    location: 'Hostel C',
    posted: '1 hr ago',
    badge: 'Trending',
    href: '/listings?search=Study+desk+setup',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'cycle-commute',
    title: 'Campus cycle with lock',
    price: 58,
    category: 'Cycles',
    condition: 'Used',
    seller: 'Diya Shah',
    location: 'Sports complex',
    posted: '2 hr ago',
    badge: 'Just Posted',
    href: '/listings?search=Campus+cycle+lock',
    image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80',
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
    title: 'Lab and project gear',
    price: 'From Rs 45',
    href: '/listings?search=Lab+and+project+gear',
    image: 'https://images.unsplash.com/photo-1581092921461-eab10380d70a?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Hostel utility',
    price: 'From Rs 22',
    href: '/listings?search=Hostel+utility',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=700&q=80',
  },
];

const campusPicks = [
  {
    title: 'Books',
    count: '240+ listings',
    href: '/listings?category=books',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Electronics',
    count: '180+ listings',
    href: '/listings?category=electronics',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Hostel Needs',
    count: '120+ listings',
    href: '/listings?category=hostel-needs',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Sports',
    count: '90+ listings',
    href: '/listings?category=sports',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=700&q=80',
  },
];

const recommended = featuredProducts.slice(0, 3);
const recentlyViewed = [featuredProducts[1], featuredProducts[3], featuredProducts[2]];

const benefits = [
  {
    title: 'Verified student sellers',
    text: 'Student profiles and moderation reduce marketplace noise.',
    icon: 'verified',
  },
  {
    title: 'Faster local handoffs',
    text: 'Clear pickup context helps deals move quickly.',
    icon: 'location',
  },
  {
    title: 'Built for repeat browsing',
    text: 'Saved items, recent views, and bids keep buyers moving.',
    icon: 'activity',
  },
];

function BenefitIcon({ type }: { type: string }) {
  if (type === 'location') {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 10c0 4.5-8 11-8 11S4 14.5 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }
  if (type === 'activity') {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12h4l3 8 4-16 3 8h4" />
      </svg>
    );
  }
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 20 7v6c0 5-3.4 7.5-8 8-4.6-.5-8-3-8-8V7l8-4Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-300/10 dark:text-emerald-200">
      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.86-9.81a.75.75 0 0 0-1.22-.88l-3.27 4.55-1.8-1.8a.75.75 0 1 0-1.06 1.06l2.42 2.42a.75.75 0 0 0 1.14-.1l3.79-5.25Z" clipRule="evenodd" />
      </svg>
      Verified
    </span>
  );
}

function ProductCard({ product, compact = false }: { product: (typeof featuredProducts)[number]; compact?: boolean }) {
  return (
    <Link href={product.href} className="group elevated-card flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.04] hover:border-teal-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] dark:border-white/[0.08] dark:hover:border-teal-300/50">
      <div className={`relative overflow-hidden bg-slate-100 dark:bg-neutral-900 ${compact ? 'aspect-[5/3]' : 'aspect-[4/3]'}`}>
        <Image src={product.image} alt={product.title} fill className="object-cover transition-transform duration-500 ease-out group-hover:scale-110" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/50 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-slate-950 shadow-sm dark:bg-neutral-950/90 dark:text-white">
          {product.badge === 'Trending' ? 'Trending' : 'Just Posted'}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-bold text-white backdrop-blur">
          {product.condition}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">{product.category}</span>
          <span className="text-xs font-semibold text-slate-500 dark:text-gray-300">{product.posted}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[2.75rem] text-base font-black leading-6 text-slate-950 dark:text-white">{product.title}</h3>
        <p className="mt-2 text-3xl font-black text-teal-700 dark:text-teal-200">{formatCurrency(product.price, { decimals: 0 })}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-gray-300">
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 dark:bg-amber-300/10 dark:text-amber-200">4.5 rating</span>
          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700 dark:bg-sky-300/10 dark:text-sky-200">Safe deal</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-white/10">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{product.seller}</p>
              <VerifiedBadge />
            </div>
            <p className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-gray-300">{product.location} · 0.8 km</p>
          </div>
          <span className="shrink-0 rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white shadow-[0_12px_30px_rgba(20,184,166,0.22)] transition-all duration-300 ease-out group-hover:scale-105 group-hover:bg-teal-400 dark:text-slate-950">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isSignedIn = Boolean(session?.user);

  return (
    <main className="app-shell">
      <Header />

      <section className="border-b border-slate-200/80 bg-white/70 py-8 dark:border-white/10 dark:bg-neutral-950/30">
        <div className="app-container grid gap-6 xl:grid-cols-[0.8fr_1.2fr] xl:items-stretch">
          <div className="flex h-full flex-col justify-between rounded-2xl border-none bg-gradient-to-br from-teal-900/20 to-transparent p-6 shadow-none">
            <div>
              <p className="eyebrow">Campus-only marketplace</p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 dark:text-white">
                Find campus deals fast.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-gray-300">
                Buy essentials nearby, sell unused items in seconds, and trade with verified students.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href="/listings" className="btn-primary text-base">
                  Start Buying
                </Link>
                <Link href={isSignedIn ? '/listings/new' : '/auth/signin'} className="btn-secondary text-base">
                  Sell in 30 sec
                </Link>
              </div>
            </div>

            <div className="mt-8">
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/60 bg-white/55 p-4 dark:border-white/[0.06] dark:bg-white/[0.04]">
                  <p className="text-2xl font-black text-teal-700 dark:text-teal-200">4.8</p>
                  <p className="mt-1 text-xs font-bold text-slate-500 dark:text-gray-300">Average seller rating</p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/55 p-4 dark:border-white/[0.06] dark:bg-white/[0.04]">
                  <p className="text-2xl font-black text-teal-700 dark:text-teal-200">Safe</p>
                  <p className="mt-1 text-xs font-bold text-slate-500 dark:text-gray-300">Verified campus pickup</p>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/55 p-4 dark:border-white/[0.06] dark:bg-white/[0.04]">
                  <p className="text-2xl font-black text-teal-700 dark:text-teal-200">2 min</p>
                  <p className="mt-1 text-xs font-bold text-slate-500 dark:text-gray-300">Typical listing time</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-gray-300">Popular categories</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categoryTabs.map((tab) => (
                    <Link
                      key={tab.value}
                      href={`/listings?category=${encodeURIComponent(tab.value)}`}
                      className="rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-teal-400 dark:text-slate-950"
                    >
                      {tab.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Featured and trending</p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Products students are checking now</h2>
              </div>
              <Link href="/listings" className="hidden rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-teal-400 dark:text-slate-950 sm:inline-flex">
                View all products
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {featuredProducts.slice(0, 2).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="app-container py-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Quick deals</p>
            <h2 className="section-title mt-2">Useful items at student prices</h2>
          </div>
          <Link href="/listings" className="btn-secondary hidden sm:inline-flex">Browse All</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickDeals.map((item) => (
            <Link key={item.title} href={item.href} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.04] hover:border-teal-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] dark:border-white/[0.08] dark:bg-white/[0.06]">
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-neutral-900">
                <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-500 ease-out group-hover:scale-110" />
              </div>
              <div className="p-4">
                <p className="text-2xl font-black text-slate-950 dark:text-teal-200">{item.price}</p>
                <p className="mt-1 text-sm font-bold text-slate-600 dark:text-gray-300">{item.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white/75 py-16 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="app-container">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Campus picks</p>
              <h2 className="section-title mt-2">Shop by what campus needs most</h2>
            </div>
            <Link href="/listings" className="btn-secondary hidden sm:inline-flex">All Categories</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {campusPicks.map((item) => (
              <Link key={item.title} href={item.href} className="group relative min-h-[220px] overflow-hidden rounded-2xl border border-white/60 bg-slate-900 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.04] hover:shadow-[0_10px_40px_rgba(0,0,0,0.4)] dark:border-white/[0.08]">
                <Image src={item.image} alt={item.title} fill className="object-cover opacity-80 transition-transform duration-500 ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent transition-colors duration-300 group-hover:from-slate-950 group-hover:via-slate-950/70 group-hover:to-slate-950/25" />
                <span className="absolute right-4 top-4 translate-y-2 rounded-xl bg-teal-500 px-4 py-2 text-sm font-medium text-white opacity-0 shadow-lg transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:bg-teal-400 group-hover:opacity-100 dark:text-slate-950">
                  Explore →
                </span>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="text-2xl font-black">{item.title}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-200">{item.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="app-container grid gap-6 py-16 lg:grid-cols-2">
        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Recommended for you</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Based on campus activity</h2>
            </div>
            <Link href="/listings" className="text-sm font-black text-teal-700 dark:text-teal-300">Continue browsing</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {recommended.map((product) => (
              <ProductCard key={`recommended-${product.id}`} product={product} compact />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Recently viewed</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Pick up where you left off</h2>
            </div>
            <Link href="/listings" className="text-sm font-black text-teal-700 dark:text-teal-300">View all</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {recentlyViewed.map((product) => (
              <ProductCard key={`recent-${product.id}`} product={product} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="app-container py-16">
        <div className="mb-6 max-w-3xl">
          <p className="eyebrow">Why it works</p>
          <h2 className="section-title mt-2">Designed for campus trust, speed, and repeat buying.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((item) => (
            <div key={item.title} className="group surface-panel rounded-2xl p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-teal-300 hover:shadow-[0_24px_80px_rgba(20,184,166,0.18)] dark:border-white/[0.08] dark:hover:border-teal-300/40 dark:hover:shadow-[0_24px_80px_rgba(20,184,166,0.16)]">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 transition-all duration-300 group-hover:shadow-[0_0_36px_rgba(20,184,166,0.28)] dark:bg-teal-300/10 dark:text-teal-200">
                <BenefitIcon type={item.icon} />
              </div>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-gray-300">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="app-container pb-16">
        <div className="grid gap-6 rounded-2xl border border-slate-200/80 bg-slate-950 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] dark:border-white/[0.08] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-200">Ready when you are</p>
            <h2 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">Turn unused items into campus cash.</h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-gray-300">
              Post a listing, start browsing, or continue from your saved marketplace activity.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href={isSignedIn ? '/listings/new' : '/auth/signin'} className="inline-flex items-center justify-center rounded-xl bg-teal-500 px-4 py-2 text-base font-medium text-white shadow-[0_16px_40px_rgba(20,184,166,0.22)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-teal-400 dark:text-slate-950">
              Sell in 30 sec
            </Link>
            <Link href="/listings" className="inline-flex items-center justify-center rounded-xl bg-teal-500 px-4 py-2 text-base font-medium text-white transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-teal-400 dark:text-slate-950">
              Start Buying
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200/80 bg-white/70 py-8 dark:border-white/10 dark:bg-neutral-950/40">
        <div className="app-container flex flex-col gap-6 text-sm font-medium text-slate-600 dark:text-gray-300 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-black text-slate-950 dark:text-white">CampusMart</p>
            <p className="mt-1">&copy; 2026 CampusMart. All rights reserved.</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <nav className="flex flex-wrap gap-4" aria-label="Footer links">
              <Link href="/listings" className="transition-colors hover:text-teal-700 dark:hover:text-teal-300">About</Link>
              <Link href="/messages" className="transition-colors hover:text-teal-700 dark:hover:text-teal-300">Contact</Link>
              <Link href="/auth/signin" className="transition-colors hover:text-teal-700 dark:hover:text-teal-300">Terms</Link>
            </nav>
            <div className="flex gap-2" aria-label="Social links">
              <a href="https://www.instagram.com" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:text-teal-300" aria-label="Instagram">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <path d="M17.5 6.5h.01" />
                </svg>
              </a>
              <a href="https://www.linkedin.com" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:text-teal-300" aria-label="LinkedIn">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6.94 8.98H3.74V20h3.2V8.98ZM5.34 4a1.86 1.86 0 1 0 0 3.72A1.86 1.86 0 0 0 5.34 4ZM20.25 13.67c0-3.02-1.61-4.43-3.76-4.43a3.24 3.24 0 0 0-2.92 1.61V8.98h-3.08V20h3.2v-5.45c0-1.44.27-2.84 2.06-2.84 1.76 0 1.79 1.65 1.79 2.93V20h3.2l-.49-6.33Z" />
                </svg>
              </a>
              <a href="https://x.com" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-gray-300 dark:hover:text-teal-300" aria-label="X">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.54 3h3.07l-6.7 7.66L21.8 21h-6.17l-4.83-6.32L5.27 21H2.2l7.17-8.2L1.8 3h6.33l4.37 5.78L17.54 3Zm-1.08 16.18h1.7L7.2 4.72H5.38l11.08 14.46Z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

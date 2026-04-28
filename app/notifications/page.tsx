import { Metadata } from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import NotificationCenter from '@/components/notifications/notification-center';
import Header from '@/components/header';

export const metadata: Metadata = { title: 'Notifications - CampusMart' };

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');

  return (
    <div className="app-shell">
      <Header />
      <main className="py-10 sm:py-16">
        <div className="app-container space-y-8">
          <div className="surface-panel p-7 sm:p-10">
            <Link href="/" className="mb-6 inline-flex text-sm font-bold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-200">Home</Link>
            <p className="eyebrow">Notifications</p>
            <h1 className="section-title mt-3">Your Updates</h1>
            <p className="muted-copy mt-4 text-lg">Stay informed on messages, bids, approvals, and listing activity.</p>
          </div>

          <div className="surface-panel overflow-hidden">
            <div className="border-b border-slate-200/80 bg-white/70 px-6 py-5 dark:border-white/10 dark:bg-white/[0.03]">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">All Notifications</h2>
            </div>
            <NotificationCenter />
          </div>
        </div>
      </main>
    </div>
  );
}

import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import ListingApprovals from '@/components/admin/listing-approvals';
import ReportReviews from '@/components/admin/report-reviews';
import AnalyticsDashboard from '@/components/admin/analytics-dashboard';
import Header from '@/components/header';

export const metadata: Metadata = { title: 'Admin Dashboard - CampusMart' };

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');

  const u = session.user as any;
  if (u.role !== 'admin' && u.email !== 'admin@campusmart.com' && u.id !== 'admin-fallback') redirect('/listings');

  const Section = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
    <div className="surface-panel overflow-hidden">
      <div className="border-b border-slate-200/80 bg-white/70 px-7 py-6 dark:border-white/10 dark:bg-white/[0.03] sm:px-8">
        <h2 className="text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <div className="p-7 sm:p-8">{children}</div>
    </div>
  );

  return (
    <div className="app-shell">
      <Header />
      <main className="py-10 sm:py-16">
        <div className="app-container space-y-8">
          <div className="surface-panel p-7 sm:p-10">
            <p className="eyebrow">Admin</p>
            <h1 className="section-title mt-3">Admin Dashboard</h1>
            <p className="muted-copy mt-4 max-w-2xl text-lg leading-8">Moderate listings, review reports, manage community safety, and monitor platform analytics.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { label: 'Analytics', detail: 'Platform health and activity' },
              { label: 'Approvals', detail: 'Pending listings to review' },
              { label: 'Reports', detail: 'Community safety queue' },
            ].map((item) => (
              <div key={item.label} className="elevated-card p-6">
                <div className="mb-4 h-1.5 w-14 rounded-full bg-teal-600 dark:bg-teal-300" />
                <h3 className="text-lg font-black text-slate-950 dark:text-white">{item.label}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>

          <Section title="Analytics Dashboard" subtitle="Monitor platform metrics and user activity">
            <AnalyticsDashboard />
          </Section>

          <Section title="Pending Approvals" subtitle="Review and approve submitted listings">
            <ListingApprovals />
          </Section>

          <Section title="Community Reports" subtitle="Review and manage reported content">
            <ReportReviews />
          </Section>
        </div>
      </main>
    </div>
  );
}

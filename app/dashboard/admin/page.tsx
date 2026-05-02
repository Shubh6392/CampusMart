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

  const Section = ({ id, title, subtitle, children }: { id: string; title: string; subtitle: string; children: React.ReactNode }) => (
    <section id={id} className="surface-panel scroll-mt-24 overflow-hidden">
      <div className="border-b border-slate-200/80 bg-white/70 px-7 py-6 dark:border-white/10 dark:bg-white/[0.03] sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Admin queue</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{title}</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-7 sm:p-9">{children}</div>
    </section>
  );

  return (
    <div className="app-shell">
      <Header />
      <main className="py-8 sm:py-12">
        <div className="app-container space-y-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Admin command center</p>
              <h1 className="section-title mt-3">Dashboard</h1>
              <p className="muted-copy mt-3 max-w-2xl">Review risks, approve marketplace activity, and jump straight into the queues that need attention.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="#approvals" className="btn-primary">Review Listings</a>
              <a href="#reports" className="btn-secondary">View Reports</a>
            </div>
          </div>

          <Section id="analytics" title="Platform Overview" subtitle="Priority signals, trends, and admin actions">
            <AnalyticsDashboard />
          </Section>

          <Section id="approvals" title="Pending Approvals" subtitle="Search, sort, approve, or reject submitted listings">
            <ListingApprovals />
          </Section>

          <Section id="reports" title="Community Reports" subtitle="Triage reported listings and close the safety queue">
            <ReportReviews />
          </Section>
        </div>
      </main>
    </div>
  );
}

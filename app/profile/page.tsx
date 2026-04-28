import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export default async function ProfileRedirectPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  if (session.user.id === 'admin-fallback' || session.user.role === 'admin') {
    redirect('/dashboard/admin');
  }

  redirect(`/users/${session.user.id}`);
}

import { getServerSession as nextGetServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';

export async function getSession() {
  return await nextGetServerSession(authOptions);
}

export async function requireAuth(req: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }
  return session;
}

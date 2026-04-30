import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

const profileUpdateSchema = z.object({
  image: z.string().url().max(500).optional().or(z.literal('')),
  bio: z.string().trim().max(500).optional(),
  phone: z.string().trim().max(32).optional(),
  location: z.string().trim().max(120).optional(),
  availability: z.string().trim().max(160).optional(),
  preferredContact: z.enum(['messages', 'email', 'phone']).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.id === 'admin-fallback') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  const user = await User.findById(session.user.id)
    .select('name email image bio phone location availability preferredContact college domain role status createdAt')
    .lean();

  if (!user) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.id === 'admin-fallback') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = profileUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid profile details', details: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  await connectToDatabase();

  const update = {
    image: parsed.data.image || '',
    bio: parsed.data.bio || '',
    phone: parsed.data.phone || '',
    location: parsed.data.location || '',
    availability: parsed.data.availability || '',
    preferredContact: parsed.data.preferredContact || 'messages',
  };

  const user = await User.findByIdAndUpdate(session.user.id, update, { new: true })
    .select('name email image bio phone location availability preferredContact college domain role status createdAt')
    .lean();

  if (!user) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

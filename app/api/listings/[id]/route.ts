import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Listing from '@/models/Listing';
import { updateListingSchema } from '@/lib/validators/listing';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();
  const listing = await Listing.findById(params.id).lean() as any;
  if (!listing || listing.status !== 'approved') {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }
  if (listing.campus !== session.user.college) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await Listing.findByIdAndUpdate(params.id, { $inc: { views: 1 } });
  return NextResponse.json({ listing });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parseResult = updateListingSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.flatten() }, { status: 422 });
  }

  await connectToDatabase();
  const listing = await Listing.findById(params.id);
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }
  const isOwner = listing.seller.toString() === session.user.id;
  const isAdmin = session.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (parseResult.data.campus && parseResult.data.campus !== session.user.college) {
    return NextResponse.json({ error: 'Campus mismatch' }, { status: 400 });
  }

  Object.assign(listing, { ...parseResult.data });
  await listing.save();
  return NextResponse.json({ listing });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();
  const listing = await Listing.findById(params.id);
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  const isOwner = listing.seller.toString() === session.user.id;
  const isAdmin = session.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await listing.deleteOne();
  return NextResponse.json({ message: 'Listing deleted' }, { status: 200 });
}

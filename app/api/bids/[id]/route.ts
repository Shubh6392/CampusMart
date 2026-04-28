import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Bid from '@/models/Bid';
import Listing from '@/models/Listing';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { status } = body;

  if (!['accepted', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 422 });
  }

  await connectToDatabase();

  const bid = await Bid.findById(params.id).populate('listing') as any;
  if (!bid) {
    return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
  }

  const listing = await Listing.findById(bid.listing._id) as any;
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  if (listing.seller.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Only seller can manage bids' }, { status: 403 });
  }

  bid.status = status;
  await bid.save();

  if (status === 'accepted') {
    await Listing.findByIdAndUpdate(bid.listing, { status: 'sold' });
    await Bid.updateMany(
      { listing: bid.listing, _id: { $ne: bid._id } },
      { status: 'rejected' }
    );
  }

  return NextResponse.json({ bid });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectToDatabase();

  const bid = await Bid.findById(params.id) as any;
  if (!bid) {
    return NextResponse.json({ error: 'Bid not found' }, { status: 404 });
  }

  if (bid.bidder.toString() !== session.user.id && bid.status === 'pending') {
    return NextResponse.json({ error: 'Only bidder can withdraw' }, { status: 403 });
  }

  await bid.deleteOne();
  return NextResponse.json({ message: 'Bid deleted' });
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Bid from '@/models/Bid';
import Listing from '@/models/Listing';
import { createBidSchema } from '@/lib/validators/bid';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const listingId = url.searchParams.get('listingId');

  if (!listingId) {
    return NextResponse.json({ error: 'listingId required' }, { status: 400 });
  }

  await connectToDatabase();

  const bids = await Bid.find({ listing: listingId })
    .populate('bidder', 'name email')
    .sort({ amount: -1 })
    .lean() as any[];

  const highestBid = bids[0] || null;

  return NextResponse.json({ bids, highestBid });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parseResult = createBidSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: parseResult.error.flatten() }, { status: 422 });
  }

  const { listingId, amount } = parseResult.data;

  await connectToDatabase();

  const listing = await Listing.findById(listingId);
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  if (listing.seller.toString() === session.user.id) {
    return NextResponse.json({ error: 'Cannot bid on your own listing' }, { status: 400 });
  }

  const highestBid = await Bid.findOne({ listing: listingId, status: 'pending' })
    .sort({ amount: -1 })
    .lean() as any;

  if (highestBid && amount <= highestBid.amount) {
    return NextResponse.json({ error: 'Bid must be higher than current highest bid' }, { status: 400 });
  }

  const bid = await Bid.create({
    listing: listingId,
    bidder: session.user.id,
    amount,
    status: 'pending'
  });

  return NextResponse.json({ bid }, { status: 201 });
}

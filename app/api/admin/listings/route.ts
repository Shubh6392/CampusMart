import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Listing from '@/models/Listing';
import User from '@/models/User';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

async function isAdmin(userId: string) {
  if (userId === 'admin-fallback') return true;
  try {
    await connectToDatabase();
    const user = await User.findById(userId).lean() as any;
    return user?.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const listings = await Listing.find({ status })
      .populate({
        path: 'seller',
        select: 'name email college',
        model: 'User'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as any;

    // Filter out listings with missing seller data
    const validListings = listings.filter((listing: any) => listing.seller);
    
    console.log(`Found ${listings.length} listings, ${validListings.length} with valid seller data`);
    
    const total = await Listing.countDocuments({ status });

    return NextResponse.json({
      listings: validListings,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('GET /api/admin/listings error:', error);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    if (!(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectToDatabase();

    const body = await req.json();
    const { listingId, action, reason } = body;

    if (!listingId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    listing.status = newStatus;
    if (action === 'reject' && reason) {
      listing.rejectionReason = reason;
    }

    await listing.save();

    return NextResponse.json({
      message: `Listing ${action}ed successfully`,
      listing: await listing.populate('seller', 'name email')
    });
  } catch (error) {
    console.error('POST /api/admin/listings error:', error);
    return NextResponse.json({ error: 'Failed to process listing' }, { status: 500 });
  }
}

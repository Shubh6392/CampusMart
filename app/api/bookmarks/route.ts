import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';
import Listing from '@/models/Listing';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const userId = (session.user as any).id;

    const bookmarks = await Bookmark.find({ user: new mongoose.Types.ObjectId(userId) })
      .populate({
        path: 'listing',
        select: 'title price images category condition campus seller',
        populate: { path: 'seller', select: 'name email' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as any;

    const total = await Bookmark.countDocuments({ user: new mongoose.Types.ObjectId(userId) });

    return NextResponse.json({
      bookmarks,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('GET /api/bookmarks error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { listingId } = await req.json();

    if (!listingId || !mongoose.Types.ObjectId.isValid(listingId)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Check if listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Try to create bookmark (unique constraint prevents duplicates)
    try {
      const bookmark = new Bookmark({
        user: new mongoose.Types.ObjectId(userId),
        listing: new mongoose.Types.ObjectId(listingId)
      });

      await bookmark.save();
      await bookmark.populate('listing', 'title price images');

      return NextResponse.json(bookmark, { status: 201 });
    } catch (error: any) {
      if (error.code === 11000) {
        return NextResponse.json({ error: 'Already bookmarked' }, { status: 409 });
      }
      throw error;
    }
  } catch (error) {
    console.error('POST /api/bookmarks error:', error);
    return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
  }
}

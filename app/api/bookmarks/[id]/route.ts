import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Bookmark from '@/models/Bookmark';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const bookmarkId = params.id;
    if (!mongoose.Types.ObjectId.isValid(bookmarkId)) {
      return NextResponse.json({ error: 'Invalid bookmark ID' }, { status: 400 });
    }

    const userId = (session.user as any).id;

    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    // Verify ownership
    if (bookmark.user.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await Bookmark.findByIdAndDelete(bookmarkId);

    return NextResponse.json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('DELETE /api/bookmarks/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
}

// Alternative: Delete by listing ID instead of bookmark ID
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const userId = (session.user as any).id;
    const listingId = params.id;

    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    const result = await Bookmark.findOneAndDelete({
      user: new mongoose.Types.ObjectId(userId),
      listing: new mongoose.Types.ObjectId(listingId)
    });

    if (!result) {
      return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('POST /api/bookmarks/[id] error:', error);
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}

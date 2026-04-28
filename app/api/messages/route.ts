import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Message from '@/models/Message';
import { createMessageSchema } from '@/lib/validators/chat';
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
    const conversationId = searchParams.get('conversationId');
    const listingId = searchParams.get('listingId');
    const recipientId = searchParams.get('recipientId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!conversationId && !listingId) {
      return NextResponse.json({ error: 'Missing conversationId or listingId' }, { status: 400 });
    }

    let query: any = {};

    if (conversationId) {
      query.conversationId = conversationId;
    } else if (listingId && recipientId) {
      const userId = (session.user as any).id;
      query.listing = new mongoose.Types.ObjectId(listingId);
      query.$or = [
        { from: new mongoose.Types.ObjectId(userId), to: new mongoose.Types.ObjectId(recipientId) },
        { from: new mongoose.Types.ObjectId(recipientId), to: new mongoose.Types.ObjectId(userId) }
      ];
    }

    const messages = await Message.find(query)
      .populate('from', 'name email')
      .populate('to', 'name email')
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean() as any;

    return NextResponse.json(messages);
  } catch (error) {
    console.error('GET /api/messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json();
    const validated = createMessageSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid input', details: validated.error.errors }, { status: 400 });
    }

    const { conversationId, listingId, recipientId, content } = validated.data;
    const userId = (session.user as any).id;

    // Prevent self-messaging
    if (userId === recipientId) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 });
    }

    const message = new Message({
      conversationId,
      from: new mongoose.Types.ObjectId(userId),
      to: new mongoose.Types.ObjectId(recipientId),
      listing: new mongoose.Types.ObjectId(listingId),
      content,
      read: false
    });

    await message.save();
    await message.populate([
      { path: 'from', select: 'name email' },
      { path: 'to', select: 'name email' }
    ]);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('POST /api/messages error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

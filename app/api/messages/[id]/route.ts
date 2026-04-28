import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Message from '@/models/Message';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const messageId = params.id;
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const userId = (session.user as any).id;
    
    // Only recipient can mark as read
    if (message.to.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    message.read = true;
    await message.save();
    await message.populate([
      { path: 'from', select: 'name email' },
      { path: 'to', select: 'name email' }
    ]);

    return NextResponse.json(message);
  } catch (error) {
    console.error('PUT /api/messages/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
  }
}

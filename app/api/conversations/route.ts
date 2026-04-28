import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Message from '@/models/Message';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const userId = (session.user as any).id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get all conversations (unique listing x user pairs)
    const pipeline: any = [
      {
        $match: {
          $or: [{ from: userObjectId }, { to: userObjectId }]
        }
      },
      {
        $group: {
          _id: {
            listing: '$listing',
            other: {
              $cond: [{ $eq: ['$from', userObjectId] }, '$to', '$from']
            }
          },
          lastMessage: { $last: '$content' },
          lastMessageTime: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$to', userObjectId] }, { $eq: ['$read', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { lastMessageTime: -1 }
      },
      {
        $lookup: {
          from: 'listings',
          localField: '_id.listing',
          foreignField: '_id',
          as: 'listing'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.other',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $project: {
          _id: 0,
          listing: { $arrayElemAt: ['$listing', 0] },
          otherUser: { $arrayElemAt: ['$otherUser', 0] },
          lastMessage: 1,
          lastMessageTime: 1,
          unreadCount: 1,
          conversationId: {
            $let: {
              vars: {
                ids: { $sortArray: { input: [{ $toString: '$_id.listing' }, { $toString: '$_id.other' }, { $toString: userObjectId }], sortBy: 1 } }
              },
              in: { $concat: [{ $arrayElemAt: ['$$ids', 0] }, '_', { $arrayElemAt: ['$$ids', 1] }, '_', { $arrayElemAt: ['$$ids', 2] }] }
            }
          }
        }
      }
    ];

    const conversations = await Message.aggregate(pipeline).limit(50) as any;

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('GET /api/conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

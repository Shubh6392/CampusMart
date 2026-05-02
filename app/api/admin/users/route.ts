import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';

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
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminId = (session.user as any).id;
    if (!(await isAdmin(adminId))) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';
    const search = (searchParams.get('search') || '').trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '25'), 100);

    const query: any = {};
    if (['buyer', 'seller', 'admin'].includes(role)) query.role = role;
    if (['active', 'banned'].includes(status)) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('name email college role status createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminId = (session.user as any).id;
    if (!(await isAdmin(adminId))) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const { userId, action, role, message } = body;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (action === 'setRole') {
      if (!['buyer', 'seller', 'admin'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      user.role = role;
      await user.save();
      return NextResponse.json({ message: `Role updated to ${role}`, user });
    }

    if (action === 'setStatus') {
      const nextStatus = user.status === 'banned' ? 'active' : 'banned';
      if (String(user._id) === adminId && nextStatus === 'banned') {
        return NextResponse.json({ error: 'You cannot ban your own admin account' }, { status: 400 });
      }
      user.status = nextStatus;
      await user.save();
      return NextResponse.json({ message: `User ${nextStatus === 'banned' ? 'deactivated' : 'reactivated'}`, user });
    }

    if (action === 'sendWarning') {
      const warning = String(message || '').trim();
      if (!warning) return NextResponse.json({ error: 'Warning message is required' }, { status: 400 });

      await Notification.create({
        user: user._id,
        type: 'listingUpdate',
        payload: {
          title: 'Admin warning',
          message: warning,
          severity: 'warning',
        },
      });

      return NextResponse.json({ message: 'Warning sent' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('PATCH /api/admin/users error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

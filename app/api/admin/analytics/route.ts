import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Listing from '@/models/Listing';
import Bid from '@/models/Bid';
import Message from '@/models/Message';
import Report from '@/models/Report';

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

    // Count statistics
    const totalUsers = await User.countDocuments();
    const buyers = await User.countDocuments({ role: 'buyer' });
    const sellers = await User.countDocuments({ role: 'seller' });
    
    const listings = {
      total: await Listing.countDocuments(),
      pending: await Listing.countDocuments({ status: 'pending' }),
      approved: await Listing.countDocuments({ status: 'approved' }),
      rejected: await Listing.countDocuments({ status: 'rejected' }),
      sold: await Listing.countDocuments({ status: 'sold' })
    };

    const bids = {
      total: await Bid.countDocuments(),
      pending: await Bid.countDocuments({ status: 'pending' }),
      accepted: await Bid.countDocuments({ status: 'accepted' }),
      rejected: await Bid.countDocuments({ status: 'rejected' })
    };

    const totalMessages = await Message.countDocuments();
    const reportStats = {
      total: await Report.countDocuments(),
      open: await Report.countDocuments({ status: 'open' }),
      resolved: await Report.countDocuments({ status: 'resolved' }),
      dismissed: await Report.countDocuments({ status: 'dismissed' })
    };

    // Calculate engagement
    const totalViews = await Listing.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]) as any;

    const avgListingPrice = await Listing.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]) as any;

    return NextResponse.json({
      users: {
        total: totalUsers,
        buyers,
        sellers,
        admins: await User.countDocuments({ role: 'admin' })
      },
      listings,
      bids,
      messages: totalMessages,
      reports: reportStats,
      engagement: {
        totalViews: totalViews[0]?.totalViews || 0,
        avgListingPrice: avgListingPrice[0]?.avgPrice || 0
      }
    });
  } catch (error) {
    console.error('GET /api/admin/analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

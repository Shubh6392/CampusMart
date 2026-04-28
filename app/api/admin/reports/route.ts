import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectToDatabase } from '@/lib/mongodb';
import Report from '@/models/Report';
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
    const status = searchParams.get('status') || 'open';
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    const reports = await Report.find({ status })
      .populate('reportedBy', 'name email')
      .populate('listing', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() as any;

    const total = await Report.countDocuments({ status });

    return NextResponse.json({
      reports,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('GET /api/admin/reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
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
    const { reportId, action, resolution } = body;

    if (!reportId || !['resolve', 'dismiss'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return NextResponse.json({ error: 'Invalid report ID' }, { status: 400 });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const newStatus = action === 'resolve' ? 'resolved' : 'dismissed';
    report.status = newStatus;
    report.resolution = resolution || '';
    report.resolvedAt = new Date();
    report.resolvedBy = new mongoose.Types.ObjectId(userId);

    await report.save();

    return NextResponse.json({
      message: `Report ${newStatus} successfully`,
      report: await report.populate([
        { path: 'reportedBy', select: 'name email' },
        { path: 'listing', select: 'title' }
      ])
    });
  } catch (error) {
    console.error('POST /api/admin/reports error:', error);
    return NextResponse.json({ error: 'Failed to process report' }, { status: 500 });
  }
}

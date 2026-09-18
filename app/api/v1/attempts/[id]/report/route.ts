import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import Attempt from '@/models/Attempt';
import { getAttemptReport } from '@/src/server/reporting/reportService';
import { USER_ROLES } from '@/lib/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: attemptId } = await params;
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.authorized || !authResult.user) {
      return authResult.response!;
    }

    await connectDB();

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    const userId = attempt.user?._id ? attempt.user._id.toString() : attempt.user?.toString();
    const isOwner = userId === authResult.user.userId;
    const isAdmin = authResult.user.role === USER_ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const report = await getAttemptReport(attemptId, isAdmin ? 'admin' : 'candidate');
    if (!report) {
      return NextResponse.json({ error: 'Report not available' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Candidate report API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

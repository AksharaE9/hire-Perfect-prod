import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import { recomputeAttemptReport } from '@/src/server/reporting/reportService';
import { USER_ROLES } from '@/lib/constants';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: attemptId } = await params;
  try {
    const authResult = await authMiddleware(request);
    if (!authResult.authorized || authResult.user?.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json().catch(() => ({}));
    const { notes } = body;

    const report = await recomputeAttemptReport(attemptId, authResult.user.userId, notes);

    return NextResponse.json({
      success: true,
      report,
      message: `Report recomputed successfully as version ${report.meta.reportVersion}`,
    });
  } catch (error: any) {
    console.error('Admin recompute API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

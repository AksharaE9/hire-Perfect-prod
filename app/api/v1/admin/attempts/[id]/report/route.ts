import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';
import { getAttemptReport } from '@/src/server/reporting/reportService';
import AuditLog from '@/models/AuditLog';
import { USER_ROLES } from '@/lib/constants';

export async function GET(
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

    const report = await getAttemptReport(attemptId, 'admin');
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Write audit log
    await AuditLog.create({
      userId: authResult.user.userId,
      action: 'admin_read_report',
      attemptId,
      metadata: { reportVersion: report.meta.reportVersion },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Admin report API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

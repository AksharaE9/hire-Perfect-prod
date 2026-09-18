import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AttemptReport from '@/Backend/models/AttemptReport';
import AuditLog from '@/Backend/models/AuditLog';
import { authMiddleware } from '@/middleware/auth';
import { USER_ROLES } from '@/lib/constants';
import mongoose from 'mongoose';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await authMiddleware(request);
    if (!authResult.authorized || authResult.user?.role !== USER_ROLES.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { reviewerNotes, markReviewed } = body;

    const report = await AttemptReport.findOne({ attempt: id, isCurrent: true });
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (reviewerNotes !== undefined) {
      report.reviewerNotes = reviewerNotes;
    }
    if (markReviewed) {
      report.reviewedBy = new mongoose.Types.ObjectId(authResult.user.userId);
      report.reviewedAt = new Date();
    }

    await report.save();

    await AuditLog.create({
      userId: authResult.user.userId,
      action: 'mark_reviewed',
      attemptId: report.attempt,
      reportId: report._id,
      metadata: { markReviewed, notesLength: reviewerNotes?.length || 0 },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      report: {
        id: report._id,
        reviewerNotes: report.reviewerNotes,
        reviewedBy: report.reviewedBy,
        reviewedAt: report.reviewedAt,
      },
    });
  } catch (error: any) {
    console.error('Error saving review notes:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

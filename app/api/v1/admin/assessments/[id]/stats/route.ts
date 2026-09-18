import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AssessmentStats from '@/models/AssessmentStats';
import { refreshAssessmentStats } from '@/src/server/reporting/reportService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assessmentId } = await params;
  try {
    await connectDB();

    let stats = await AssessmentStats.findOne({ assessment: assessmentId });
    if (!stats) {
      await refreshAssessmentStats(assessmentId);
      stats = await AssessmentStats.findOne({ assessment: assessmentId });
    }

    return NextResponse.json({
      success: true,
      stats: stats || {
        completedCount: 0,
        meanPercent: 0,
        medianPercent: 0,
        stddevPercent: 0,
        p25: 0,
        p50: 0,
        p75: 0,
        p90: 0,
      },
    });
  } catch (error: any) {
    console.error('Assessment stats API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>HirePerfect Assessment Report — ${report.meta.assessmentName} — ${report.meta.candidateName}</title>
  <style>
    @page { size: A4; margin: 16mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #14203A; margin: 0; padding: 24px; font-size: 13px; line-height: 1.5; background: #FFF; }
    .header { border-bottom: 2px solid #E2E8F0; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .logo { font-size: 18px; font-weight: 800; color: #2B46D1; letter-spacing: -0.5px; }
    .title { font-size: 24px; font-weight: 800; margin: 8px 0 4px; }
    .meta-tag { font-size: 11px; color: #64748B; }
    .score-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-around; text-align: center; }
    .score-val { font-size: 28px; font-weight: 800; color: #14203A; }
    .score-label { font-size: 10px; text-transform: uppercase; color: #64748B; font-weight: 600; }
    .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #14203A; border-bottom: 1px solid #E2E8F0; padding-bottom: 6px; margin: 20px 0 12px; }
    .topic-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #E2E8F0; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; }
    .badge-clean { background: #E6F4EA; color: #137333; }
    .badge-review { background: #FEF7E0; color: #B06000; }
    .badge-flagged { background: #FCE8E6; color: #C5221F; }
    .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #E2E8F0; font-size: 10px; color: #94A3B8; display: flex; justify-content: space-between; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">HIREPERFECT · OFFICIAL ASSESSMENT REPORT</div>
      <div class="title">${report.meta.assessmentName}</div>
      <div class="meta-tag">Category: ${report.meta.categoryName} · Candidate: <strong>${report.meta.candidateName}</strong></div>
    </div>
    <div style="text-align: right;">
      <div class="badge ${report.integrity.tier === 'clean' ? 'badge-clean' : 'badge-review'}">
        Integrity: ${report.integrity.tier.toUpperCase()}
      </div>
      <div class="meta-tag" style="margin-top: 6px;">Submitted: ${new Date(report.meta.submittedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
    </div>
  </div>

  <div class="score-box">
    <div>
      <div class="score-val">${report.score.rawScore} / ${report.score.maxScore}</div>
      <div class="score-label">Raw Score</div>
    </div>
    <div>
      <div class="score-val">${report.score.percentage}%</div>
      <div class="score-label">Percentage (${report.score.band.label})</div>
    </div>
    <div>
      <div class="score-val">${Math.floor(report.timing.totalSeconds / 60)}m ${report.timing.totalSeconds % 60}s</div>
      <div class="score-label">Time Used</div>
    </div>
    <div>
      <div class="score-val">${report.integrity.events.length}</div>
      <div class="score-label">Flags Logged</div>
    </div>
  </div>

  <div class="section-title">Topic Breakdown</div>
  ${
    report.topics.available
      ? report.topics.items
          .map(
            (t) => `
    <div class="topic-row">
      <span>${t.name}</span>
      <span>${t.lowConfidence ? `${t.correct}/${t.questionCount} correct (Low Sample)` : `${t.percentage}% (${t.correct}/${t.questionCount})`}</span>
    </div>
  `
          )
          .join('')
      : '<p style="color: #64748B;">Topic breakdown not available.</p>'
  }

  <div class="section-title">Timing & Response Pacing</div>
  <p style="margin: 4px 0;">Median response time: <strong>${Math.round(report.timing.medianSecondsPerQuestion)}s per question</strong>.</p>
  <ul>
    ${report.timing.observations.map((obs) => `<li>${obs}</li>`).join('')}
  </ul>

  <div class="section-title">Integrity Record (GuardEye AI)</div>
  <p style="margin: 4px 0;">${report.integrity.summaryLine}</p>
  ${
    report.integrity.events.length > 0
      ? `
    <ul>
      ${report.integrity.events
        .map(
          (e) => `<li>[${new Date(e.startedAt).toLocaleTimeString('en-IN')}] ${e.label} (${e.severity.toUpperCase()})</li>`
        )
        .join('')}
    </ul>
  `
      : '<p style="color: #137333; font-weight: 600;">Zero flags logged during session.</p>'
  }

  <div class="section-title">Reliability & Evidentiary Limits</div>
  <p style="font-size: 11px; color: #64748B;">${report.reliability.statement}</p>
  ${
    report.reliability.caveats.length > 0
      ? `<ul style="font-size: 11px; color: #64748B;">${report.reliability.caveats.map((c) => `<li>${c}</li>`).join('')}</ul>`
      : ''
  }

  <div class="footer">
    <span>Attempt ID: ${report.meta.attemptId} · Report v${report.meta.reportVersion} · Engine v${report.meta.scoringEngineVersion}</span>
    <span>Generated by HirePerfect Evaluation Authority</span>
  </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Report PDF route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

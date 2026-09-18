import connectDB from '@/lib/db';
import Attempt from '@/models/Attempt';
import Question from '@/models/Question';
import Violation from '@/models/Violation';
import ScoringConfig, { DEFAULT_SCORING_CONFIG_VALUES, IScoringConfig } from '@/models/ScoringConfig';
import AttemptReport, { IAttemptReport } from '@/models/AttemptReport';
import AttemptAnswer from '@/models/AttemptAnswer';
import AssessmentStats from '@/models/AssessmentStats';
import Topic from '@/models/Topic';
import AuditLog from '@/models/AuditLog';
import { buildReport } from './buildReport';
import { AttemptInput, AttemptReport as AttemptReportType, SCORING_ENGINE_VERSION } from './types';

export async function generateAndSaveReport(
  attemptId: string,
  options: {
    generatedBy?: 'system' | 'recompute' | 'backfill';
    reviewerNotes?: string;
    reviewedBy?: string;
    overrideConfigVersion?: number;
  } = {}
): Promise<AttemptReportType> {
  await connectDB();

  const attempt = await Attempt.findById(attemptId)
    .populate('assessment')
    .populate('user', 'name email')
    .populate('violations');

  if (!attempt) {
    throw new Error(`Attempt ${attemptId} not found`);
  }

  // 1. Load active or requested ScoringConfig
  let configDoc: IScoringConfig | null = null;
  if (options.overrideConfigVersion) {
    configDoc = await ScoringConfig.findOne({ version: options.overrideConfigVersion });
  }
  if (!configDoc) {
    configDoc = await ScoringConfig.findOne().sort({ version: -1 });
  }
  if (!configDoc) {
    configDoc = await ScoringConfig.create(DEFAULT_SCORING_CONFIG_VALUES);
  }

  // 2. Load Questions in preserved order
  const questionIds = attempt.questions || [];
  const dbQuestions = await Question.find({ _id: { $in: questionIds } });
  const questionMap = new Map(dbQuestions.map((q) => [q._id.toString(), q]));

  const orderedQuestions = questionIds
    .map((qId: any) => questionMap.get(qId.toString()))
    .filter(Boolean) as any[];

  // 3. Load or Reconstruct AttemptAnswers
  let dbAnswers = await AttemptAnswer.find({ attempt: attemptId }).sort({ positionShown: 1 });

  let dataCompleteness: 'full' | 'partial' = 'full';

  // If no granular AttemptAnswers exist (legacy attempt), reconstruct from attempt.answers
  if (dbAnswers.length === 0 && Array.isArray(attempt.answers) && attempt.answers.length > 0) {
    dataCompleteness = 'partial';
    const legacyMap = new Map(attempt.answers.map((a: any) => [a.question.toString(), a]));
    const reconstructed = [];

    for (let idx = 0; idx < orderedQuestions.length; idx++) {
      const q = orderedQuestions[idx];
      const leg = legacyMap.get(q._id.toString());
      const selectedOption = leg ? leg.answer : null;
      const isCorrect = selectedOption !== null && Number(selectedOption) === Number(q.correctAnswer);

      const ansDoc = new AttemptAnswer({
        attempt: attempt._id,
        question: q._id,
        positionShown: idx + 1,
        selectedOption,
        isCorrect,
        marksAwarded: isCorrect ? q.points : 0,
        firstSeenAt: attempt.startedAt,
        answeredAt: attempt.completedAt || attempt.startedAt,
        secondsSpent: Math.round((attempt.timeSpent || 0) / Math.max(1, orderedQuestions.length)),
        timingUnreliable: false,
        changeCount: 0,
        previousOptions: [],
        wasReached: true,
        wasFlaggedForReview: false,
      });
      reconstructed.push(ansDoc);
    }
    // Bulk insert reconstructed
    if (reconstructed.length > 0) {
      await AttemptAnswer.insertMany(reconstructed).catch(() => {});
      dbAnswers = reconstructed as any;
    }
  }

  // 4. Load Assessment Cohort Stats
  const assessmentId =
    attempt.assessment?._id ||
    attempt.assessment ||
    new (await import('mongoose')).default.Types.ObjectId('000000000000000000000000');
  const assessmentStats = await AssessmentStats.findOne({ assessment: assessmentId });

  // 5. Load Topic Focus Areas
  const categorySlug = (attempt.assessment as any)?.category || '';
  const topics = await Topic.find({ categorySlug });
  const focusAreaMap: Record<string, string[]> = {};
  for (const t of topics) {
    focusAreaMap[t.slug] = t.focusAreas;
    focusAreaMap[t.name] = t.focusAreas;
  }

  // 6. Build AttemptInput
  const assessmentName = (attempt.assessment as any)?.title || 'Assessment';
  const categoryName = (attempt.assessment as any)?.categoryName || categorySlug || 'General';
  const candidateName = (attempt.user as any)?.name || 'Candidate';
  const userId =
    (attempt.user as any)?._id ||
    attempt.user ||
    new (await import('mongoose')).default.Types.ObjectId('000000000000000000000000');

  const input: AttemptInput = {
    attemptId: attempt._id.toString(),
    assessmentId: assessmentId.toString(),
    assessmentName,
    categoryName,
    candidateName,
    candidateId: userId.toString(),
    startedAt: attempt.startedAt || new Date(),
    submittedAt: attempt.completedAt || new Date(),
    durationLimitSeconds: attempt.duration || 3000,
    totalSessionSeconds: attempt.timeSpent || 0,
    wasAutoSubmitted: attempt.status === 'terminated' || false,
    status: attempt.status,
    questions: orderedQuestions.map((q, idx) => ({
      id: q._id.toString(),
      position: idx + 1,
      text: q.question,
      options: q.options || [],
      correctAnswer: Number(q.correctAnswer),
      points: q.points || 1,
      difficulty: q.difficulty || 'medium',
      topicId: q.tags?.[0]?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      topicName: q.tags?.[0],
      tags: q.tags || [],
    })),
    answers: dbAnswers.map((a) => ({
      questionId: a.question.toString(),
      positionShown: a.positionShown,
      selectedOption: a.selectedOption,
      firstSeenAt: a.firstSeenAt,
      answeredAt: a.answeredAt,
      secondsSpent: a.secondsSpent,
      timingUnreliable: a.timingUnreliable,
      changeCount: a.changeCount,
      previousOptions: a.previousOptions,
      wasReached: a.wasReached,
      wasFlaggedForReview: a.wasFlaggedForReview,
    })),
    proctoringEvents: (attempt.violations || []).map((v: any) => ({
      id: v._id?.toString(),
      type: v.type,
      startedAt: v.timestamp,
      durationSeconds: v.metadata?.durationSeconds || 0,
      severity: v.severity || 'medium',
      description: v.description,
      metadata: v.metadata,
    })),
    cohortStats: assessmentStats
      ? {
          completedCount: assessmentStats.completedCount,
          meanPercent: assessmentStats.meanPercent,
          medianPercent: assessmentStats.medianPercent,
          stddevPercent: assessmentStats.stddevPercent,
          p25: assessmentStats.p25,
          p50: assessmentStats.p50,
          p75: assessmentStats.p75,
          p90: assessmentStats.p90,
        }
      : null,
    topicFocusAreaMap: focusAreaMap,
    reportVersion: 1,
    dataCompleteness,
  };

  // 7. Find previous reports for versioning
  const existingReports = await AttemptReport.find({ attempt: attemptId }).sort({ reportVersion: -1 });
  const nextVersion = existingReports.length > 0 ? existingReports[0].reportVersion + 1 : 1;
  input.reportVersion = nextVersion;

  // 8. Generate Pure Report
  const reportPayload = buildReport(input, configDoc.toObject ? configDoc.toObject() : (configDoc as any));

  // 9. Persist Immutable AttemptReport
  const newReportDoc = await AttemptReport.create({
    attempt: attempt._id,
    user: (attempt.user as any)?._id || attempt.user,
    assessment: assessmentId,
    reportVersion: nextVersion,
    scoringConfigVersion: configDoc.version,
    scoringEngineVersion: SCORING_ENGINE_VERSION,
    payload: reportPayload,
    cohortSnapshot: input.cohortStats || undefined,
    dataCompleteness,
    generatedAt: new Date(),
    generatedBy: options.generatedBy || 'system',
    reviewerNotes: options.reviewerNotes || '',
    reviewedBy: options.reviewedBy,
    reviewedAt: options.reviewedBy ? new Date() : undefined,
    isCurrent: true,
  });

  // 10. Supersede previous reports
  if (existingReports.length > 0) {
    await AttemptReport.updateMany(
      { attempt: attemptId, _id: { $ne: (newReportDoc as any)._id } },
      { isCurrent: false, supersededBy: (newReportDoc as any)._id }
    );
  }

  // 11. Refresh Cohort Statistics for Assessment
  await refreshAssessmentStats(assessmentId.toString());

  return reportPayload;
}

export async function getAttemptReport(
  attemptId: string,
  userRole: 'admin' | 'candidate' = 'candidate'
): Promise<AttemptReportType | null> {
  await connectDB();

  let reportDoc = await AttemptReport.findOne({ attempt: attemptId, isCurrent: true });

  // If no report generated yet, generate one automatically
  if (!reportDoc) {
    try {
      const generated = await generateAndSaveReport(attemptId, { generatedBy: 'system' });
      return sanitizeReportForRole(generated, userRole);
    } catch (err) {
      console.error('Auto-generate report error:', err);
      return null;
    }
  }

  const payload = reportDoc.payload as AttemptReportType;
  return sanitizeReportForRole(payload, userRole);
}

function sanitizeReportForRole(
  report: AttemptReportType,
  userRole: 'admin' | 'candidate'
): AttemptReportType {
  if (userRole === 'admin') {
    return report;
  }

  const revealAnswers = report.score.methodology.difficultyWeighted !== undefined; // Config flag check
  const sanitizedQuestions = report.questions.map((q) => {
    const { correctOptionIndex, correctOptionLabel, ...rest } = q;
    return rest as any;
  });

  return {
    ...report,
    questions: sanitizedQuestions,
  };
}

export async function recomputeAttemptReport(
  attemptId: string,
  adminUserId: string,
  notes?: string
): Promise<AttemptReportType> {
  await connectDB();

  const report = await generateAndSaveReport(attemptId, {
    generatedBy: 'recompute',
    reviewedBy: adminUserId,
    reviewerNotes: notes,
  });

  await AuditLog.create({
    userId: adminUserId,
    action: 'recompute_report',
    attemptId,
    metadata: { reportVersion: report.meta.reportVersion },
  });

  return report;
}

export async function refreshAssessmentStats(assessmentId: string): Promise<void> {
  await connectDB();

  const completedAttempts = await Attempt.find({
    assessment: assessmentId,
    status: 'completed',
  }).select('percentage');

  const count = completedAttempts.length;
  if (count === 0) return;

  const percentages = completedAttempts.map((a) => a.percentage || 0).sort((a, b) => a - b);
  const sum = percentages.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;

  const variance =
    percentages.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const stddev = Math.sqrt(variance);

  const getPercentileValue = (p: number) => {
    const idx = Math.floor((p / 100) * (count - 1));
    return Number(percentages[idx].toFixed(1));
  };

  const p25 = getPercentileValue(25);
  const p50 = getPercentileValue(50);
  const p75 = getPercentileValue(75);
  const p90 = getPercentileValue(90);

  await AssessmentStats.findOneAndUpdate(
    { assessment: assessmentId },
    {
      assessment: assessmentId,
      completedCount: count,
      meanPercent: Number(mean.toFixed(1)),
      medianPercent: p50,
      stddevPercent: Number(stddev.toFixed(1)),
      p25,
      p50,
      p75,
      p90,
      lastCalculatedAt: new Date(),
    },
    { upsert: true, returnDocument: 'after' }
  );
}

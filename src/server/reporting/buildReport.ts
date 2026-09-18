import {
  AttemptInput,
  ScoringConfigRule,
  AttemptReport,
  SCORING_ENGINE_VERSION,
} from './types';
import { scoreAttempt } from './scoreAttempt';
import { computeTopicBreakdown } from './topicBreakdown';
import { computeTimingAnalysis } from './timingAnalysis';
import { computeIntegritySummary } from './integritySummary';
import { computeCohortComparison } from './cohortComparison';
import { computeReliability } from './reliability';
import { computeRecommendations } from './recommendations';

export function buildReport(
  input: AttemptInput,
  config: ScoringConfigRule
): AttemptReport {
  const {
    attemptId,
    assessmentId,
    assessmentName,
    categoryName,
    candidateName,
    submittedAt,
    startedAt,
    durationLimitSeconds,
    totalSessionSeconds,
    wasAutoSubmitted,
    questions,
    answers,
    reportVersion = 1,
    dataCompleteness = 'full',
  } = input;

  const score = scoreAttempt(input, config);
  const topics = computeTopicBreakdown(input, config);
  const timing = computeTimingAnalysis(input, config);
  const integrity = computeIntegritySummary(input, config);
  const comparison = computeCohortComparison(score.percentage, input, config);
  const reliability = computeReliability(input, config, topics, comparison, timing, integrity);
  const recommendations = computeRecommendations(topics, input.topicFocusAreaMap);

  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  const questionItems: AttemptReport['questions'] = questions.map((q, idx) => {
    const a = answerMap.get(q.id);

    const isAnswered =
      a !== undefined &&
      a.selectedOption !== null &&
      a.selectedOption !== undefined &&
      a.selectedOption !== '';
    const wasReached = a ? a.wasReached !== false : false;

    const selectedIdx = isAnswered ? Number(a!.selectedOption) : null;
    const selectedLabel =
      selectedIdx !== null && q.options && q.options[selectedIdx] !== undefined
        ? q.options[selectedIdx]
        : null;

    const correctIdx = Number(q.correctAnswer);
    const correctLabel =
      q.options && q.options[correctIdx] !== undefined ? q.options[correctIdx] : '';

    const isCorrect = isAnswered && selectedIdx === correctIdx;

    return {
      position: idx + 1,
      questionId: q.id,
      topicName: q.topicName || (q.tags && q.tags.length > 0 ? q.tags[0] : 'General'),
      difficulty: q.difficulty || 'medium',
      questionText: q.text,
      selectedOptionIndex: selectedIdx,
      selectedOptionLabel: selectedLabel,
      correctOptionIndex: correctIdx,
      correctOptionLabel: correctLabel,
      isCorrect,
      isAnswered,
      wasReached,
      secondsSpent: a?.secondsSpent ?? 0,
      changeCount: a?.changeCount ?? 0,
      timingUnreliable: Boolean(a?.timingUnreliable),
    };
  });

  const submittedIso = submittedAt
    ? typeof submittedAt === 'string'
      ? submittedAt
      : new Date(submittedAt).toISOString()
    : new Date().toISOString();

  return {
    meta: {
      attemptId,
      assessmentId,
      assessmentName,
      categoryName,
      candidateName,
      submittedAt: submittedIso,
      durationSeconds: totalSessionSeconds,
      timeLimitSeconds: durationLimitSeconds,
      wasAutoSubmitted,
      reportVersion,
      scoringConfigVersion: config.version,
      scoringEngineVersion: SCORING_ENGINE_VERSION,
      dataCompleteness,
    },
    score,
    topics,
    timing,
    comparison,
    integrity,
    questions: questionItems,
    reliability,
    recommendations,
  };
}

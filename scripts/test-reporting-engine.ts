import assert from 'assert';
import { scoreAttempt } from '../src/server/reporting/scoreAttempt';
import { computeTopicBreakdown } from '../src/server/reporting/topicBreakdown';
import { computeTimingAnalysis } from '../src/server/reporting/timingAnalysis';
import { computeIntegritySummary } from '../src/server/reporting/integritySummary';
import { computeCohortComparison } from '../src/server/reporting/cohortComparison';
import { computeReliability } from '../src/server/reporting/reliability';
import { computeRecommendations } from '../src/server/reporting/recommendations';
import { buildReport } from '../src/server/reporting/buildReport';
import { defaultScoringConfig, AttemptInput, QuestionData, AnswerData, ScoringConfigRule } from '../src/server/reporting/types';

console.log('====================================================');
console.log('🧪 HirePerfect Detailed Scoring Engine Test Suite');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ ${name}`);
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

const mockBaseInput = (questionCount: number = 10): AttemptInput => {
  const questions: QuestionData[] = Array.from({ length: questionCount }, (_, i) => ({
    id: `q_${i + 1}`,
    position: i + 1,
    text: `Question ${i + 1}`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0,
    points: 1,
    difficulty: 'medium',
    topicId: `topic_${(i % 3) + 1}`,
    topicName: `Topic ${(i % 3) + 1}`,
  }));

  const answers: AnswerData[] = Array.from({ length: questionCount }, (_, i) => ({
    questionId: `q_${i + 1}`,
    positionShown: i + 1,
    selectedOption: 0,
    firstSeenAt: new Date(1000 * i * 30),
    answeredAt: new Date(1000 * (i * 30 + 15)),
    secondsSpent: 15,
    timingUnreliable: false,
    changeCount: 0,
    wasReached: true,
  }));

  return {
    attemptId: 'att_test_1',
    assessmentId: 'ass_test_1',
    assessmentName: 'React Developer Assessment',
    categoryName: 'Frontend Development',
    candidateName: 'Jane Candidate',
    startedAt: new Date('2026-03-01T10:00:00Z'),
    submittedAt: new Date('2026-03-01T10:15:00Z'),
    durationLimitSeconds: 1800,
    totalSessionSeconds: 900,
    wasAutoSubmitted: false,
    status: 'completed',
    questions,
    answers,
    proctoringEvents: [],
    cohortStats: null,
    topicFocusAreaMap: {
      'Topic 1': ['Component Lifecycle', 'Hooks'],
      'Topic 2': ['State Management', 'Redux'],
    },
    reportVersion: 1,
    dataCompleteness: 'full',
  };
};

// -------------------------------------------------------------
// 1. UNIT TESTS: Pure Calculators
// -------------------------------------------------------------
console.log('--- 1. Pure Calculator Unit Tests ---');

test('scoreAttempt: All 10 correct answers produce 100% and Expert band', () => {
  const input = mockBaseInput(10);
  const res = scoreAttempt(input, defaultScoringConfig);
  assert.strictEqual(res.rawScore, 10);
  assert.strictEqual(res.maxScore, 10);
  assert.strictEqual(res.percentage, 100);
  assert.strictEqual(res.band.key, 'expert');
  assert.strictEqual(res.passed, true);
  assert.strictEqual(res.counts.correct, 10);
  assert.strictEqual(res.counts.incorrect, 0);
  assert.strictEqual(res.counts.unanswered, 0);
  assert.strictEqual(res.counts.notReached, 0);
});

test('scoreAttempt: All 10 incorrect answers produce 0% and Foundational band', () => {
  const input = mockBaseInput(10);
  input.answers.forEach((a) => {
    a.selectedOption = 1; // Wrong answer (correct is 0)
  });
  const res = scoreAttempt(input, defaultScoringConfig);
  assert.strictEqual(res.rawScore, 0);
  assert.strictEqual(res.maxScore, 10);
  assert.strictEqual(res.percentage, 0);
  assert.strictEqual(res.band.key, 'foundational');
  assert.strictEqual(res.passed, false);
  assert.strictEqual(res.counts.incorrect, 10);
});

test('scoreAttempt: 5 correct, 3 incorrect, 1 unanswered, 1 not reached', () => {
  const input = mockBaseInput(10);
  // Q1-5 correct
  // Q6-8 incorrect
  for (let i = 5; i < 8; i++) input.answers[i].selectedOption = 1;
  // Q9 unanswered but reached
  input.answers[8].selectedOption = null;
  input.answers[8].wasReached = true;
  // Q10 not reached
  input.answers[9].selectedOption = null;
  input.answers[9].wasReached = false;

  const res = scoreAttempt(input, defaultScoringConfig);
  assert.strictEqual(res.rawScore, 5);
  assert.strictEqual(res.maxScore, 10);
  assert.strictEqual(res.percentage, 50);
  assert.strictEqual(res.band.key, 'foundational');
  assert.strictEqual(res.passed, false);
  assert.strictEqual(res.counts.correct, 5);
  assert.strictEqual(res.counts.incorrect, 3);
  assert.strictEqual(res.counts.unanswered, 1);
  assert.strictEqual(res.counts.notReached, 1);
});

test('scoreAttempt: Fallback to flat marks when difficulty weighting enabled on untagged questions', () => {
  const input = mockBaseInput(5);
  delete (input.questions[0] as any).difficulty; // 1 untagged question

  const configWithWeighting: ScoringConfigRule = {
    ...defaultScoringConfig,
    difficultyWeighting: true,
  };

  const res = scoreAttempt(input, configWithWeighting);
  assert.strictEqual(res.weightedPercentage, null);
  assert.strictEqual(res.weightingSkippedReason, 'untagged_questions');
  assert.strictEqual(res.percentage, 100);
});

test('topicBreakdown: Topics with < minQuestionsPerTopic (4) suppress percentage and set lowConfidence', () => {
  const input = mockBaseInput(6);
  // Assign 4 questions to Topic A, 2 questions to Topic B
  input.questions[0].topicId = 'top_a';
  input.questions[0].topicName = 'Topic A';
  input.questions[1].topicId = 'top_a';
  input.questions[1].topicName = 'Topic A';
  input.questions[2].topicId = 'top_a';
  input.questions[2].topicName = 'Topic A';
  input.questions[3].topicId = 'top_a';
  input.questions[3].topicName = 'Topic A';
  input.questions[4].topicId = 'top_b';
  input.questions[4].topicName = 'Topic B';
  input.questions[5].topicId = 'top_b';
  input.questions[5].topicName = 'Topic B';

  // Topic A: 4 of 4 correct (100%)
  // Topic B: 2 of 2 correct (100% raw, but sample < 4)
  const res = computeTopicBreakdown(input, defaultScoringConfig);
  assert.strictEqual(res.available, true);

  const topicA = res.items.find((t) => t.name === 'Topic A')!;
  const topicB = res.items.find((t) => t.name === 'Topic B')!;

  assert.strictEqual(topicA.percentage, 100);
  assert.strictEqual(topicA.lowConfidence, false);
  assert.strictEqual(topicB.percentage, null);
  assert.strictEqual(topicB.lowConfidence, true);
  assert.strictEqual(topicB.suppressedReason, 'Too few questions (2 of 4 required) to provide a reliable percentage score.');
  assert.deepStrictEqual(res.strengths, ['Topic A']);
});

test('cohortComparison: Percentile suppressed when cohort < 30', () => {
  const input = mockBaseInput(10);
  input.cohortStats = {
    completedCount: 14,
    meanPercent: 70,
    medianPercent: 72,
    stddevPercent: 8,
    p25: 64,
    p50: 72,
    p75: 80,
    p90: 88,
  };

  const res = computeCohortComparison(80, input, defaultScoringConfig);
  assert.strictEqual(res.available, false);
  assert.strictEqual(res.percentile, null);
  assert.strictEqual(res.cohortCount, 14);
  assert.strictEqual(res.unavailableReason, 'Not enough completed attempts yet to compare this score (14 attempts recorded; 30 required).');
});

test('cohortComparison: Percentile computed when cohort >= 30', () => {
  const input = mockBaseInput(10);
  input.cohortStats = {
    completedCount: 60,
    meanPercent: 70,
    medianPercent: 72,
    stddevPercent: 10,
    p25: 62,
    p50: 72,
    p75: 80,
    p90: 90,
  };

  const res = computeCohortComparison(80, input, defaultScoringConfig);
  assert.strictEqual(res.available, true);
  assert.strictEqual(res.cohortCount, 60);
  assert.strictEqual(typeof res.percentile, 'number');
  assert.strictEqual(res.percentile, 84); // Z=(80-70)/10 = 1.0 -> 84th percentile
});

test('integritySummary: Clean session with 0 flagged events', () => {
  const input = mockBaseInput(10);
  input.proctoringEvents = [];
  const res = computeIntegritySummary(input, defaultScoringConfig);
  assert.strictEqual(res.tier, 'clean');
  assert.strictEqual(res.events.length, 0);
  assert.strictEqual(res.summaryLine, 'Clean proctored session with zero monitoring anomalies recorded.');
});

test('integritySummary: Major issue tier when multiple high severity violations present', () => {
  const input = mockBaseInput(10);
  input.proctoringEvents = [
    {
      type: 'multiple_faces',
      label: 'Multiple Faces Detected',
      startedAt: new Date('2026-03-01T10:05:00Z'),
      durationSeconds: 40,
      severity: 'high',
    },
    {
      type: 'prohibited_object',
      label: 'Secondary device detected',
      startedAt: new Date('2026-03-01T10:08:00Z'),
      durationSeconds: 30,
      severity: 'high',
    },
  ];
  const res = computeIntegritySummary(input, defaultScoringConfig);
  assert.strictEqual(res.tier, 'major');
  assert.strictEqual(res.counts['multiple_faces'], 1);
  assert.strictEqual(res.counts['prohibited_object'], 1);
});

// -------------------------------------------------------------
// 2. PRINCIPLES & DETERMINISM TESTS
// -------------------------------------------------------------
console.log('\n--- 2. Determinism & Integrity Separation Tests ---');

test('Scoring is 100% deterministic (identical outputs for identical inputs)', () => {
  const input = mockBaseInput(15);
  const report1 = buildReport(input, defaultScoringConfig);
  const report2 = buildReport(input, defaultScoringConfig);

  assert.deepStrictEqual(report1, report2);
  assert.strictEqual(JSON.stringify(report1), JSON.stringify(report2));
});

test('Principle 1: Integrity signal NEVER alters rawScore, percentage, or band', () => {
  const cleanInput = mockBaseInput(10);
  const cleanReport = buildReport(cleanInput, defaultScoringConfig);

  const flaggedInput = mockBaseInput(10);
  flaggedInput.proctoringEvents = [
    {
      type: 'tab_switch',
      label: 'Tab Switch',
      startedAt: new Date(),
      durationSeconds: 90,
      severity: 'high',
    },
    {
      type: 'face_absent',
      label: 'Face Absent',
      startedAt: new Date(),
      durationSeconds: 120,
      severity: 'high',
    },
  ];
  const flaggedReport = buildReport(flaggedInput, defaultScoringConfig);

  // Scores must be identical
  assert.strictEqual(cleanReport.score.rawScore, flaggedReport.score.rawScore);
  assert.strictEqual(cleanReport.score.percentage, flaggedReport.score.percentage);
  assert.strictEqual(cleanReport.score.band.key, flaggedReport.score.band.key);
  assert.strictEqual(cleanReport.score.passed, flaggedReport.score.passed);

  // Integrity tiers correctly differ
  assert.strictEqual(cleanReport.integrity.tier, 'clean');
  assert.strictEqual(flaggedReport.integrity.tier, 'major');
});

// -------------------------------------------------------------
// 3. LATENCY BENCHMARK
// -------------------------------------------------------------
console.log('\n--- 3. Latency & Performance Benchmark ---');

test('Report generation p95 is under 50ms (pure CPU)', () => {
  const input = mockBaseInput(30);
  input.cohortStats = {
    completedCount: 100,
    meanPercent: 70,
    medianPercent: 72,
    stddevPercent: 10,
    p25: 60,
    p50: 72,
    p75: 80,
    p90: 90,
  };

  const iterations = 100;
  const timings: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    buildReport(input, defaultScoringConfig);
    const end = performance.now();
    timings.push(end - start);
  }

  timings.sort((a, b) => a - b);
  const p50 = timings[Math.floor(iterations * 0.5)];
  const p95 = timings[Math.floor(iterations * 0.95)];

  console.log(`    Iterations: ${iterations}`);
  console.log(`    p50 latency: ${p50.toFixed(3)} ms`);
  console.log(`    p95 latency: ${p95.toFixed(3)} ms`);

  assert.ok(p95 < 50, `p95 latency (${p95}ms) exceeds threshold 50ms`);
});

console.log(`\n====================================================`);
console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
console.log(`====================================================\n`);

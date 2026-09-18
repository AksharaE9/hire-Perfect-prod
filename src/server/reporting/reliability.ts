import { AttemptInput, ScoringConfigRule } from './types';
import { TopicBreakdownResult } from './topicBreakdown';
import { CohortComparisonResult } from './cohortComparison';
import { TimingAnalysisResult } from './timingAnalysis';
import { IntegritySummaryResult } from './integritySummary';

export interface ReliabilityResult {
  statement: string;
  caveats: string[];
}

export function computeReliability(
  input: AttemptInput,
  config: ScoringConfigRule,
  topics: TopicBreakdownResult,
  comparison: CohortComparisonResult,
  timing: TimingAnalysisResult,
  integrity: IntegritySummaryResult
): ReliabilityResult {
  const { questions } = input;
  const totalQuestions = questions.length;

  const caveats: string[] = [];

  // Question sample caveat
  if (totalQuestions < 20) {
    caveats.push(`This assessment contained ${totalQuestions} questions; broader evaluations typically test 30+ items for deeper diagnostic resolution.`);
  }

  // Topic suppression caveat
  const suppressedTopics = topics.items.filter((t) => t.lowConfidence);
  if (suppressedTopics.length > 0) {
    caveats.push(
      `${suppressedTopics.length} ${
        suppressedTopics.length === 1 ? 'topic had' : 'topics had'
      } fewer than ${config.minQuestionsPerTopic ?? 4} questions, so statistical percentages were suppressed to avoid false precision.`
    );
  }

  // Cohort comparison caveat
  if (!comparison.available) {
    caveats.push(
      `Percentile ranks are suppressed until the assessment reaches ${config.minCohortForPercentile ?? 30} verified attempts (${comparison.cohortCount} currently recorded).`
    );
  }

  // Timing caveats
  if (timing.unreliableQuestionCount > 0) {
    caveats.push(
      `${timing.unreliableQuestionCount} question ${
        timing.unreliableQuestionCount === 1 ? 'timer was' : 'timers were'
      } clamped due to session pauses or browser backgrounding.`
    );
  }

  // Data completeness
  if (input.dataCompleteness === 'partial') {
    caveats.push('This report was generated from historical or backfilled session records; certain granular timing metrics were reconstructed.');
  }

  const statement = `This report provides an objective evaluation based on ${totalQuestions} proctored questions under GuardEye AI monitoring. The skill score reflects domain accuracy independently of proctoring flags.`;

  return {
    statement,
    caveats,
  };
}

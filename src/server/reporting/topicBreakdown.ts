import { AttemptInput, ScoringConfigRule } from './types';

export interface TopicBreakdownResult {
  available: boolean;
  unavailableReason: string | null;
  items: Array<{
    topicId: string;
    name: string;
    questionCount: number;
    correct: number;
    percentage: number | null;
    lowConfidence: boolean;
    suppressedReason?: string;
  }>;
  strengths: string[];
  gaps: string[];
}

export function computeTopicBreakdown(
  input: AttemptInput,
  config: ScoringConfigRule
): TopicBreakdownResult {
  const { questions, answers } = input;
  const minQuestions = config.minQuestionsPerTopic ?? 4;

  const answerMap = new Map(answers.map((a) => [a.questionId, a]));

  // Group questions by topic
  const topicMap = new Map<
    string,
    {
      topicId: string;
      name: string;
      questionCount: number;
      correctCount: number;
    }
  >();

  let hasAnyTopic = false;

  for (const q of questions) {
    // Topic resolution: topicName -> tags[0] -> fallback
    let topicName = q.topicName || (q.tags && q.tags.length > 0 ? q.tags[0] : null);
    if (!topicName) {
      continue;
    }

    hasAnyTopic = true;
    const topicId = q.topicId || topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (!topicMap.has(topicId)) {
      topicMap.set(topicId, {
        topicId,
        name: topicName,
        questionCount: 0,
        correctCount: 0,
      });
    }

    const entry = topicMap.get(topicId)!;
    entry.questionCount++;

    const a = answerMap.get(q.id);
    if (a && a.wasReached !== false && a.selectedOption !== null && a.selectedOption !== undefined) {
      if (Number(a.selectedOption) === Number(q.correctAnswer)) {
        entry.correctCount++;
      }
    }
  }

  if (!hasAnyTopic || topicMap.size === 0) {
    return {
      available: false,
      unavailableReason: 'Topic breakdown is not available for this assessment.',
      items: [],
      strengths: [],
      gaps: [],
    };
  }

  const items: TopicBreakdownResult['items'] = [];
  const strengths: string[] = [];
  const gaps: string[] = [];

  for (const entry of Array.from(topicMap.values())) {
    const isLowConfidence = entry.questionCount < minQuestions;

    if (isLowConfidence) {
      items.push({
        topicId: entry.topicId,
        name: entry.name,
        questionCount: entry.questionCount,
        correct: entry.correctCount,
        percentage: null,
        lowConfidence: true,
        suppressedReason: `Too few questions (${entry.questionCount} of ${minQuestions} required) to provide a reliable percentage score.`,
      });
    } else {
      const pct = Number(((entry.correctCount / entry.questionCount) * 100).toFixed(1));
      items.push({
        topicId: entry.topicId,
        name: entry.name,
        questionCount: entry.questionCount,
        correct: entry.correctCount,
        percentage: pct,
        lowConfidence: false,
      });

      if (pct >= 80.0) {
        strengths.push(entry.name);
      } else if (pct <= 50.0) {
        gaps.push(entry.name);
      }
    }
  }

  // Sort items from highest percentage/correct to lowest
  items.sort((a, b) => {
    const pctA = a.percentage ?? (a.correct / a.questionCount) * 100;
    const pctB = b.percentage ?? (b.correct / b.questionCount) * 100;
    return pctB - pctA;
  });

  return {
    available: true,
    unavailableReason: null,
    items,
    strengths,
    gaps,
  };
}

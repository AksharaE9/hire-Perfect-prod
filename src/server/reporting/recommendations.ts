import { TopicBreakdownResult } from './topicBreakdown';

export interface RecommendationItem {
  topicName: string;
  focusAreas: string[];
}

export function computeRecommendations(
  topics: TopicBreakdownResult,
  focusAreaMap: Record<string, string[]> = {}
): RecommendationItem[] {
  if (!topics.available || topics.gaps.length === 0) {
    return [];
  }

  const recommendations: RecommendationItem[] = [];

  for (const gapName of topics.gaps) {
    const slug = gapName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const customAreas = focusAreaMap[slug] || focusAreaMap[gapName];

    const focusAreas = customAreas && customAreas.length > 0
      ? customAreas
      : [
          `Review foundational concepts and syntax in ${gapName}`,
          `Practice applied scenario exercises and edge-case problems for ${gapName}`,
          `Complete diagnostic drills to reinforce ${gapName} speed and precision`,
        ];

    recommendations.push({
      topicName: gapName,
      focusAreas,
    });
  }

  return recommendations;
}

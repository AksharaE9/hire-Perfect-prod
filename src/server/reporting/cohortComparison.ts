import { AttemptInput, ScoringConfigRule } from './types';

export interface CohortComparisonResult {
  available: boolean;
  unavailableReason: string | null;
  cohortCount: number;
  percentile: number | null;
  meanPercent: number | null;
  cutPoints: {
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  } | null;
}

// Error function approximation for normal CDF
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX);

  return sign * y;
}

function normalCdf(x: number, mean: number, stddev: number): number {
  if (stddev <= 0) return x >= mean ? 1.0 : 0.0;
  return 0.5 * (1 + erf((x - mean) / (stddev * Math.SQRT2)));
}

export function computeCohortComparison(
  candidatePercentage: number,
  input: AttemptInput,
  config: ScoringConfigRule
): CohortComparisonResult {
  const minCohort = config.minCohortForPercentile ?? 30;
  const stats = input.cohortStats;

  const cohortCount = stats?.completedCount ?? 0;

  if (!stats || cohortCount < minCohort) {
    return {
      available: false,
      unavailableReason: `Not enough completed attempts yet to compare this score (${cohortCount} ${
        cohortCount === 1 ? 'attempt' : 'attempts'
      } recorded; ${minCohort} required).`,
      cohortCount,
      percentile: null,
      meanPercent: stats ? Number(stats.meanPercent.toFixed(1)) : null,
      cutPoints: stats
        ? {
            p25: stats.p25,
            p50: stats.p50,
            p75: stats.p75,
            p90: stats.p90,
          }
        : null,
    };
  }

  // Calculate percentile rank
  const mean = stats.meanPercent;
  const stddev = stats.stddevPercent > 0 ? stats.stddevPercent : 15.0;

  const cdfValue = normalCdf(candidatePercentage, mean, stddev);
  const rawPercentile = Math.round(cdfValue * 100);
  const clampedPercentile = Math.max(1, Math.min(99, rawPercentile));

  return {
    available: true,
    unavailableReason: null,
    cohortCount,
    percentile: clampedPercentile,
    meanPercent: Number(mean.toFixed(1)),
    cutPoints: {
      p25: stats.p25,
      p50: stats.p50,
      p75: stats.p75,
      p90: stats.p90,
    },
  };
}

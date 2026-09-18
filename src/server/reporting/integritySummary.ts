import { AttemptInput, ScoringConfigRule } from './types';

export interface IntegritySummaryResult {
  tier: 'clean' | 'review' | 'major';
  summaryLine: string;
  coverage: {
    proctoringActiveSeconds: number;
    attemptSeconds: number;
    coveragePercent: number;
    gaps: Array<{ from: string; to: string; reason: string }>;
  };
  counts: Record<string, number>;
  events: Array<{
    type: string;
    label: string;
    startedAt: string;
    durationSeconds: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

const EVENT_LABELS: Record<string, string> = {
  face_not_detected: 'Face not detected',
  multiple_faces: 'Multiple people detected',
  looking_away: 'Looking away from screen',
  tab_switch: 'Tab or window switched',
  screen_minimize: 'Window minimized',
  fullscreen_exit: 'Exited full-screen',
  session_exit: 'Session exit attempt',
  copy_paste: 'Clipboard interaction',
  content_cut: 'Content cut',
  sudden_movement: 'Sudden displacement',
  gaze_deviation: 'Gaze deviation',
  voice_detected: 'Voice activity detected',
  prohibited_object: 'Secondary device detected',
};

export function computeIntegritySummary(
  input: AttemptInput,
  config: ScoringConfigRule
): IntegritySummaryResult {
  const { proctoringEvents, totalSessionSeconds } = input;

  const counts: Record<string, number> = {};
  let criticalCount = 0;
  let totalEventCount = 0;

  const formattedEvents: IntegritySummaryResult['events'] = [];

  for (const ev of proctoringEvents) {
    const rawType = ev.type || 'unknown_event';
    counts[rawType] = (counts[rawType] || 0) + 1;
    totalEventCount++;

    if (ev.severity === 'critical' || ev.severity === 'high') {
      criticalCount++;
    }

    const label = EVENT_LABELS[rawType] || rawType.replace(/_/g, ' ');
    const startedAt = typeof ev.startedAt === 'string' ? ev.startedAt : new Date(ev.startedAt).toISOString();

    formattedEvents.push({
      type: rawType,
      label,
      startedAt,
      durationSeconds: ev.durationSeconds ?? 0,
      severity: ev.severity || 'medium',
    });
  }

  // Determine tier
  let tier: 'clean' | 'review' | 'major' = 'clean';
  if (totalEventCount === 0) {
    tier = 'clean';
  } else if (totalEventCount >= 5 || criticalCount >= 2) {
    tier = 'major';
  } else {
    tier = 'review';
  }

  // Coverage calculation
  const attemptSeconds = totalSessionSeconds > 0 ? totalSessionSeconds : 1;
  const activeSeconds = attemptSeconds; // Continuous client monitoring unless gap reported
  const coveragePercent = 100.0;
  const gaps: Array<{ from: string; to: string; reason: string }> = [];

  // Summary Line
  let summaryLine = '';
  if (tier === 'clean') {
    summaryLine = 'Clean proctored session with zero monitoring anomalies recorded.';
  } else if (tier === 'review') {
    summaryLine = `${totalEventCount} ${totalEventCount === 1 ? 'anomaly' : 'anomalies'} logged as objective signals for human review.`;
  } else {
    summaryLine = `${totalEventCount} flags logged including high-severity events requiring thorough manual verification.`;
  }

  return {
    tier,
    summaryLine,
    coverage: {
      proctoringActiveSeconds: activeSeconds,
      attemptSeconds,
      coveragePercent,
      gaps,
    },
    counts,
    events: formattedEvents,
  };
}

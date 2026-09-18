'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import StatusChip from '@/components/ui/StatusChip';
import CertificateModal from '@/components/ui/CertificateModal';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';
import { formatDate } from '@/src/lib/formatters';
import { AttemptReport } from '@/src/server/reporting/types';
import {
  Award,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Printer,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  BookOpen,
  ShieldCheck,
  TrendingUp,
  ExternalLink,
  Target,
  FileText,
} from 'lucide-react';

export default function ResultsPage({
  params: paramsPromise,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const params = React.use(paramsPromise);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<AttemptReport | null>(null);
  const [showMethodology, setShowMethodology] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    if (!checkAndClearExpiredSession(router)) return;
    loadReport();
  }, [params.attemptId]);

  const loadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/attempts/${params.attemptId}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.report) {
        setReport(data.report);
      } else {
        // Fallback to basic load if v1 endpoint fails
        const legacyRes = await fetch(`/api/attempts/${params.attemptId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const legacyData = await legacyRes.json();
        if (legacyData.success) {
          // Trigger automatic report generation
          const retryRes = await fetch(`/api/v1/attempts/${params.attemptId}/report`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const retryData = await retryRes.json();
          if (retryData.success) {
            setReport(retryData.report);
          }
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Failed to load assessment report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading variant="spinner" fullScreen text="Compiling detailed assessment report..." />;
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-ink">
        <h2 className="text-xl font-bold mb-2">Report Not Found</h2>
        <p className="text-sm text-graphite mb-4">We could not load the requested attempt record.</p>
        <Link href="/dashboard">
          <Button variant="primary" size="md">Return to dashboard</Button>
        </Link>
      </div>
    );
  }

  const { meta, score, topics, timing, comparison, integrity, reliability, recommendations, questions } = report;
  const isPassing = score.passed ?? (score.percentage >= 60);

  const durationMin = Math.floor(timing.totalSeconds / 60);
  const durationSec = timing.totalSeconds % 60;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-10 md:py-14 w-full">
        {/* Back Link & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-rule gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-graphite hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href={`/api/v1/attempts/${meta.attemptId}/report/pdf`} target="_blank">
              <Button variant="outline" size="sm" leftIcon={<Printer className="w-4 h-4" />}>
                Print report
              </Button>
            </Link>
            {isPassing && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Award className="w-4 h-4" />}
                onClick={() => setShowCertificate(true)}
              >
                View certificate
              </Button>
            )}
          </div>
        </div>

        {/* 1. Result Header */}
        <section className="bg-sheet border border-rule rounded-panel p-6 sm:p-8 shadow-subtle mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xs text-graphite font-medium">
                  {meta.categoryName}
                </span>
                <span className="text-rule-strong">·</span>
                <span className="text-xs text-graphite font-mono">
                  Report v{meta.reportVersion}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-2">
                {meta.assessmentName}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-graphite mt-3">
                <span>Candidate: <strong className="text-ink">{meta.candidateName}</strong></span>
                <span>Submitted: <strong className="text-ink">{formatDate(meta.submittedAt)}</strong></span>
                <span>Time: <strong className="text-ink">{durationMin}m {durationSec}s</strong> of {Math.floor(meta.timeLimitSeconds / 60)}m</span>
                {meta.dataCompleteness === 'partial' && (
                  <span className="text-review font-semibold bg-review-soft px-2 py-0.5 rounded-chip">Historical backfill</span>
                )}
              </div>
            </div>

            {/* Score & Band Header Badge */}
            <div className="flex items-center gap-6 self-start lg:self-center bg-paper p-5 rounded-card border border-rule">
              <div>
                <span className="text-[11px] font-semibold text-graphite uppercase tracking-wider block mb-1">
                  Overall Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-ink tabular-nums">
                    {score.rawScore} / {score.maxScore}
                  </span>
                  <span className="text-lg font-bold text-signal tabular-nums">
                    ({score.percentage}%)
                  </span>
                </div>
              </div>

              <div className="border-l border-rule pl-6 flex flex-col items-start">
                <span className="text-[11px] font-semibold text-graphite uppercase tracking-wider block mb-1">
                  Competency Tier
                </span>
                <span className="text-base font-extrabold text-ink">
                  {score.band.label}
                </span>
                <span className="text-[11px] text-graphite">
                  {isPassing ? 'Passing threshold met' : 'Passing threshold not met'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. How This Score Was Worked Out (Expandable Methodology Drawer) */}
        <section className="mb-8">
          <Card className="p-0 overflow-hidden border-rule">
            <button
              onClick={() => setShowMethodology(!showMethodology)}
              className="w-full flex items-center justify-between p-5 bg-paper hover:bg-sheet text-left transition-colors"
              aria-expanded={showMethodology}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-btn bg-signal-soft text-signal flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">
                    How this score was worked out
                  </h3>
                  <p className="text-xs text-graphite">
                    Transparent scoring rules, point weights, and unanswered question criteria
                  </p>
                </div>
              </div>
              <div className="text-graphite pr-2">
                {showMethodology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showMethodology && (
              <div className="p-6 border-t border-rule bg-sheet text-xs text-graphite space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-paper rounded-card border border-rule">
                    <span className="font-semibold text-ink block mb-1">Marks per Correct</span>
                    <span className="font-bold text-ink text-sm tabular-nums">
                      +{score.methodology.marksPerCorrect} pt
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-card border border-rule">
                    <span className="font-semibold text-ink block mb-1">Negative Marking</span>
                    <span className="font-bold text-ink text-sm tabular-nums">
                      {score.methodology.negativeMarking > 0 ? `-${score.methodology.negativeMarking} pt` : 'None (0 pt)'}
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-card border border-rule">
                    <span className="font-semibold text-ink block mb-1">Passing Threshold</span>
                    <span className="font-bold text-ink text-sm tabular-nums">
                      {score.methodology.passThreshold}%
                    </span>
                  </div>
                  <div className="p-3 bg-paper rounded-card border border-rule">
                    <span className="font-semibold text-ink block mb-1">Difficulty Weighting</span>
                    <span className="font-bold text-ink text-sm">
                      {score.methodology.difficultyWeighted ? 'Active' : 'Flat marks'}
                    </span>
                  </div>
                </div>

                <p className="leading-relaxed">
                  The final percentage is computed as <code className="font-mono text-ink bg-paper px-1.5 py-0.5 rounded border border-rule">round(rawScore / maxScore × 100, 1)</code>.
                  Unanswered questions score 0 marks. Questions never reached due to session expiry or early termination are recorded separately.
                  Proctoring signals are evaluated independently and never alter skill scores.
                </p>

                <div className="pt-2">
                  <Link
                    href="/integrity"
                    className="inline-flex items-center gap-1.5 font-semibold text-signal hover:underline"
                  >
                    <span>Read our public scoring and proctoring methodology</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* 3. Topic Breakdown (Strengths & Gaps) */}
        <section className="bg-sheet border border-rule rounded-panel p-6 sm:p-8 shadow-subtle mb-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-rule">
            <div>
              <h2 className="text-lg font-bold text-ink">Topic Breakdown</h2>
              <p className="text-xs text-graphite">
                Diagnostic score distribution across assessment sub-skills
              </p>
            </div>
            <span className="text-xs text-graphite tabular-nums">
              {topics.items.length} topics evaluated
            </span>
          </div>

          {!topics.available ? (
            <p className="text-xs text-graphite italic">{topics.unavailableReason}</p>
          ) : (
            <div className="space-y-5">
              {topics.items.map((item) => {
                const pct = item.percentage ?? (item.correct / Math.max(1, item.questionCount)) * 100;
                return (
                  <div key={item.topicId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink">{item.name}</span>
                        {item.lowConfidence && (
                          <span className="text-[10px] text-graphite bg-paper border border-rule px-2 py-0.2 rounded-chip">
                            Low sample ({item.questionCount} Qs)
                          </span>
                        )}
                      </div>
                      <div className="font-mono tabular-nums text-graphite">
                        {item.percentage !== null ? (
                          <span className="font-bold text-ink">{item.percentage}% <span className="text-graphite font-normal">({item.correct}/{item.questionCount})</span></span>
                        ) : (
                          <span>{item.correct} of {item.questionCount} correct</span>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2.5 w-full bg-paper border border-rule rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.lowConfidence
                            ? 'bg-graphite/30'
                            : pct >= 80
                            ? 'bg-clean'
                            : pct <= 50
                            ? 'bg-review'
                            : 'bg-signal'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(4, pct))}%` }}
                      />
                    </div>

                    {item.suppressedReason && (
                      <p className="text-[10px] text-graphite italic">
                        {item.suppressedReason}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Strengths & Gaps Derived Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-rule mt-6">
                <div className="p-4 bg-paper rounded-card border border-rule">
                  <div className="flex items-center gap-2 mb-2 text-clean font-bold text-xs">
                    <CheckCircle className="w-4 h-4" />
                    <span>Demonstrated Strengths (≥80%)</span>
                  </div>
                  {topics.strengths.length > 0 ? (
                    <ul className="text-xs text-graphite space-y-1">
                      {topics.strengths.map((s, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-clean shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-graphite italic">No topics qualified for high-strength threshold.</p>
                  )}
                </div>

                <div className="p-4 bg-paper rounded-card border border-rule">
                  <div className="flex items-center gap-2 mb-2 text-review font-bold text-xs">
                    <Target className="w-4 h-4" />
                    <span>Focus Gaps (≤50%)</span>
                  </div>
                  {topics.gaps.length > 0 ? (
                    <ul className="text-xs text-graphite space-y-1">
                      {topics.gaps.map((g, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-review shrink-0" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-graphite italic">No major topic gaps detected in this attempt.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 4. Timing & Response Pacing */}
        <section className="bg-sheet border border-rule rounded-panel p-6 sm:p-8 shadow-subtle mb-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-rule">
            <div>
              <h2 className="text-lg font-bold text-ink">Timing & Response Pacing</h2>
              <p className="text-xs text-graphite">
                Server-derived response times, dwell patterns, and answer revisions
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-graphite">
              <Clock className="w-4 h-4 text-signal" />
              <span>Median: {Math.round(timing.medianSecondsPerQuestion)}s/question</span>
            </div>
          </div>

          {/* Time Strip Visual */}
          {questions.length > 0 && (
            <div className="mb-6">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-graphite block mb-2">
                Question Pace & Accuracy Strip
              </span>
              <div className="flex items-end gap-1 h-20 p-2 bg-paper rounded-card border border-rule overflow-x-auto">
                {questions.map((q) => {
                  const heightPct = Math.min(100, Math.max(15, (q.secondsSpent / Math.max(1, timing.medianSecondsPerQuestion * 2)) * 50));
                  return (
                    <div
                      key={q.position}
                      className="flex-1 min-w-[10px] flex flex-col items-center justify-end h-full group relative"
                    >
                      <div
                        className={`w-full rounded-t-xs transition-all ${
                          !q.isAnswered
                            ? 'bg-rule-strong'
                            : q.isCorrect
                            ? 'bg-clean'
                            : 'bg-review'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-graphite mt-1.5 px-1">
                <span>Q1</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-clean" /> Correct</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-review" /> Incorrect</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs bg-rule-strong" /> Unanswered</span>
                </div>
                <span>Q{questions.length}</span>
              </div>
            </div>
          )}

          {/* Observations List */}
          <div className="space-y-2">
            {timing.observations.map((obs, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-graphite">
                <span className="w-1.5 h-1.5 rounded-full bg-signal mt-1.5 shrink-0" />
                <span>{obs}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Cohort Comparison */}
        <section className="bg-sheet border border-rule rounded-panel p-6 sm:p-8 shadow-subtle mb-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-rule">
            <div>
              <h2 className="text-lg font-bold text-ink">Cohort Comparison</h2>
              <p className="text-xs text-graphite">
                Score positioning relative to verified candidate attempts
              </p>
            </div>
            <span className="text-xs text-graphite tabular-nums">
              Cohort: {comparison.cohortCount} attempts
            </span>
          </div>

          {comparison.available && comparison.percentile !== null ? (
            <div className="p-5 bg-paper rounded-card border border-rule flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-3xl font-extrabold text-ink tabular-nums">
                  {comparison.percentile}th Percentile
                </span>
                <p className="text-xs text-graphite mt-1">
                  Scored higher than {comparison.percentile}% of candidates on this assessment.
                </p>
              </div>
              {comparison.meanPercent !== null && (
                <div className="text-xs text-graphite text-left sm:text-right">
                  <span>Cohort Mean: <strong className="text-ink">{comparison.meanPercent}%</strong></span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 bg-paper rounded-card border border-dashed border-rule text-xs text-graphite">
              <span className="font-semibold text-ink block mb-1">Percentile comparison withheld</span>
              <p>{comparison.unavailableReason || 'Not enough completed attempts yet to calculate a statistically valid percentile rank.'}</p>
            </div>
          )}
        </section>

        {/* 6. Integrity Record (GuardEye AI) */}
        <section className="bg-sheet border border-rule rounded-panel p-6 sm:p-8 shadow-subtle mb-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-rule">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-ink">Integrity Record</h2>
                <StatusChip
                  variant={integrity.tier === 'clean' ? 'clean' : integrity.tier === 'review' ? 'review' : 'flagged'}
                  size="sm"
                >
                  {integrity.tier === 'clean' ? 'No issues' : integrity.tier === 'review' ? 'Needs review' : 'Major issues'}
                </StatusChip>
              </div>
              <p className="text-xs text-graphite mt-1">
                Objective proctoring log and monitoring coverage verified by GuardEye AI
              </p>
            </div>
            <span className="text-xs text-graphite tabular-nums">
              {integrity.events.length} {integrity.events.length === 1 ? 'flag' : 'flags'} logged
            </span>
          </div>

          <p className="text-xs text-graphite mb-4 leading-relaxed">
            {integrity.summaryLine}
          </p>

          {integrity.events.length > 0 ? (
            <div className="space-y-2.5">
              {integrity.events.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-card border border-rule bg-paper flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-review shrink-0" />
                    <div>
                      <span className="font-bold text-ink">{ev.label}</span>
                      <span className="text-[11px] text-graphite ml-2 font-mono">[{ev.severity}]</span>
                    </div>
                  </div>
                  <span className="font-mono text-graphite tabular-nums text-[11px]">
                    {new Date(ev.startedAt).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-paper rounded-card border border-rule">
              <CheckCircle className="w-7 h-7 text-clean mx-auto mb-2" />
              <p className="text-xs font-bold text-ink">Clean Examination Session</p>
              <p className="text-[11px] text-graphite mt-0.5">
                Full-screen lockdown and continuous webcam heuristics recorded zero violations.
              </p>
            </div>
          )}
        </section>

        {/* 7. Recommendations (Study Focus Areas) */}
        {recommendations.length > 0 && (
          <section className="bg-sheet border border-rule rounded-panel p-6 sm:p-8 shadow-subtle mb-8">
            <div className="pb-4 mb-6 border-b border-rule">
              <h2 className="text-lg font-bold text-ink">Recommended Focus Areas</h2>
              <p className="text-xs text-graphite">
                Deterministic study priorities derived from identified diagnostic topic gaps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 bg-paper rounded-card border border-rule space-y-2">
                  <h3 className="text-sm font-bold text-ink">{rec.topicName}</h3>
                  <ul className="text-xs text-graphite space-y-1.5">
                    {rec.focusAreas.map((area, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-signal mt-1.5 shrink-0" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 8. Reliability & Limitations Statement */}
        <section className="p-6 bg-paper rounded-card border border-rule text-xs text-graphite space-y-3 mb-12">
          <div className="flex items-center gap-2 text-ink font-bold">
            <Info className="w-4 h-4 text-signal shrink-0" />
            <span>Report Reliability & Evidentiary Boundaries</span>
          </div>
          <p className="leading-relaxed">
            {reliability.statement}
          </p>
          {reliability.caveats.length > 0 && (
            <ul className="space-y-1.5 text-[11px] text-graphite pl-4 list-disc">
              {reliability.caveats.map((cav, idx) => (
                <li key={idx}>{cav}</li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        candidateName={meta.candidateName}
        assessmentTitle={meta.assessmentName}
        completionDate={formatDate(meta.submittedAt)}
        certificateId={meta.attemptId.slice(-8).toUpperCase()}
      />

      <Footer />
    </div>
  );
}

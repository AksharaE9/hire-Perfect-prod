'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';
import type { AttemptReport } from '@/src/server/reporting/types';
import { Check, Copy, ExternalLink, RefreshCw } from 'lucide-react';

export default function AdminAttemptReportPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.attemptId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AttemptReport | null>(null);
  const [reportDoc, setReportDoc] = useState<any>(null);

  // Filter and sort states for question table
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, incorrect, rushed, unanswered
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'position' | 'secondsSpent' | 'changeCount'>('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Review state
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaveStatus, setNotesSaveStatus] = useState<string | null>(null);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!checkAndClearExpiredSession(router)) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchReport();
  }, [attemptId]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/admin/attempts/${attemptId}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load detailed report');
      }

      const data = await res.json();
      setReport(data.report);
      setReportDoc(data.reportDocument);
      if (data.reportDocument?.reviewerNotes) {
        setReviewerNotes(data.reportDocument.reviewerNotes);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error fetching report');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async (markReviewed = false) => {
    setIsSavingNotes(true);
    setNotesSaveStatus(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/admin/attempts/${attemptId}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reviewerNotes, markReviewed }),
      });

      if (!res.ok) throw new Error('Failed to save review');
      const data = await res.json();
      setNotesSaveStatus(markReviewed ? 'Marked as reviewed and notes saved' : 'Notes saved');
      if (reportDoc) {
        setReportDoc({ ...reportDoc, reviewerNotes, reviewedAt: data.report.reviewedAt });
      }
      setTimeout(() => setNotesSaveStatus(null), 3500);
    } catch (err: any) {
      setNotesSaveStatus(err.message || 'Error saving notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleRecompute = async () => {
    if (!confirm('Recomputing will create a new immutable report version using the latest scoring engine configuration. Continue?')) {
      return;
    }
    setIsRecomputing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/admin/attempts/${attemptId}/recompute`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Recomputation failed');
      await fetchReport();
      alert('Report recomputed successfully. New report version is active.');
    } catch (err: any) {
      alert(err.message || 'Error during recomputation');
    } finally {
      setIsRecomputing(false);
    }
  };

  const copyAttemptId = () => {
    navigator.clipboard.writeText(attemptId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Filtered and sorted questions
  const filteredQuestions = useMemo(() => {
    if (!report?.questions) return [];
    return report.questions
      .filter((q) => {
        if (topicFilter !== 'all' && q.topicName !== topicFilter) return false;
        if (statusFilter === 'incorrect' && q.isCorrect) return false;
        if (statusFilter === 'rushed' && q.secondsSpent >= 8) return false;
        if (statusFilter === 'unanswered' && q.selectedOptionLabel !== null) return false;
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTopic = q.topicName.toLowerCase().includes(query);
          const matchPos = q.position.toString().includes(query);
          if (!matchTopic && !matchPos) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'position') diff = a.position - b.position;
        else if (sortField === 'secondsSpent') diff = a.secondsSpent - b.secondsSpent;
        else if (sortField === 'changeCount') diff = a.changeCount - b.changeCount;
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [report, topicFilter, statusFilter, searchQuery, sortField, sortOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
          <Loading size="lg" />
          <p className="text-slate font-sans text-xs">Loading attempt review...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <Navbar />
        <main className="max-w-4xl mx-auto px-6 py-16 text-center">
          <div className="w-14 h-14 bg-danger-bg text-danger border border-danger-line rounded-card flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            !
          </div>
          <h1 className="text-xl font-bold font-heading mb-2 text-navy">Diagnostic report unavailable</h1>
          <p className="text-slate font-sans max-w-md mx-auto mb-6 text-xs leading-relaxed">{error}</p>
          <Button variant="outline" onClick={() => router.push('/admin/dashboard')}>
            Return to dashboard
          </Button>
        </main>
      </div>
    );
  }

  const { meta, score, topics, timing, comparison, integrity, reliability, recommendations } = report;

  const getBandStyles = (bandKey: string) => {
    switch (bandKey) {
      case 'expert':
        return 'bg-ok-bg text-ok border-ok-line';
      case 'proficient':
        return 'bg-blue-tint text-info border-info-line';
      case 'developing':
        return 'bg-warn-bg text-warn border-warn-line';
      default:
        return 'bg-mist text-slate border-line';
    }
  };

  const getIntegrityStyles = (tier: string) => {
    switch (tier) {
      case 'clean':
        return 'bg-ok-bg text-ok border-ok-line';
      case 'review':
        return 'bg-warn-bg text-warn border-warn-line';
      case 'major':
        return 'bg-danger-bg text-danger border-danger-line';
      default:
        return 'bg-mist text-slate border-line';
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    if (mins === 0) return `${remainder}s`;
    return `${mins}m ${remainder}s`;
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans pb-24">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Top breadcrumbs and admin bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate font-sans mb-1">
              <Link href="/admin/dashboard" className="hover:text-navy transition">
                Admin dashboard
              </Link>
              <span>/</span>
              <span className="text-navy font-medium">Attempt review</span>
            </div>
            <h1 className="text-xl font-bold font-heading text-navy">
              Attempt review
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              href={`/admin/attempts/compare?assessmentId=${meta.assessmentId}&current=${meta.attemptId}`}
              className="px-3.5 py-1.5 text-xs font-medium rounded-btn bg-white hover:bg-mist text-navy border border-line-strong transition shadow-sm"
            >
              Compare candidates
            </Link>
            <button
              onClick={handleRecompute}
              disabled={isRecomputing}
              className="px-3.5 py-1.5 text-xs font-medium rounded-btn bg-white hover:bg-mist text-navy border border-line-strong transition shadow-sm disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecomputing ? 'animate-spin' : ''}`} />
              {isRecomputing ? 'Recomputing...' : `Recompute (v${meta.reportVersion})`}
            </button>
            <a
              href={`/api/v1/attempts/${attemptId}/report/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 text-xs font-medium rounded-btn bg-navy hover:bg-navy-2 text-white transition shadow-sm"
            >
              Export PDF
            </a>
          </div>
        </div>

        {/* Section 1: Result Header */}
        <Card className="bg-white border-line p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate font-medium">
                <span className="text-navy font-semibold">{meta.categoryName}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-sunken px-2 py-0.5 rounded">
                  Attempt {meta.attemptId.slice(0, 10)}…
                  <button onClick={copyAttemptId} className="hover:text-navy ml-1" title="Copy ID">
                    {copiedId ? <Check className="w-3 h-3 text-ok" /> : <Copy className="w-3 h-3" />}
                  </button>
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-navy">
                {meta.assessmentName}
              </h2>

              {/* S9: Definition-list metadata row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-xs">
                <div>
                  <span className="text-slate block text-[11px] mb-0.5">Candidate</span>
                  <span className="text-navy font-medium">{meta.candidateName}</span>
                </div>
                <div>
                  <span className="text-slate block text-[11px] mb-0.5">Submitted</span>
                  <span className="text-ink font-tabular-nums">{new Date(meta.submittedAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate block text-[11px] mb-0.5">Time used</span>
                  <span className="text-ink font-tabular-nums">{formatSeconds(meta.durationSeconds)}</span>
                </div>
                <div>
                  <span className="text-slate block text-[11px] mb-0.5">Threshold</span>
                  <span className="text-ink font-tabular-nums">
                    {score.passThresholdPercent ? `${score.passThresholdPercent}% required (${score.passed ? 'Met' : 'Below'})` : 'Standard'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 self-start bg-mist p-4 rounded-card border border-line">
              <div className="text-right">
                <div className="text-3xl font-bold font-heading text-navy font-tabular-nums leading-none">
                  {score.rawScore} <span className="text-base font-normal text-slate">/ {score.maxScore}</span>
                </div>
                <div className="text-xs text-slate mt-1 font-tabular-nums">
                  {score.percentage}% overall score
                </div>
              </div>
              <div className="h-10 w-px bg-line" />
              <div>
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-chip border ${getBandStyles(score.band.key)}`}>
                  {score.band.label}
                </span>
              </div>
            </div>
          </div>

          {/* S4: Stat cards using state colors only where appropriate */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-line text-xs">
            <div className="p-3 bg-paper rounded-card border border-line">
              <span className="text-slate block mb-1">Correct answers</span>
              <span className="text-lg font-bold font-tabular-nums text-ok">{score.counts.correct}</span>
            </div>
            <div className="p-3 bg-paper rounded-card border border-line">
              <span className="text-slate block mb-1">Incorrect answers</span>
              <span className="text-lg font-bold font-tabular-nums text-danger">{score.counts.incorrect}</span>
            </div>
            <div className="p-3 bg-paper rounded-card border border-line">
              <span className="text-slate block mb-1">Unanswered</span>
              <span className="text-lg font-bold font-tabular-nums text-navy">{score.counts.unanswered}</span>
            </div>
            <div className="p-3 bg-paper rounded-card border border-line">
              <span className="text-slate block mb-1">Answer changes</span>
              <span className="text-lg font-bold font-tabular-nums text-navy">{timing.answerChanges.total}</span>
            </div>
          </div>
        </Card>

        {/* Section: S5 Reviewer notes & status */}
        <Card className="bg-white border-line p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold font-heading text-navy">Reviewer notes</h3>
            {reportDoc?.reviewedAt && (
              <span className="text-xs text-ok bg-ok-bg border border-ok-line px-2.5 py-0.5 rounded-chip font-medium">
                Reviewed on {new Date(reportDoc.reviewedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="space-y-3">
            <textarea
              value={reviewerNotes}
              onChange={(e) => setReviewerNotes(e.target.value)}
              placeholder="Add internal recruiter or reviewer notes for this attempt..."
              rows={3}
              className="w-full bg-white border border-line-strong rounded-btn p-3 text-xs text-ink placeholder-slate-soft focus:outline-none focus:border-navy"
            />
            <div className="flex items-center justify-between">
              <div>
                {notesSaveStatus && (
                  <span className="text-xs text-ok font-medium">{notesSaveStatus}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveNotes(false)}
                  disabled={isSavingNotes}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-btn bg-white hover:bg-mist text-navy border border-line-strong transition shadow-sm disabled:opacity-50"
                >
                  Save notes
                </button>
                <button
                  onClick={() => handleSaveNotes(true)}
                  disabled={isSavingNotes}
                  className="px-3.5 py-1.5 text-xs font-medium rounded-btn bg-navy hover:bg-navy-2 text-white transition shadow-sm disabled:opacity-50"
                >
                  Mark as reviewed
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Section: Diagnostic Grid (Topics & Integrity) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Topic Breakdown */}
          <Card className="bg-white border-line p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-sm font-bold font-heading text-navy mb-4">Topic Mastery Breakdown</h3>
              {topics.available ? (
                <div className="space-y-4">
                  {topics.items.map((t) => (
                    <div key={t.topicId} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-ink font-medium">{t.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate font-tabular-nums">{t.correct} / {t.questionCount}</span>
                          {t.percentage !== null ? (
                            <span className="font-bold text-navy font-tabular-nums w-10 text-right">{t.percentage}%</span>
                          ) : (
                            <span className="text-[11px] text-slate bg-mist px-1.5 py-0.5 rounded">Low sample</span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-sunken rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            t.lowConfidence
                              ? 'bg-slate-soft'
                              : (t.percentage || 0) >= 80
                              ? 'bg-ok'
                              : (t.percentage || 0) >= 50
                              ? 'bg-warn'
                              : 'bg-danger'
                          }`}
                          style={{ width: `${t.percentage ?? (t.correct / t.questionCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate">{topics.unavailableReason || 'Topic data unavailable'}</p>
              )}
            </div>
            <div className="pt-4 mt-4 border-t border-line flex justify-between text-xs text-slate">
              <span>Strengths: <strong className="text-ok font-semibold">{topics.strengths.length ? topics.strengths.join(', ') : 'None identified'}</strong></span>
              <span>Gaps: <strong className="text-danger font-semibold">{topics.gaps.length ? topics.gaps.join(', ') : 'None identified'}</strong></span>
            </div>
          </Card>

          {/* Integrity Signal & Proctoring */}
          <Card className="bg-white border-line p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold font-heading text-navy">GuardEye Integrity Record</h3>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-chip border ${getIntegrityStyles(integrity.tier)}`}>
                  {integrity.tier === 'clean' ? 'No issues flagged' : integrity.tier === 'review' ? 'Needs review' : 'Major issues'}
                </span>
              </div>
              <p className="text-xs text-slate mb-4">{integrity.summaryLine}</p>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-navy">Flagged events ({integrity.events.length})</div>
                {integrity.events.length === 0 ? (
                  <div className="p-3 bg-ok-bg/50 rounded-card border border-ok-line text-xs text-ok font-medium">
                    Full proctoring active with 0 anomaly detections recorded.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {integrity.events.map((ev, idx) => (
                      <div key={idx} className="p-2 bg-paper rounded border border-line flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${ev.severity === 'high' ? 'bg-danger' : ev.severity === 'medium' ? 'bg-warn' : 'bg-slate'}`} />
                          <span className="text-ink font-medium">{ev.label}</span>
                        </div>
                        <div className="text-slate font-tabular-nums">
                          {formatSeconds(ev.durationSeconds)} ({new Date(ev.startedAt).toLocaleTimeString()})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-line text-[11px] text-slate">
              Proctoring active: <span className="text-navy font-semibold font-tabular-nums">{integrity.coverage.proctoringActiveSeconds}s</span> of <span className="text-navy font-semibold font-tabular-nums">{integrity.coverage.attemptSeconds}s</span> total attempt duration.
            </div>
          </Card>
        </div>

        {/* Section 4.2: Full Question Table (Sortable, Filterable) */}
        <Card className="bg-white border-line p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold font-heading text-navy">
                Item-Level Question Audit ({filteredQuestions.length} questions)
              </h3>
              <p className="text-xs text-slate mt-0.5">
                Full response analysis with correct answers, response time, and answer revision count.
              </p>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
                className="bg-white border border-line-strong text-ink text-xs rounded-btn px-2.5 py-1.5 focus:outline-none focus:border-navy"
              >
                <option value="all">All topics</option>
                {topics.items.map((t) => (
                  <option key={t.topicId} value={t.name}>{t.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-line-strong text-ink text-xs rounded-btn px-2.5 py-1.5 focus:outline-none focus:border-navy"
              >
                <option value="all">All responses</option>
                <option value="incorrect">Incorrect only</option>
                <option value="rushed">Rushed (&lt;8s)</option>
                <option value="unanswered">Unanswered</option>
              </select>

              <select
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [f, o] = e.target.value.split('-');
                  setSortField(f as any);
                  setSortOrder(o as any);
                }}
                className="bg-white border border-line-strong text-ink text-xs rounded-btn px-2.5 py-1.5 focus:outline-none focus:border-navy"
              >
                <option value="position-asc">Question # (asc)</option>
                <option value="position-desc">Question # (desc)</option>
                <option value="secondsSpent-desc">Time spent (highest)</option>
                <option value="secondsSpent-asc">Time spent (lowest)</option>
                <option value="changeCount-desc">Revisions (most)</option>
              </select>
            </div>
          </div>

          {/* Question Table */}
          <div className="overflow-x-auto border border-line rounded-card">
            <table className="w-full text-left text-xs text-ink">
              <thead className="bg-table-head-bg text-slate font-semibold text-[11px] border-b border-table-rule">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Topic / Difficulty</th>
                  <th className="px-4 py-3">Candidate response</th>
                  <th className="px-4 py-3">Correct option</th>
                  <th className="px-4 py-3 text-center">Result</th>
                  <th className="px-4 py-3 text-right">Time</th>
                  <th className="px-4 py-3 text-right">Revisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-table-rule font-sans">
                {filteredQuestions.map((q) => (
                  <tr key={q.position} className="even:bg-table-row-alt hover:bg-table-row-hover transition">
                    <td className="px-4 py-3 font-semibold text-navy font-tabular-nums">
                      Q{q.position}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-ink">{q.topicName}</div>
                      <span className="text-[10px] text-slate capitalize">{q.difficulty}</span>
                    </td>
                    <td className="px-4 py-3">
                      {q.selectedOptionLabel ? (
                        <span className={`font-medium ${q.isCorrect ? 'text-ok' : 'text-danger'}`}>
                          {q.selectedOptionLabel}
                        </span>
                      ) : (
                        <span className="text-slate-soft italic">Unanswered</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {q.correctOptionLabel}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {q.isCorrect ? (
                        <span className="inline-block px-2 py-0.5 rounded-chip text-[10px] font-semibold bg-ok-bg text-ok border border-ok-line">
                          Correct
                        </span>
                      ) : q.selectedOptionLabel ? (
                        <span className="inline-block px-2 py-0.5 rounded-chip text-[10px] font-semibold bg-danger-bg text-danger border border-danger-line">
                          Incorrect
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-chip text-[10px] font-semibold bg-mist text-slate border border-line">
                          Skipped
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-tabular-nums">
                      <span className={q.secondsSpent < 8 ? 'text-warn font-semibold' : 'text-ink'}>
                        {q.secondsSpent}s
                      </span>
                      {q.timingUnreliable && <span className="text-warn ml-1" title="Unreliable timing">*</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-tabular-nums text-slate">
                      {q.changeCount > 0 ? (
                        <span className="text-navy font-semibold">{q.changeCount}</span>
                      ) : (
                        '0'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* S8: Audit Footer Metadata Row */}
        <div className="border-t border-line pt-4 text-center text-xs text-slate font-sans">
          <span>Attempt report version: v{meta.reportVersion}</span>
          <span className="mx-2">•</span>
          <span>Engine version: {meta.scoringEngineVersion}</span>
          <span className="mx-2">•</span>
          <span>Data completeness: {meta.dataCompleteness}</span>
          <span className="mx-2">•</span>
          <span>Generated: {new Date(meta.submittedAt).toLocaleString()}</span>
        </div>
      </main>
    </div>
  );
}

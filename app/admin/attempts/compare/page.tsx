'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';
import type { AttemptReport } from '@/src/server/reporting/types';

export default function AdminCompareAttemptsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assessmentId = searchParams.get('assessmentId');
  const currentAttemptId = searchParams.get('current');

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<any>(null);
  const [attemptsList, setAttemptsList] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reports, setReports] = useState<AttemptReport[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAndClearExpiredSession(router)) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    fetchAssessmentAttempts();
  }, [assessmentId]);

  const fetchAssessmentAttempts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/admin/assessments/${assessmentId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.assessment) {
        setAssessment(data.assessment);
      }

      const initialIds = currentAttemptId ? [currentAttemptId] : [];
      setSelectedIds(initialIds);
      if (initialIds.length > 0) {
        await loadReports(initialIds);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async (ids: string[]) => {
    try {
      const token = localStorage.getItem('token');
      const fetched: AttemptReport[] = [];
      for (const id of ids) {
        const res = await fetch(`/api/v1/admin/attempts/${id}/report`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          fetched.push(data.report);
        }
      }
      setReports(fetched);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <Loading size="lg" />
          <p className="text-slate font-sans text-sm">Loading candidate comparison...</p>
        </div>
      </div>
    );
  }

  const getBandStyles = (bandKey: string) => {
    switch (bandKey) {
      case 'expert':
        return 'bg-ok-bg text-ok border-ok-line';
      case 'proficient':
        return 'bg-blue-tint text-navy border-info-line';
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

  const allTopics = Array.from(
    new Set(reports.flatMap((r) => (r.topics?.available ? r.topics.items.map((t) => t.name) : [])))
  );

  return (
    <div className="min-h-screen bg-paper text-ink font-sans pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate font-medium mb-1.5">
              <Link href="/admin/dashboard" className="hover:text-navy transition">
                Admin dashboard
              </Link>
              <span>/</span>
              <span className="text-navy font-semibold">Candidate comparison</span>
            </div>
            <h1 className="text-2xl font-bold font-heading text-navy">
              Candidate Diagnostic Comparison
            </h1>
            <p className="text-xs text-slate mt-1">
              Side-by-side assessment results, topic mastery, and integrity signals for {reports.length} candidate(s).
            </p>
          </div>
          {currentAttemptId && (
            <Link
              href={`/admin/attempts/${currentAttemptId}`}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-mist text-navy border border-line shadow-sm transition"
            >
              Back to attempt
            </Link>
          )}
        </div>

        {reports.length === 0 ? (
          <Card className="bg-white border-line p-8 text-center shadow-sm">
            <p className="text-slate text-sm">No candidate reports loaded for comparison.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Summary comparison grid */}
            <div className={`grid grid-cols-1 md:grid-cols-${Math.min(reports.length, 4)} gap-6`}>
              {reports.map((rep) => (
                <Card key={rep.meta.attemptId} className="bg-white border-line p-6 space-y-4 shadow-sm rounded-xl">
                  <div>
                    <div className="text-xs text-slate font-semibold uppercase tracking-wider">{rep.meta.categoryName}</div>
                    <h3 className="text-lg font-bold font-heading text-navy">{rep.meta.candidateName}</h3>
                    <div className="text-[11px] text-slate-soft mt-0.5">
                      {new Date(rep.meta.submittedAt).toLocaleDateString()} · {Math.round(rep.meta.durationSeconds / 60)}m duration
                    </div>
                  </div>

                  <div className="p-4 bg-paper rounded-xl border border-line flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold font-heading text-navy tabular-nums">
                        {rep.score.rawScore} <span className="text-xs text-slate font-normal">/ {rep.score.maxScore}</span>
                      </div>
                      <div className="text-xs text-slate tabular-nums">{rep.score.percentage}% score</div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getBandStyles(rep.score.band?.key || '')}`}>
                      {rep.score.band?.label || 'Score'}
                    </span>
                  </div>

                  {/* Integrity */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate font-medium">Integrity signal</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getIntegrityStyles(rep.integrity.tier)}`}>
                        {rep.integrity.tier === 'clean' ? 'No issues' : rep.integrity.tier === 'review' ? 'Needs review' : 'Major issues'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-soft line-clamp-2">{rep.integrity.summaryLine}</p>
                  </div>

                  {/* Timing & revisions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line text-[11px]">
                    <div className="p-2.5 bg-paper rounded-lg border border-line">
                      <span className="text-slate text-[10px] uppercase font-bold block mb-0.5">Rushed answers</span>
                      <span className="font-bold text-navy tabular-nums">{rep.timing.rushedCount}</span>
                    </div>
                    <div className="p-2.5 bg-paper rounded-lg border border-line">
                      <span className="text-slate text-[10px] uppercase font-bold block mb-0.5">Answer changes</span>
                      <span className="font-bold text-navy tabular-nums">{rep.timing.answerChanges.total}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/admin/attempts/${rep.meta.attemptId}`}
                      className="block text-center w-full py-2 text-xs font-bold rounded-lg bg-white hover:bg-mist text-navy border border-line transition shadow-sm"
                    >
                      View full report
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Side-by-side Topic Breakdown comparison */}
            {allTopics.length > 0 && (
              <Card className="bg-white border-line p-6 sm:p-8 shadow-sm rounded-xl">
                <h3 className="text-base font-bold font-heading text-navy mb-6">
                  Topic Mastery Comparison
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-table-head-bg text-slate uppercase tracking-wider font-semibold text-[11px] border-b border-table-rule">
                      <tr>
                        <th className="px-5 py-3.5">Topic</th>
                        {reports.map((r) => (
                          <th key={r.meta.attemptId} className="px-5 py-3.5 font-bold text-navy">
                            {r.meta.candidateName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-table-rule font-sans">
                      {allTopics.map((topicName) => (
                        <tr key={topicName} className="hover:bg-table-row-hover transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-navy">{topicName}</td>
                          {reports.map((r) => {
                            const topicItem = r.topics.items?.find((t) => t.name === topicName);
                            if (!topicItem) return <td key={r.meta.attemptId} className="px-5 py-3.5 text-slate-soft">—</td>;
                            return (
                              <td key={r.meta.attemptId} className="px-5 py-3.5">
                                {topicItem.percentage !== null ? (
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-20 bg-sunken rounded-full h-1.5 overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${
                                          topicItem.percentage >= 80
                                            ? 'bg-ok'
                                            : topicItem.percentage >= 50
                                            ? 'bg-warn'
                                            : 'bg-danger'
                                        }`}
                                        style={{ width: `${topicItem.percentage}%` }}
                                      />
                                    </div>
                                    <span className="font-bold tabular-nums text-navy">
                                      {topicItem.percentage}%
                                    </span>
                                    <span className="text-[10px] text-slate">
                                      ({topicItem.correct}/{topicItem.questionCount})
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate">
                                    {topicItem.correct}/{topicItem.questionCount} (low sample)
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

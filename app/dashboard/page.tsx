'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import StatusChip from '@/components/ui/StatusChip';
import CertificateModal from '@/components/ui/CertificateModal';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';
import { formatDate } from '@/src/lib/formatters';
import { Award, BookOpen, Clock, Code2, FolderGit2, HelpCircle } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  useEffect(() => {
    if (!checkAndClearExpiredSession(router)) return;
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadAssessments(), loadAttempts()]);
    setLoading(false);
  };

  const loadAssessments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/assessments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error('Failed to load assessments:', error);
    }
  };

  const loadAttempts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/attempts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAttempts(data.attempts || []);
      }
    } catch (error) {
      console.error('Failed to load attempts:', error);
    }
  };

  if (loading) {
    return <Loading variant="spinner" fullScreen text="Loading dashboard..." />;
  }

  const completedAttempts = attempts.filter((a: any) => a.status === 'completed');
  const avgScore =
    completedAttempts.length > 0
      ? Math.round(
          completedAttempts.reduce((acc: any, curr: any) => acc + curr.percentage, 0) /
            completedAttempts.length
        )
      : 0;

  const handleViewCertificate = (attempt: any) => {
    setSelectedAttempt(attempt);
    setIsCertificateOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-10 md:py-14 w-full">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6 pb-6 border-b border-rule">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-signal block mb-1">
              Candidate Workspace
            </span>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight">
              Welcome, {user?.name?.split(' ')[0] || 'Candidate'}
            </h1>
            <p className="text-sm text-graphite mt-1">
              Overview of your proctored assessment attempts and certifications.
            </p>
          </div>

          <Link href="/assessments">
            <Button variant="primary" size="md">
              Browse assessments
            </Button>
          </Link>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <span className="text-xs font-semibold text-graphite uppercase tracking-wider block mb-2">
              Unlocked Assessments
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-ink tabular-nums">
                {assessments.filter((a) => a.hasAccess).length}
              </span>
              <span className="text-xs text-graphite">assessments available</span>
            </div>
          </Card>

          <Card className="p-6">
            <span className="text-xs font-semibold text-graphite uppercase tracking-wider block mb-2">
              Completed Attempts
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-ink tabular-nums">
                {completedAttempts.length}
              </span>
              <span className="text-xs text-graphite">attempts evaluated</span>
            </div>
          </Card>

          <Card className="p-6">
            <span className="text-xs font-semibold text-graphite uppercase tracking-wider block mb-2">
              Average Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-ink tabular-nums">
                {completedAttempts.length > 0 ? `${avgScore}%` : '--'}
              </span>
              <span className="text-xs text-graphite">across all completed tests</span>
            </div>
          </Card>
        </div>

        {/* Two Column Layout: Attempts Feed (Left) & Tools (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Attempts Feed */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rule">
              <h2 className="text-lg font-bold text-ink">Recent Attempts</h2>
              <span className="text-xs text-graphite tabular-nums">
                {attempts.length} records
              </span>
            </div>

            {attempts.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-10 h-10 text-graphite mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-bold text-ink mb-1">
                  You haven&apos;t taken an assessment yet.
                </h3>
                <p className="text-xs text-graphite mb-6 max-w-sm mx-auto">
                  Explore our 20 categories to take your first proctored test and receive an integrity report.
                </p>
                <Link href="/assessments">
                  <Button variant="secondary" size="sm">
                    Browse assessments
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {attempts.map((attempt) => {
                  const isPassing = (attempt.percentage || 0) >= 60;
                  return (
                    <Card
                      key={attempt._id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-ink">
                            {attempt.assessment?.title || 'Assessment Attempt'}
                          </h3>
                          {attempt.status === 'completed' ? (
                            <StatusChip variant={isPassing ? 'clean' : 'review'} size="sm">
                              {Math.round(attempt.percentage || 0)}%
                            </StatusChip>
                          ) : attempt.status === 'terminated' ? (
                            <StatusChip variant="flagged" size="sm">
                              Terminated
                            </StatusChip>
                          ) : (
                            <StatusChip variant="neutral" size="sm">
                              Incomplete
                            </StatusChip>
                          )}
                        </div>
                        <p className="text-xs text-graphite">
                          Started on {formatDate(attempt.startedAt || Date.now())}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {attempt.status === 'completed' && isPassing && (
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<Award className="w-3.5 h-3.5" />}
                            onClick={() => handleViewCertificate(attempt)}
                          >
                            Certificate
                          </Button>
                        )}
                        {attempt.status === 'completed' && (
                          <Link href={`/results/${attempt._id}`}>
                            <Button variant="outline" size="sm">
                              View report
                            </Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Quick Links */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-lg font-bold text-ink pb-2 border-b border-rule">
              Additional Tools
            </h2>

            <Card className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <Code2 className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-ink">Coding Challenges</h3>
                  <p className="text-xs text-graphite leading-relaxed mt-0.5">
                    Solve real-world algorithm challenges and test implementations.
                  </p>
                </div>
              </div>
              <Link href="/coding">
                <Button variant="secondary" size="sm" className="w-full">
                  Solve challenges
                </Button>
              </Link>
            </Card>

            <Card className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <FolderGit2 className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-ink">Project Portfolio</h3>
                  <p className="text-xs text-graphite leading-relaxed mt-0.5">
                    Submit capstone deliverables and projects for evaluator feedback.
                  </p>
                </div>
              </div>
              <Link href="/projects">
                <Button variant="secondary" size="sm" className="w-full">
                  Submit projects
                </Button>
              </Link>
            </Card>

            <Card className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <HelpCircle className="w-5 h-5 text-signal shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-ink">Support & Inquiries</h3>
                  <p className="text-xs text-graphite leading-relaxed mt-0.5">
                    Have questions about assessments, billing, or certificates?
                  </p>
                </div>
              </div>
              <Link href="/contact">
                <Button variant="outline" size="sm" className="w-full">
                  Contact support
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>

      {selectedAttempt && (
        <CertificateModal
          isOpen={isCertificateOpen}
          onClose={() => setIsCertificateOpen(false)}
          candidateName={user?.name || 'Candidate'}
          assessmentTitle={selectedAttempt.assessment?.title || 'Professional Assessment'}
          completionDate={formatDate(selectedAttempt.completedAt || Date.now())}
          certificateId={selectedAttempt._id.slice(-8).toUpperCase()}
        />
      )}

      <Footer />
    </div>
  );
}

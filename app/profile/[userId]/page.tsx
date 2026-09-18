'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusChip from '@/components/ui/StatusChip';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';
import { formatDate } from '@/src/lib/formatters';
import { User, Award, CheckCircle, Code2, FolderGit2, BookOpen } from 'lucide-react';

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!checkAndClearExpiredSession(router)) return;
    fetchProfile();
  }, [userId, router]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProfile(data.profile);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading variant="spinner" fullScreen text="Loading profile..." />;
  if (!profile) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-ink">
        Profile not found
      </div>
    );
  }

  const { user, mcq, coding, projects, skills, overallScore, candidateStatus } = profile;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-10 md:py-14 w-full">
        {/* User Banner Header */}
        <div className="bg-sheet border border-rule rounded-panel p-8 sm:p-10 shadow-subtle mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-full bg-signal-soft text-signal border-2 border-signal/20 flex items-center justify-center text-2xl font-extrabold">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                  {user.name}
                </h1>
                <p className="text-xs text-graphite mt-0.5">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusChip variant="signal" size="sm">
                    {candidateStatus || 'Active Candidate'}
                  </StatusChip>
                  {user.role === 'admin' && (
                    <StatusChip variant="clean" size="sm">
                      Administrator
                    </StatusChip>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 bg-paper rounded-card border border-rule text-center min-w-[140px]">
              <span className="text-[11px] font-semibold text-graphite uppercase tracking-wider block mb-1">
                Overall Score
              </span>
              <span className="text-3xl font-extrabold text-signal tabular-nums">
                {overallScore ? `${Math.round(overallScore)}%` : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* MCQ Assessments */}
          <Card className="p-6">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-rule">
              <BookOpen className="w-5 h-5 text-signal" />
              <h2 className="text-base font-bold text-ink">MCQ Assessments</h2>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-graphite">Attempts:</span>
                <span className="font-bold text-ink">{mcq?.totalAttempts || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-graphite">Passed:</span>
                <span className="font-bold text-clean">{mcq?.passedAttempts || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-graphite">Average Score:</span>
                <span className="font-bold text-ink">
                  {mcq?.avgScore ? `${Math.round(mcq.avgScore)}%` : '--'}
                </span>
              </div>
            </div>
          </Card>

          {/* Coding Challenges */}
          <Card className="p-6">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-rule">
              <Code2 className="w-5 h-5 text-signal" />
              <h2 className="text-base font-bold text-ink">Coding Challenges</h2>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-graphite">Submitted:</span>
                <span className="font-bold text-ink">{coding?.totalSubmissions || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-graphite">Accepted:</span>
                <span className="font-bold text-clean">{coding?.passedSubmissions || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-graphite">Total Points:</span>
                <span className="font-bold text-ink">{coding?.totalPoints || 0} pts</span>
              </div>
            </div>
          </Card>

          {/* Capstone Projects */}
          <Card className="p-6">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-rule">
              <FolderGit2 className="w-5 h-5 text-signal" />
              <h2 className="text-base font-bold text-ink">Project Portfolio</h2>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-graphite">Projects Submitted:</span>
                <span className="font-bold text-ink">{projects?.total || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-graphite">Evaluated:</span>
                <span className="font-bold text-clean">{projects?.reviewed || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-graphite">Under Review:</span>
                <span className="font-bold text-review">{projects?.underReview || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

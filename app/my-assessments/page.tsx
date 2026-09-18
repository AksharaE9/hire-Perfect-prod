'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Loading from '@/components/ui/Loading';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatusChip from '@/components/ui/StatusChip';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';
import { formatINR, formatDate } from '@/src/lib/formatters';
import { BookOpen, Clock, ChevronDown, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface AssessmentInfo {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  duration?: number;
  totalQuestions?: number;
  difficulty?: string;
  price?: number;
  category?: { _id: string; name: string; slug: string };
  isArchived?: boolean;
}

interface CategoryInfo {
  _id: string;
  name: string;
  slug: string;
  isArchived?: boolean;
}

interface Purchase {
  _id: string;
  purchaseType: 'individual' | 'category' | 'bundle';
  purchasedAt: string;
  amount: number;
  assessment?: AssessmentInfo;
  category?: CategoryInfo;
}

export default function MyAssessmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [categorySubjects, setCategorySubjects] = useState<Record<string, any[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingSubjects, setLoadingSubjects] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAndClearExpiredSession(router)) return;
    loadPurchases();
  }, [router]);

  const loadPurchases = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/payment/purchases', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const failure = await res.json().catch(() => ({}));
        throw new Error(failure.error || 'Failed to load purchases');
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to load purchases');
      setPurchases(data.purchases || []);
    } catch (e: any) {
      setError(e.message || 'Could not load your assessments.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = async (purchaseId: string, catSlug: string, catId?: string) => {
    const nowExpanded = !expanded[purchaseId];
    setExpanded((prev) => ({ ...prev, [purchaseId]: nowExpanded }));

    if (nowExpanded && !categorySubjects[purchaseId]) {
      if (!catSlug && !catId) {
        setCategorySubjects((prev) => ({ ...prev, [purchaseId]: [] }));
        return;
      }

      setLoadingSubjects((prev) => ({ ...prev, [purchaseId]: true }));
      try {
        const token = localStorage.getItem('token');
        const url = catId
          ? `/api/assessments?category=${catId}`
          : `/api/assessments?categorySlug=${catSlug}`;

        const res = await fetch(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setCategorySubjects((prev) => ({
          ...prev,
          [purchaseId]: data.assessments || [],
        }));
      } catch {
        setCategorySubjects((prev) => ({ ...prev, [purchaseId]: [] }));
      } finally {
        setLoadingSubjects((prev) => ({ ...prev, [purchaseId]: false }));
      }
    }
  };

  if (loading) return <Loading variant="spinner" fullScreen text="Loading your assessments..." />;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-10 md:py-14 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6 pb-6 border-b border-rule">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-signal block mb-1">
              Assessment Library
            </span>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight">
              My Unlocked Assessments
            </h1>
            <p className="text-sm text-graphite mt-1">
              Access and launch your proctored assessment attempts.
            </p>
          </div>

          <Link href="/assessments">
            <Button variant="secondary" size="md">
              Browse more categories
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-card bg-flagged-soft border border-flagged/20 text-xs text-flagged">
            {error}
          </div>
        )}

        {purchases.length === 0 ? (
          <Card className="p-12 text-center max-w-lg mx-auto my-8">
            <BookOpen className="w-12 h-12 text-graphite mx-auto mb-4 opacity-50" />
            <h2 className="text-lg font-bold text-ink mb-2">
              No assessments unlocked yet
            </h2>
            <p className="text-xs text-graphite leading-relaxed mb-6">
              When you purchase an individual assessment or a category pack, it will appear here ready to launch.
            </p>
            <Link href="/assessments">
              <Button variant="primary" size="md">
                Browse assessments library
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {purchases.map((purchase) => {
              if (purchase.purchaseType === 'individual' && purchase.assessment) {
                const a = purchase.assessment;
                return (
                  <Card key={purchase._id} className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <StatusChip variant="signal" size="sm">
                            Single Assessment
                          </StatusChip>
                          <span className="text-xs text-graphite">
                            Unlocked {formatDate(purchase.purchasedAt)}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-ink mb-1">{a.title}</h3>
                        <p className="text-xs text-graphite line-clamp-1 mb-3">
                          {a.description || 'Proctored assessment attempt.'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-graphite">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {a.duration || 50} mins
                          </span>
                          <span className="flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5" />
                            {a.totalQuestions || 30} MCQs
                          </span>
                          <span className="flex items-center gap-1.5 text-clean font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            GuardEye AI Protected
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <Link href={`/exam/pre/${a._id}`}>
                          <Button variant="primary" size="md">
                            Start assessment →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              }

              if (purchase.purchaseType === 'category' && purchase.category) {
                const cat = purchase.category;
                const isExp = expanded[purchase._id];
                const subjects = categorySubjects[purchase._id] || [];
                const isLoadingSubs = loadingSubjects[purchase._id];

                return (
                  <Card key={purchase._id} className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-rule">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <StatusChip variant="clean" size="sm">
                            Category Pack (12 Assessments)
                          </StatusChip>
                          <span className="text-xs text-graphite">
                            Unlocked {formatDate(purchase.purchasedAt)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-ink">{cat.name}</h3>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleCategory(purchase._id, cat.slug, cat._id)}
                        rightIcon={
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExp ? 'rotate-180' : ''
                            }`}
                          />
                        }
                      >
                        {isExp ? 'Hide assessments' : 'View all 12 assessments'}
                      </Button>
                    </div>

                    {isExp && (
                      <div className="pt-4 space-y-3">
                        {isLoadingSubs ? (
                          <div className="p-4 text-center text-xs text-graphite animate-pulse">
                            Loading category assessments...
                          </div>
                        ) : subjects.length > 0 ? (
                          subjects.map((sub, idx) => (
                            <div
                              key={sub._id || idx}
                              className="p-4 rounded-card bg-paper border border-rule flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div>
                                <span className="text-xs font-bold text-signal block mb-0.5">
                                  Assessment {idx + 1}
                                </span>
                                <h4 className="text-sm font-bold text-ink">{sub.title}</h4>
                                <div className="flex items-center gap-3 text-[11px] text-graphite mt-1">
                                  <span>{sub.duration || 50} mins</span>
                                  <span>·</span>
                                  <span>{sub.totalQuestions || 30} MCQs</span>
                                </div>
                              </div>
                              <Link href={`/exam/pre/${sub._id}`}>
                                <Button variant="primary" size="sm">
                                  Start test
                                </Button>
                              </Link>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-graphite text-center py-2">
                            Category assessments loaded.
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                );
              }

              return null;
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

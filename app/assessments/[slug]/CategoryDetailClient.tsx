'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronRight, Clock, HelpCircle, CheckCircle, ShieldCheck } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatusChip from '@/components/ui/StatusChip';
import PaymentModal from '@/components/ui/PaymentModal';

interface CategoryDetailClientProps {
  category: {
    name: string;
    slug: string;
    description: string;
    subjects?: readonly string[] | string[];
  };
}

export default function CategoryDetailClient({ category }: CategoryDetailClientProps) {
  const router = useRouter();
  const [dbAssessments, setDbAssessments] = useState<any[]>([]);
  const [userPurchases, setUserPurchases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentPlan, setPaymentPlan] = useState<'individual' | 'category'>('individual');

  useEffect(() => {
    loadCategoryAssessments();
  }, [category.slug]);

  const loadCategoryAssessments = async () => {
    try {
      const token = localStorage.getItem('token');
      const [assessRes, purchasesRes] = await Promise.all([
        fetch(`/api/assessments?category=${category.slug}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        token
          ? fetch('/api/payment/purchases', { headers: { Authorization: `Bearer ${token}` } })
          : Promise.resolve({ json: () => ({ success: true, purchases: [] }) }),
      ]);

      const assessData = await assessRes.json();
      const purchasesData =
        typeof purchasesRes.json === 'function'
          ? await (purchasesRes as Response).json()
          : await purchasesRes;

      if (assessData.success) {
        setDbAssessments(assessData.assessments || []);
      }
      if (purchasesData.success) {
        setUserPurchases(
          purchasesData.purchases?.map(
            (p: any) => p.assessment?.toString() || p.category?.toString()
          ) || []
        );
      }
    } catch (e) {
      console.error('Failed to load category assessments:', e);
    } finally {
      setLoading(false);
    }
  };

  const isPurchased = (item: any): boolean => {
    const id = item._id?.toString();
    const catId = item.category?._id?.toString() || item.category?.toString();
    return userPurchases.some((p) => p === id || p === catId);
  };

  const subjectsList = category.subjects || [];

  const handleAssessmentAction = (item: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/login?redirect=/assessments/${category.slug}`);
      return;
    }

    if (isPurchased(item)) {
      router.push(`/exam/pre/${item._id}`);
    } else {
      setSelectedAssessment(item);
      setPaymentPlan('individual');
      setShowPaymentModal(true);
    }
  };

  const handleUnlockCategory = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push(`/login?redirect=/assessments/${category.slug}`);
      return;
    }

    const firstItem = dbAssessments[0] || {
      _id: `category_${category.slug}`,
      title: `${category.name} — Complete Category`,
      price: 2000,
      category: { name: category.name, slug: category.slug },
    };
    setSelectedAssessment(firstItem);
    setPaymentPlan('category');
    setShowPaymentModal(true);
  };

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-graphite mb-6">
        <Link href="/assessments" className="hover:text-ink transition-colors">
          Assessments
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-rule-strong" />
        <span className="text-ink font-medium truncate">{category.name}</span>
      </nav>

      {/* Category Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        <div className="lg:col-span-8">
          <div className="flex items-center gap-3 mb-3">
            <StatusChip variant="signal" size="sm">
              12 Assessments Included
            </StatusChip>
            <span className="text-xs text-graphite">GuardEye AI Protected</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-4">
            {category.name}
          </h1>

          <p className="text-base text-graphite leading-relaxed mb-6 max-w-2xl">
            {category.description}
          </p>

          {/* Topics Covered Badges */}
          {subjectsList.length > 0 && (
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-graphite block mb-2">
                What&apos;s covered:
              </span>
              <div className="flex flex-wrap gap-2">
                {subjectsList.map((subj, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-graphite bg-sheet border border-rule px-3 py-1 rounded-chip"
                  >
                    {subj}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Hero Image */}
        <div className="lg:col-span-4">
          <div className="relative aspect-[4/3] rounded-card overflow-hidden bg-sheet border border-rule shadow-subtle">
            <Image
              src={`/images/categories/${category.slug}.webp`}
              alt={`Illustration for ${category.name}`}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Assessment List (Left) + Unlock Pack (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 12 Assessments List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rule">
            <h2 className="text-lg font-bold text-ink">Assessment Modules</h2>
            <span className="text-xs text-graphite tabular-nums">
              {dbAssessments.length > 0 ? dbAssessments.length : subjectsList.length} total
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-sheet border border-rule rounded-card animate-pulse" />
              ))}
            </div>
          ) : dbAssessments.length > 0 ? (
            dbAssessments.map((item, idx) => {
              const bought = isPurchased(item);
              return (
                <Card
                  key={item._id || idx}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-150"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-xs font-bold text-signal font-mono">
                        Assessment {idx + 1}
                      </span>
                      <span className="text-[11px] text-graphite bg-paper px-2 py-0.5 rounded-chip border border-rule capitalize">
                        {item.level || 'All Levels'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-ink mb-1.5">{item.title}</h3>
                    <p className="text-xs text-graphite line-clamp-1">{item.description}</p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-graphite">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {item.duration || 50} mins
                      </span>
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" />
                        {item.totalQuestions || 30} MCQs
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-rule">
                    {!bought && (
                      <span className="text-base font-bold text-ink">
                        ₹{item.price || 500}
                      </span>
                    )}
                    <Button
                      variant={bought ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleAssessmentAction(item)}
                    >
                      {bought ? 'Start assessment' : 'Buy for ₹500'}
                    </Button>
                  </div>
                </Card>
              );
            })
          ) : (
            subjectsList.map((subject, idx) => (
              <Card
                key={idx}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <span className="text-xs font-bold text-signal font-mono">
                    Assessment {idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-ink mt-1 mb-1">{subject}</h3>
                  <div className="flex items-center gap-4 text-xs text-graphite">
                    <span>50 mins</span>
                    <span>·</span>
                    <span>30 MCQs</span>
                    <span>·</span>
                    <span>GuardEye Proctored</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleUnlockCategory}
                >
                  Buy for ₹500
                </Button>
              </Card>
            ))
          )}
        </div>

        {/* Right Side: Category Combo Unlock Card & Visual Badges */}
        <div className="lg:col-span-4 sticky top-24 space-y-6">
          <Card className="p-6 bg-sheet border-2 border-signal shadow-floating">
            <span className="text-[11px] font-bold uppercase tracking-wider text-signal bg-signal-soft px-2.5 py-0.5 rounded-chip inline-block mb-3">
              Most popular
            </span>
            <h3 className="text-xl font-bold text-ink mb-1">
              Unlock All 12 Assessments
            </h3>
            <p className="text-xs text-graphite mb-6">
              Get complete lifetime access to all assessments in {category.name}.
            </p>

            <div className="mb-6">
              <span className="text-3xl font-extrabold text-ink">₹2,000</span>
              <span className="text-xs text-graphite block mt-1">One-time payment · Save ₹4,000</span>
            </div>

            <ul className="space-y-2.5 text-xs text-graphite mb-8">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-clean shrink-0" />
                <span>All 12 category assessments</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-clean shrink-0" />
                <span>Individual completion certificates</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-clean shrink-0" />
                <span>GuardEye AI proctored integrity report</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-clean shrink-0" />
                <span>Instant scoring and result storage</span>
              </li>
            </ul>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleUnlockCategory}
            >
              Unlock category for ₹2,000
            </Button>
          </Card>

          {/* Verified Certificate Sample Card */}
          <Card className="p-5 bg-sheet border border-rule overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-ink">
                Verified Credential
              </span>
              <StatusChip variant="clean" size="sm">Accredited</StatusChip>
            </div>
            <div className="relative aspect-[16/10] w-full rounded-card overflow-hidden border border-rule bg-paper mb-3">
              <Image
                src="/images/certificate-sample.webp"
                alt="Accredited Certificate Preview"
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                className="object-cover"
              />
            </div>
            <p className="text-xs text-graphite leading-relaxed">
              Earn a verifiable digital certificate with unique credential ID and tamper-proof proctoring seal upon scoring 60%+ on any assessment.
            </p>
          </Card>
        </div>
      </div>

      {/* Razorpay Payment Modal Integration */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        assessment={selectedAssessment}
        defaultPlan={paymentPlan}
        onSuccess={() => {
          loadCategoryAssessments();
        }}
      />
    </div>
  );
}

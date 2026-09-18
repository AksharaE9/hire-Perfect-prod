'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatusChip from '@/components/ui/StatusChip';
import Loading from '@/components/ui/Loading';
import { ArrowLeft, CheckCircle2, Clock, HelpCircle, ShieldCheck } from 'lucide-react';
import { formatRupees } from '@/src/lib/formatters';

type LevelKey = 'beginner' | 'intermediate' | 'advanced';

type LevelInfo = {
  level: LevelKey;
  questionDifficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  isAvailable: boolean;
};

type AssessmentDetails = {
  _id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  category?: {
    name?: string;
    slug?: string;
  };
};

export default function IndividualAssessmentClient({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessment, setAssessment] = useState<AssessmentDetails | null>(null);
  const [levels, setLevels] = useState<LevelInfo[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>('intermediate');
  const [userPurchases, setUserPurchases] = useState<string[]>([]);

  useEffect(() => {
    const loadPageData = async () => {
      try {
        const token = localStorage.getItem('token');
        const fetchAssessment = fetch(`/api/assessments/${id}`);
        const fetchPurchases = token
          ? fetch('/api/payment/purchases', { headers: { Authorization: `Bearer ${token}` } })
          : Promise.resolve(null);

        const [assessmentRes, purchasesRes] = await Promise.all([fetchAssessment, fetchPurchases]);
        const assessmentData = await assessmentRes.json();

        if (!assessmentData.success) {
          setError(assessmentData.error || 'Failed to load assessment.');
          return;
        }

        setAssessment(assessmentData.assessment);
        setLevels(assessmentData.levels || []);

        const firstAvailable = (assessmentData.levels || []).find((level: LevelInfo) => level.isAvailable);
        if (firstAvailable?.level) {
          setSelectedLevel(firstAvailable.level);
        }

        if (purchasesRes) {
          const purchasesData = await purchasesRes.json();
          if (purchasesData.success) {
            const ids = (purchasesData.purchases || [])
              .map((p: any) => {
                if (p.purchaseType === 'individual') return p.assessment?._id || p.assessment;
                if (p.purchaseType === 'category') return p.category?._id || p.category;
                if (p.purchaseType === 'bundle') return 'FULL_BUNDLE';
                return null;
              })
              .filter(Boolean);
            setUserPurchases(ids);
          }
        }
      } catch (fetchError) {
        console.error('Assessment detail load error:', fetchError);
        setError('Unable to load assessment details.');
      } finally {
        setLoading(false);
      }
    };

    void loadPageData();
  }, [id]);

  const isPurchased = (ass: AssessmentDetails | null): boolean => {
    if (!ass) return false;
    if (userPurchases.includes('FULL_BUNDLE')) return true;
    const assId = ass._id?.toString();
    return userPurchases.some((p) => p === assId);
  };

  const selectedLevelInfo = useMemo(
    () => levels.find((level) => level.level === selectedLevel),
    [levels, selectedLevel]
  );

  const handleContinue = () => {
    router.push(`/exam/pre/${id}?level=${selectedLevel}`);
  };

  if (loading) {
    return <Loading variant="spinner" fullScreen text="Loading assessment..." />;
  }

  if (error || !assessment) {
    return (
      <div className="text-center py-20">
        <p className="text-flagged text-body-md mb-6">{error || 'Assessment not found.'}</p>
        <Button variant="secondary" onClick={() => router.push('/assessments')}>
          Back to assessments
        </Button>
      </div>
    );
  }

  const purchased = isPurchased(assessment);

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.push('/assessments')}
        className="inline-flex items-center gap-2 text-graphite hover:text-ink text-body-sm font-medium mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to assessments
      </button>

      <div className="mb-8">
        <span className="text-caption font-semibold text-signal uppercase tracking-wider">
          {assessment.category?.name || 'Assessment'}
        </span>
        <h1 className="text-display-md text-ink font-bold mt-2">{assessment.title}</h1>
        <p className="text-graphite text-body-md mt-4 leading-relaxed max-w-2xl">{assessment.description}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-heading-md font-semibold text-ink mb-4">Select difficulty level</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {levels.map((level) => {
            const isSelected = selectedLevel === level.level;
            return (
              <button
                key={level.level}
                type="button"
                disabled={!level.isAvailable}
                onClick={() => setSelectedLevel(level.level)}
                className={`text-left p-5 rounded-card border transition-all ${
                  isSelected
                    ? 'border-signal bg-signal-soft/40 shadow-card'
                    : 'border-rule bg-sheet hover:border-rule-strong'
                } ${!level.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-caption font-bold uppercase tracking-wider text-signal">{level.level}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-signal" />}
                </div>
                <p className="text-ink font-medium capitalize text-body-md">{level.questionDifficulty} questions</p>
                <p className="text-graphite text-body-sm mt-1">{level.questionCount} questions available</p>
              </button>
            );
          })}
        </div>
      </div>

      <Card className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-graphite text-body-sm">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-signal" />
              {assessment.duration} minutes
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-signal" />
              {selectedLevelInfo?.questionCount || 30} questions
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-clean" />
              GuardEye AI proctored
            </span>
          </div>

          <div className="pt-2">
            {purchased ? (
              <StatusChip variant="clean">Access unlocked</StatusChip>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-heading-md font-bold text-ink">{formatRupees(assessment.price || 500)}</span>
                <span className="text-graphite text-body-sm">one-time assessment fee</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => router.push('/assessments')}>
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedLevelInfo?.isAvailable}
          >
            {purchased ? 'Start pre-exam check' : 'Continue to pre-assessment'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

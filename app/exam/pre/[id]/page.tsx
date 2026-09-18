'use client';

import React, { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CameraManager } from '@/lib/cameraManager';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';
import Navbar from '@/components/ui/Navbar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatusChip from '@/components/ui/StatusChip';
import Loading from '@/components/ui/Loading';
import { Camera, CheckCircle2, AlertCircle, Shield, Info, ArrowLeft } from 'lucide-react';

type CameraStatus = 'idle' | 'requesting' | 'ready' | 'error';

interface AssessmentStartData {
  title?: string;
  duration?: number;
  selectedLevel?: 'beginner' | 'intermediate' | 'advanced';
  attemptId: string;
}

function PreAssessmentContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const selectedLevel = searchParams.get('level');

  const isMountedRef = useRef(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<AssessmentStartData | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const attachVideo = useCallback(async (stream: MediaStream) => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    try {
      await videoRef.current.play();
    } catch (playError) {
      const name = playError instanceof DOMException ? playError.name : '';
      if (name === 'AbortError') {
        await new Promise((resolve) => setTimeout(resolve, 80));
        if (isMountedRef.current && videoRef.current) {
          await videoRef.current.play().catch(() => undefined);
        }
      } else {
        throw playError;
      }
    }
  }, []);

  const loadAssessment = useCallback(async () => {
    if (!assessmentId) {
      setError('Invalid assessment id.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/assessments/${assessmentId}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level: selectedLevel || undefined,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to initialize assessment attempt.');
        return;
      }

      setAssessment({ ...data.assessment, attemptId: data.attempt.id });
    } catch (fetchError) {
      console.error('Pre-assessment load error:', fetchError);
      setError('System error while creating attempt.');
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, [assessmentId, selectedLevel]);

  const initCamera = useCallback(async () => {
    setCameraError(null);
    setCameraStatus('requesting');

    try {
      let stream = CameraManager.getStream();
      if (!stream) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640, max: 960 },
            height: { ideal: 480, max: 540 },
            frameRate: { ideal: 15, max: 24 },
          },
          audio: false,
        });
        CameraManager.setStream(stream);
      }

      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      await attachVideo(stream);
      setCameraStatus('ready');
    } catch (cameraInitError) {
      console.error('Camera access error:', cameraInitError);
      setCameraError('Unable to access your webcam. Please grant camera permission in your browser.');
      setCameraStatus('error');
    }
  }, [attachVideo]);

  useEffect(() => {
    if (!checkAndClearExpiredSession(router)) return;
    isMountedRef.current = true;
    void loadAssessment();
    void initCamera();

    return () => {
      isMountedRef.current = false;
    };
  }, [initCamera, loadAssessment, router]);

  const handleStart = () => {
    if (!assessment?.attemptId) return;
    router.push(`/exam/${assessment.attemptId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-sm font-medium text-graphite animate-pulse">
          Initializing assessment environment...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-10 md:py-14 w-full">
        {/* Top Header */}
        <div className="mb-8">
          <Link
            href="/assessments"
            className="inline-flex items-center gap-1.5 text-xs text-graphite hover:text-ink transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to assessments</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Pre-Exam System Verification
            </h1>
            <StatusChip variant="signal" size="sm">
              GuardEye AI
            </StatusChip>
          </div>
          <p className="text-sm text-graphite mt-1">
            {assessment?.title || 'Professional Assessment'} · {assessment?.duration || 50} Minutes
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-card bg-flagged-soft border border-flagged/20 text-xs text-flagged flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Webcam Calibration Preview */}
          <div className="lg:col-span-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-ink">
                  Camera Feed Calibration
                </span>
                <StatusChip
                  variant={
                    cameraStatus === 'ready'
                      ? 'clean'
                      : cameraStatus === 'error'
                      ? 'flagged'
                      : 'review'
                  }
                  size="sm"
                >
                  {cameraStatus === 'ready'
                    ? 'Camera Active'
                    : cameraStatus === 'error'
                    ? 'Permission Required'
                    : 'Connecting...'}
                </StatusChip>
              </div>

              <div className="relative aspect-video rounded-card overflow-hidden bg-sheet border border-rule mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {cameraStatus !== 'ready' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-sheet/90 backdrop-blur-sm">
                    <Camera className="w-10 h-10 text-graphite mb-2 animate-pulse" />
                    <p className="text-xs text-graphite max-w-xs">
                      {cameraError || 'Waiting for webcam permission. Please allow access when prompted.'}
                    </p>
                    {cameraStatus === 'error' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-4"
                        onClick={() => initCamera()}
                      >
                        Retry Camera
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-graphite leading-relaxed">
                Ensure your face is centred, well-lit, and directly facing the screen before beginning.
              </p>
            </Card>
          </div>

          {/* Right Column: Pre-Flight Checklist & Consent */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="p-6">
              <h2 className="text-base font-bold text-ink mb-4">
                Pre-Flight Rules & Integrity Checks
              </h2>

              <ul className="space-y-3 text-xs text-graphite mb-6">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-clean shrink-0 mt-0.5" />
                  <span>The examination window will be enforced in full-screen mode.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-clean shrink-0 mt-0.5" />
                  <span>GuardEye AI monitors tab switches, focus shifts, and face presence.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-clean shrink-0 mt-0.5" />
                  <span>Clipboard interactions (copy, paste, cut) are disabled and logged.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-clean shrink-0 mt-0.5" />
                  <span>A total violation limit of 5 flags applies before attempt auto-termination.</span>
                </li>
              </ul>

              {/* Collapsible What is Monitored link */}
              <div className="p-3.5 rounded-card bg-paper border border-rule mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-ink">Want to know more about proctoring?</span>
                  <Link
                    href="/integrity"
                    target="_blank"
                    className="text-signal font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Read guide</span>
                    <Info className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2 border-t border-rule mb-6">
                <label className="flex items-start gap-2.5 text-xs text-ink cursor-pointer select-none leading-relaxed">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded border-rule-strong text-signal focus:ring-signal"
                  />
                  <span>
                    I confirm that I am in a quiet environment and agree to take this assessment under GuardEye AI proctoring controls.
                  </span>
                </label>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!consent || cameraStatus !== 'ready' || !assessment?.attemptId}
                onClick={handleStart}
              >
                Begin assessment attempt
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PreAssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-paper flex flex-col justify-center items-center gap-3">
          <Loading size="lg" />
          <p className="text-xs text-graphite font-mono">Calibrating assessment environment...</p>
        </div>
      }
    >
      <PreAssessmentContent />
    </Suspense>
  );
}


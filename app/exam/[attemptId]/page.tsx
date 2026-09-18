'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CameraManager } from '@/lib/cameraManager';
import { EXAM_CONFIG, VIOLATION_TYPES } from '@/lib/constants';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

interface ExamQuestion {
    _id: string;
    question: string;
    options: string[];
}

interface DisplayOption {
    text: string;
    originalIndex: number;
}

interface DisplayQuestion extends ExamQuestion {
    displayOptions: DisplayOption[];
}

type CameraStatus = 'idle' | 'requesting' | 'ready' | 'error';

interface WarningState {
    show: boolean;
    message: string;
}

interface FaceLandmarkerInstance {
    detectForVideo: (video: HTMLVideoElement, timestampMs: number) => { faceLandmarks?: Array<Array<{ x: number; y: number }>> };
    close?: () => void;
}

const DEFAULT_VIOLATION_COOLDOWN_MS = 3500;
const VIOLATION_COOLDOWN_MS: Record<string, number> = {
    [VIOLATION_TYPES.LOOKING_AWAY]: 2200,
    [VIOLATION_TYPES.SUDDEN_MOVEMENT]: 1000,
    [VIOLATION_TYPES.GAZE_DEVIATION]: 1000,
    [VIOLATION_TYPES.FACE_NOT_DETECTED]: 900,
    [VIOLATION_TYPES.MULTIPLE_FACES]: 1000,
};
const PROCTORING_WARMUP_MS = 3000;

function hashString(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
        hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

function seededShuffleIndices(length: number, seed: number): number[] {
    const indices = Array.from({ length }, (_, idx) => idx);
    let state = seed || 1;

    for (let i = indices.length - 1; i > 0; i -= 1) {
        state = (state * 1664525 + 1013904223) >>> 0;
        const j = state % (i + 1);
        const temp = indices[i];
        indices[i] = indices[j];
        indices[j] = temp;
    }

    return indices;
}

export default function ExamPage() {
    const params = useParams<{ attemptId: string }>();
    const router = useRouter();
    const attemptId = Array.isArray(params?.attemptId) ? params.attemptId[0] : params?.attemptId;

    const isMountedRef = useRef(true);
    const originalConsoleErrorRef = useRef<typeof console.error | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const faceLandmarkerRef = useRef<FaceLandmarkerInstance | null>(null);
    const isProctoringActiveRef = useRef(false);
    const isInitializingProctoringRef = useRef(false);
    const animationRef = useRef<number | null>(null);
    const lastVideoTimeRef = useRef(-1);
    const lastDetectionTsRef = useRef(0);
    const violationCooldownRef = useRef<Record<string, number>>({});
    const previousNoseRef = useRef<{ x: number; y: number } | null>(null);
    const obstructionStreakRef = useRef(0);
    const faceMissingStreakRef = useRef(0);
    const headAwayStreakRef = useRef(0);
    const suddenMoveStreakRef = useRef(0);
    const gazeStreakRef = useRef(0);
    const baselineYawRef = useRef(0);
    const baselinePitchRef = useRef(0);
    const baselineGazeRef = useRef(0);
    const baselineSamplesRef = useRef(0);
    const proctoringStartTsRef = useRef(0);
    const frameCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDetectingRef = useRef(false);
    const violationCountRef = useRef(0);
    const terminatedRef = useRef(false);
    const loadingRef = useRef(true);
    const attemptIdRef = useRef<string | undefined>(attemptId);
    const lastAIDetectTsRef = useRef(0);
    const aiFrameCounterRef = useRef(0);
    const restartingAIRef = useRef(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<ExamQuestion[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [terminated, setTerminated] = useState(false);

    const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [proctoringReady, setProctoringReady] = useState(false);
    const [violationCount, setViolationCount] = useState(0);
    const [warning, setWarning] = useState<WarningState>({ show: false, message: '' });
    const [aiLastFaceCount, setAiLastFaceCount] = useState(0);
    const [aiFps, setAiFps] = useState(0);

    const displayQuestions = useMemo<DisplayQuestion[]>(() => {
        return questions.map((question) => {
            const options = question.options || [];
            const seed = hashString(`${attemptId || ''}:${question._id}`);
            const shuffledIndices = seededShuffleIndices(options.length, seed);

            return {
                ...question,
                displayOptions: shuffledIndices.map((originalIndex) => ({
                    text: options[originalIndex],
                    originalIndex,
                })),
            };
        });
    }, [attemptId, questions]);

    const activeQuestion = displayQuestions[currentQuestion];
    const progress = useMemo(() => (
        questions.length ? ((currentQuestion + 1) / questions.length) * 100 : 0
    ), [currentQuestion, questions.length]);

    const showWarning = useCallback((message: string) => {
        setWarning({ show: true, message });
        window.setTimeout(() => {
            if (isMountedRef.current) {
                setWarning({ show: false, message: '' });
            }
        }, 2500);
    }, []);

    useEffect(() => {
        violationCountRef.current = violationCount;
    }, [violationCount]);

    useEffect(() => {
        terminatedRef.current = terminated;
    }, [terminated]);

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    useEffect(() => {
        attemptIdRef.current = attemptId;
    }, [attemptId]);

    const cleanupProctoring = useCallback(() => {
        isProctoringActiveRef.current = false;
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        faceLandmarkerRef.current = null;
        setProctoringReady(false);
        previousNoseRef.current = null;
        lastVideoTimeRef.current = -1;
        lastAIDetectTsRef.current = 0;
        aiFrameCounterRef.current = 0;
        faceMissingStreakRef.current = 0;
        headAwayStreakRef.current = 0;
        suddenMoveStreakRef.current = 0;
        gazeStreakRef.current = 0;
        baselineYawRef.current = 0;
        baselinePitchRef.current = 0;
        baselineGazeRef.current = 0;
        baselineSamplesRef.current = 0;
        proctoringStartTsRef.current = 0;
        setAiLastFaceCount(0);
        setAiFps(0);
        isInitializingProctoringRef.current = false;
    }, []);

    const installConsoleFilter = useCallback(() => {
        if (originalConsoleErrorRef.current) return;

        originalConsoleErrorRef.current = console.error;
        console.error = (...args: unknown[]) => {
            const combined = args.map((arg) => String(arg)).join(' ');
            if (combined.includes('Created TensorFlow Lite XNNPACK delegate for CPU')) {
                return;
            }
            originalConsoleErrorRef.current?.(...args);
        };
    }, []);

    const removeConsoleFilter = useCallback(() => {
        if (!originalConsoleErrorRef.current) return;
        console.error = originalConsoleErrorRef.current;
        originalConsoleErrorRef.current = null;
    }, []);

    const logViolation = useCallback(async (
        type: string,
        description: string,
        severity: 'low' | 'medium' | 'high' | 'critical' = 'high'
    ) => {
        const activeAttemptId = attemptIdRef.current;
        if (!activeAttemptId) return;

        const now = Date.now();
        const cooldownMs = VIOLATION_COOLDOWN_MS[type] ?? DEFAULT_VIOLATION_COOLDOWN_MS;
        const last = violationCooldownRef.current[type] || 0;
        if (now - last < cooldownMs) return;
        violationCooldownRef.current[type] = now;

        const currentCount = violationCountRef.current + 1;
        violationCountRef.current = currentCount;
        setViolationCount(currentCount);
        showWarning(description);

        if (currentCount >= EXAM_CONFIG.MAX_VIOLATIONS) {
            setTerminated(true);
            terminatedRef.current = true;
            cleanupProctoring();
            CameraManager.stop();
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/violations/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    attemptId: activeAttemptId,
                    type,
                    severity,
                    description,
                }),
            });
            const data = await res.json();

            if (typeof data.violationCount === 'number') {
                violationCountRef.current = data.violationCount;
                setViolationCount(data.violationCount);
            }

            if (data.terminated) {
                setTerminated(true);
                terminatedRef.current = true;
                cleanupProctoring();
                CameraManager.stop();
            }
        } catch (logError) {
            console.error('Failed to log violation:', logError);
        }
    }, [cleanupProctoring, showWarning]);

    const detectFrame = useCallback(async () => {
        if (!isMountedRef.current || !isProctoringActiveRef.current || !faceLandmarkerRef.current || !videoRef.current) return;
        if (isDetectingRef.current) {
            return;
        }

        isDetectingRef.current = true;
        try {
            const video = videoRef.current;
            if (video.readyState < 2) {
                return;
            }
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                return;
            }

            if (video.currentTime === lastVideoTimeRef.current) {
                return;
            }
            lastVideoTimeRef.current = video.currentTime;
            const now = performance.now();
            if (now - lastDetectionTsRef.current < 66) {
                return;
            }
            lastDetectionTsRef.current = now;

            const landmarker = faceLandmarkerRef.current;
            if (!landmarker) return;
            let result: { faceLandmarks?: Array<Array<{ x: number; y: number }>> } | null = null;

            try {
                result = landmarker.detectForVideo(video, now);
            } catch (detectError) {
                const detectMessage = detectError instanceof Error ? detectError.message.toLowerCase() : String(detectError).toLowerCase();
                const transientDetectError =
                    detectMessage.includes('xnnpack') ||
                    detectMessage.includes('delegate') ||
                    detectMessage.includes('not ready');

                if (!transientDetectError) {
                    throw detectError;
                }
            }

            if (!result) {
                return;
            }
            const faces = result.faceLandmarks || [];
            aiFrameCounterRef.current += 1;
            lastAIDetectTsRef.current = Date.now();
            setAiLastFaceCount(faces.length);
            const inWarmup = (Date.now() - proctoringStartTsRef.current) < PROCTORING_WARMUP_MS;
            let frameViolation: { type: string; message: string } | null = null;

            let lensLikelyBlocked = false;
            if (faces.length === 0) {
                try {
                    let canvas = frameCanvasRef.current;
                    if (!canvas) {
                        canvas = document.createElement('canvas');
                        canvas.width = 32;
                        canvas.height = 24;
                        frameCanvasRef.current = canvas;
                    }
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                        let dark = 0;
                        let lumaSum = 0;
                        const total = pixels.length / 4;
                        for (let i = 0; i < pixels.length; i += 4) {
                            const r = pixels[i];
                            const g = pixels[i + 1];
                            const b = pixels[i + 2];
                            const luma = 0.299 * r + 0.587 * g + 0.114 * b;
                            lumaSum += luma;
                            if (luma < 28) dark += 1;
                        }
                        const darkRatio = dark / Math.max(total, 1);
                        const avgLuma = lumaSum / Math.max(total, 1);
                        lensLikelyBlocked = darkRatio > 0.9 || avgLuma < 25;
                    }
                } catch {
                    lensLikelyBlocked = false;
                }
            }

            if (faces.length === 0) {
                faceMissingStreakRef.current += 1;
                headAwayStreakRef.current = 0;
                suddenMoveStreakRef.current = 0;
                gazeStreakRef.current = 0;
                if (lensLikelyBlocked) {
                    obstructionStreakRef.current += 1;
                } else {
                    obstructionStreakRef.current = 0;
                }
                if (faceMissingStreakRef.current >= 2) {
                    frameViolation = {
                        type: VIOLATION_TYPES.FACE_NOT_DETECTED,
                        message: obstructionStreakRef.current >= 2
                            ? 'Camera lens appears blocked. Keep camera unobstructed.'
                            : 'Face not detected in camera frame.'
                    };
                }
            } else if (faces.length > 1) {
                obstructionStreakRef.current = 0;
                faceMissingStreakRef.current = 0;
                headAwayStreakRef.current = 0;
                suddenMoveStreakRef.current = 0;
                gazeStreakRef.current = 0;
                frameViolation = { type: VIOLATION_TYPES.MULTIPLE_FACES, message: 'Multiple faces detected.' };
            } else {
                obstructionStreakRef.current = 0;
                faceMissingStreakRef.current = 0;
                const landmarks = faces[0];
                const nose = landmarks?.[1];
                const leftEye = landmarks?.[33];
                const rightEye = landmarks?.[263];

                if (nose && leftEye && rightEye) {
                    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
                    const eyeCenterY = (leftEye.y + rightEye.y) / 2;
                    const eyeDistance = Math.max(Math.abs(rightEye.x - leftEye.x), 0.0001);
                    const yaw = (nose.x - eyeCenterX) / eyeDistance;
                    const pitch = (nose.y - eyeCenterY) / eyeDistance;
                    const leftIris = landmarks?.[468];
                    const rightIris = landmarks?.[473];
                    const leftInner = landmarks?.[133];
                    const leftOuter = landmarks?.[33];
                    const rightInner = landmarks?.[362];
                    const rightOuter = landmarks?.[263];
                    let gazeOffset: number | null = null;
                    if (leftIris && rightIris && leftInner && leftOuter && rightInner && rightOuter) {
                        const leftWidth = Math.max(Math.abs(leftOuter.x - leftInner.x), 0.0001);
                        const rightWidth = Math.max(Math.abs(rightOuter.x - rightInner.x), 0.0001);
                        const leftCenter = (leftOuter.x + leftInner.x) / 2;
                        const rightCenter = (rightOuter.x + rightInner.x) / 2;
                        const leftOffset = (leftIris.x - leftCenter) / leftWidth;
                        const rightOffset = (rightIris.x - rightCenter) / rightWidth;
                        gazeOffset = (leftOffset + rightOffset) / 2;
                    }

                    if (inWarmup) {
                        const n = baselineSamplesRef.current;
                        baselineYawRef.current = (baselineYawRef.current * n + yaw) / (n + 1);
                        baselinePitchRef.current = (baselinePitchRef.current * n + pitch) / (n + 1);
                        if (gazeOffset !== null) {
                            baselineGazeRef.current = (baselineGazeRef.current * n + gazeOffset) / (n + 1);
                        }
                        baselineSamplesRef.current = n + 1;
                    }

                    if (inWarmup) {
                        headAwayStreakRef.current = 0;
                    } else if (
                        baselineSamplesRef.current >= 8 &&
                        (Math.abs(yaw - baselineYawRef.current) > 0.22 || Math.abs(pitch - baselinePitchRef.current) > 0.24)
                    ) {
                        headAwayStreakRef.current += 1;
                    } else {
                        headAwayStreakRef.current = 0;
                    }

                    // Sudden head movement approximation via nose displacement
                    const previousNose = previousNoseRef.current;
                    if (previousNose) {
                        const dx = Math.abs(nose.x - previousNose.x);
                        const dy = Math.abs(nose.y - previousNose.y);
                        if (inWarmup) {
                            suddenMoveStreakRef.current = 0;
                        } else if (dx > 0.04 || dy > 0.04) {
                            suddenMoveStreakRef.current += 1;
                        } else {
                            suddenMoveStreakRef.current = 0;
                        }
                    }
                    previousNoseRef.current = { x: nose.x, y: nose.y };
                    if (inWarmup) {
                        gazeStreakRef.current = 0;
                    } else if (
                        gazeOffset !== null &&
                        baselineSamplesRef.current >= 8 &&
                        Math.abs(gazeOffset - baselineGazeRef.current) > 0.18
                    ) {
                        gazeStreakRef.current += 1;
                    } else {
                        gazeStreakRef.current = 0;
                    }
                } else {
                    gazeStreakRef.current = 0;
                }

                if (!inWarmup) {
                    if (headAwayStreakRef.current >= 3) {
                        frameViolation = {
                            type: VIOLATION_TYPES.LOOKING_AWAY,
                            message: 'Please keep your face centered and look at the screen.'
                        };
                    } else if (suddenMoveStreakRef.current >= 2) {
                        frameViolation = {
                            type: VIOLATION_TYPES.SUDDEN_MOVEMENT,
                            message: 'Excessive head movement detected. Keep stable posture.'
                        };
                    } else if (gazeStreakRef.current >= 3) {
                        frameViolation = {
                            type: VIOLATION_TYPES.GAZE_DEVIATION,
                            message: 'Eye gaze deviation detected. Keep eyes on the screen.'
                        };
                    }
                }
            }

            if (frameViolation) {
                await logViolation(frameViolation.type, frameViolation.message);
                if (frameViolation.type === VIOLATION_TYPES.LOOKING_AWAY) {
                    headAwayStreakRef.current = 0;
                } else if (frameViolation.type === VIOLATION_TYPES.SUDDEN_MOVEMENT) {
                    suddenMoveStreakRef.current = 0;
                } else if (frameViolation.type === VIOLATION_TYPES.GAZE_DEVIATION) {
                    gazeStreakRef.current = 0;
                }
            }
        } catch (detectionError) {
            const message = detectionError instanceof Error ? detectionError.message : String(detectionError);
            const benignShutdown =
                message.toLowerCase().includes('closed') ||
                message.toLowerCase().includes('disposed') ||
                message.toLowerCase().includes('not initialized') ||
                message.toLowerCase().includes('xnnpack delegate') ||
                !isProctoringActiveRef.current;

            if (!benignShutdown) {
                console.warn('Detection loop warning:', detectionError);
            }
        } finally {
            isDetectingRef.current = false;
            if (isMountedRef.current && !terminatedRef.current && isProctoringActiveRef.current) {
                animationRef.current = requestAnimationFrame(() => { void detectFrame(); });
            }
        }
    }, [logViolation]);

    const initializeProctoring = useCallback(async () => {
        if (isInitializingProctoringRef.current || faceLandmarkerRef.current) return;
        isInitializingProctoringRef.current = true;
        try {
            const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
            const resolver = await FilesetResolver.forVisionTasks(
                'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm'
            );
            const modelAssetPath = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

            let landmarker: FaceLandmarkerInstance | null = null;
            try {
                landmarker = await FaceLandmarker.createFromOptions(resolver, {
                    baseOptions: {
                        modelAssetPath,
                        delegate: 'GPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 2,
                    outputFaceBlendshapes: false,
                });
            } catch (gpuError) {
                console.warn('GPU delegate unavailable, falling back to CPU delegate.', gpuError);
                landmarker = await FaceLandmarker.createFromOptions(resolver, {
                    baseOptions: {
                        modelAssetPath,
                        delegate: 'CPU',
                    },
                    runningMode: 'VIDEO',
                    numFaces: 2,
                    outputFaceBlendshapes: false,
                });
            }

            if (!isMountedRef.current) {
                isInitializingProctoringRef.current = false;
                return;
            }

            faceLandmarkerRef.current = landmarker;
            isProctoringActiveRef.current = true;
            setProctoringReady(true);
            proctoringStartTsRef.current = Date.now();
            lastAIDetectTsRef.current = Date.now();
            previousNoseRef.current = null;
            faceMissingStreakRef.current = 0;
            headAwayStreakRef.current = 0;
            suddenMoveStreakRef.current = 0;
            gazeStreakRef.current = 0;
            baselineYawRef.current = 0;
            baselinePitchRef.current = 0;
            baselineGazeRef.current = 0;
            baselineSamplesRef.current = 0;
            if (!animationRef.current) {
                animationRef.current = requestAnimationFrame(() => { void detectFrame(); });
            }
        } catch (setupError) {
            console.error('Failed to initialize MediaPipe:', setupError);
            setCameraError('Camera is active but face detection engine failed to load.');
        } finally {
            isInitializingProctoringRef.current = false;
        }
    }, [detectFrame]);

    const attachStreamToVideo = useCallback(async () => {
        if (!streamRef.current || !videoRef.current) return false;

        const stream = streamRef.current;
        const video = videoRef.current;
        if (video.srcObject !== stream) {
            video.srcObject = stream;
        }

        try {
            await video.play();
            return true;
        } catch (playError) {
            const name = playError instanceof DOMException ? playError.name : '';
            if (name === 'AbortError') {
                await new Promise((resolve) => setTimeout(resolve, 80));
                if (isMountedRef.current && videoRef.current) {
                    await videoRef.current.play().catch(() => undefined);
                    return true;
                }
                return false;
            }
            throw playError;
        }
    }, []);

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

            streamRef.current = stream;
            await attachStreamToVideo();

            setCameraStatus('ready');
            await initializeProctoring();
        } catch (cameraInitError) {
            console.error('Camera initialization failed:', cameraInitError);
            setCameraStatus('error');
            setCameraError('Unable to access your camera. Please allow permissions and retry.');
        }
    }, [attachStreamToVideo, initializeProctoring]);

    const loadExam = useCallback(async () => {
        if (!attemptId) {
            setError('Invalid assessment attempt id.');
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/attempts/${attemptId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Failed to load assessment attempt.');
                return;
            }

            if (data.attempt?.status !== 'in_progress') {
                setError('This assessment session is not active.');
                return;
            }

            setQuestions(data.questions || []);
            setTimeLeft(data.attempt?.timeLeft || 0);
            setViolationCount(data.attempt?.violationCount || 0);
        } catch (fetchError) {
            console.error('Failed to load exam:', fetchError);
            setError('Unable to load assessment. Please try again.');
        } finally {
            if (isMountedRef.current) setLoading(false);
        }
    }, [attemptId]);

    const submitAssessment = useCallback(async (autoSubmit = false) => {
        if (isSubmitting || !attemptId) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const answersArray = Object.entries(answers).map(([question, answer]) => ({
                question,
                answer,
            }));

            const res = await fetch(`/api/assessments/${attemptId}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    attemptId,
                    answers: answersArray,
                    status: autoSubmit ? 'completed' : 'completed',
                }),
            });
            const data = await res.json();

            if (!data.success) {
                setError(data.error || 'Failed to submit assessment.');
                setIsSubmitting(false);
                return;
            }

            cleanupProctoring();
            CameraManager.stop();
            router.push(`/results/${attemptId}`);
        } catch (submitError) {
            console.error('Failed to submit assessment:', submitError);
            setError('Submission failed. Please retry.');
            setIsSubmitting(false);
        }
    }, [answers, attemptId, cleanupProctoring, isSubmitting, router]);

    const enterFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
        } catch (fullscreenError) {
            console.warn('Fullscreen request failed:', fullscreenError);
            showWarning('Please allow fullscreen mode for this assessment.');
        }
    }, [showWarning]);

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        isMountedRef.current = true;
        installConsoleFilter();
        void loadExam();
        void initCamera();
        void enterFullscreen();
        const videoElement = videoRef.current;

        const handleVisibility = () => {
            if (document.hidden) {
                void logViolation(VIOLATION_TYPES.TAB_SWITCH, 'Tab switch detected.', 'critical');
            }
        };

        const handleBlur = () => {
            void logViolation(VIOLATION_TYPES.TAB_SWITCH, 'Window focus lost.', 'critical');
        };

        const handleResize = () => {
            if (window.innerWidth < 1000 || window.innerHeight < 620) {
                void logViolation(VIOLATION_TYPES.SCREEN_MINIMIZE, 'Screen minimize or aggressive resize detected.');
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && !loadingRef.current) {
                showWarning('Fullscreen exit detected. Assessment terminated.');
                setTerminated(true);
                terminatedRef.current = true;
                cleanupProctoring();
                CameraManager.stop();
                void logViolation(
                    VIOLATION_TYPES.FULLSCREEN_EXIT,
                    'Fullscreen mode exited during assessment.',
                    'critical'
                );
            }
        };

        const handleContextMenu = (event: MouseEvent) => {
            event.preventDefault();
            showWarning('Right-click is disabled during assessment.');
        };

        const handleKeydown = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            const isCopyPasteShortcut = (event.ctrlKey || event.metaKey) && (key === 'c' || key === 'v');
            if (!isCopyPasteShortcut) return;

            event.preventDefault();
            showWarning('Copy/Paste is not allowed during assessment.');
        };

        document.addEventListener('visibilitychange', handleVisibility);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeydown);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('resize', handleResize);

        return () => {
            isMountedRef.current = false;
            document.removeEventListener('visibilitychange', handleVisibility);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeydown);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('resize', handleResize);

            cleanupProctoring();
            if (videoElement) {
                videoElement.pause();
                videoElement.srcObject = null;
            }
            CameraManager.stop();
            removeConsoleFilter();
        };
    }, [cleanupProctoring, enterFullscreen, initCamera, installConsoleFilter, loadExam, logViolation, removeConsoleFilter, showWarning]);

    useEffect(() => {
        if (loading || terminated || isSubmitting) return;
        if (timeLeft <= 0) {
            void submitAssessment(true);
            return;
        }

        const interval = window.setInterval(() => {
            setTimeLeft((prev) => Math.max(prev - 1, 0));
        }, 1000);
        return () => window.clearInterval(interval);
    }, [isSubmitting, loading, submitAssessment, terminated, timeLeft]);

    useEffect(() => {
        if (terminated) return;
        const interval = window.setInterval(() => {
            const frames = aiFrameCounterRef.current;
            aiFrameCounterRef.current = 0;
            setAiFps(frames);
        }, 1000);
        return () => window.clearInterval(interval);
    }, [terminated]);

    useEffect(() => {
        if (loading || terminated) return;
        const watchdog = window.setInterval(() => {
            if (!cameraStatus || cameraStatus !== 'ready') return;
            if (!isProctoringActiveRef.current || !proctoringReady) return;
            if (Date.now() - proctoringStartTsRef.current < 8000) return;
            const now = Date.now();
            const age = now - lastAIDetectTsRef.current;
            if (age < 5000) return;
            if (restartingAIRef.current) return;

            restartingAIRef.current = true;
            showWarning('AI monitor stalled. Reinitializing detector...');
            cleanupProctoring();
            void initializeProctoring().finally(() => {
                restartingAIRef.current = false;
            });
        }, 2000);

        return () => window.clearInterval(watchdog);
    }, [cameraStatus, cleanupProctoring, initializeProctoring, loading, proctoringReady, showWarning, terminated]);

    useEffect(() => {
        if (loading || terminated) return;
        if (!streamRef.current) return;

        let cancelled = false;
        const rebind = async () => {
            try {
                const attached = await attachStreamToVideo();
                if (cancelled || !attached) return;
                await initializeProctoring();
            } catch (attachError) {
                console.warn('Video rebind failed:', attachError);
            }
        };

        void rebind();
        return () => {
            cancelled = true;
        };
    }, [attachStreamToVideo, initializeProctoring, loading, terminated]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId: string, answerIndex: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <p className="text-sm font-medium text-graphite animate-pulse">
                    Preparing examination environment...
                </p>
            </div>
        );
    }

    if (terminated) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center p-6">
                <div className="bg-sheet max-w-lg w-full rounded-panel border border-flagged/30 p-8 sm:p-10 text-center shadow-floating">
                    <span className="text-xs font-bold uppercase tracking-wider text-flagged bg-flagged-soft px-3 py-1 rounded-chip mb-4 inline-block">
                        Attempt Terminated
                    </span>
                    <h1 className="text-2xl font-bold text-ink mb-3">Violation Limit Reached</h1>
                    <p className="text-sm text-graphite mb-8 leading-relaxed">
                        This assessment attempt was automatically concluded after reaching the maximum threshold of {EXAM_CONFIG.MAX_VIOLATIONS} proctoring violations.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full py-3 px-6 rounded-btn bg-navy hover:bg-navy-2 text-white font-medium text-sm transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (error || !activeQuestion) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center p-6">
                <div className="bg-sheet max-w-lg w-full rounded-panel border border-rule p-8 text-center shadow-floating">
                    <p className="text-flagged text-sm font-medium">{error || 'No questions found for this attempt.'}</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mt-6 py-2.5 px-5 rounded-btn bg-sheet border border-rule text-ink hover:bg-paper text-xs font-medium"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const timerIsWarning = timeLeft < 300 && timeLeft >= 60;
    const timerIsCritical = timeLeft < 60;

    return (
        <div className="min-h-screen bg-paper text-ink font-sans flex flex-col">
            {/* Warning Toast Banner */}
            {warning.show && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-sheet border-2 border-review rounded-card px-6 py-3 shadow-floating flex items-center gap-3 animate-fadeIn">
                    <span className="w-2 h-2 rounded-full bg-review animate-ping shrink-0" />
                    <p className="text-xs font-semibold text-ink">{warning.message}</p>
                </div>
            )}

            {/* Fixed Distraction-Free Top Bar */}
            <header className="sticky top-0 z-40 bg-sheet/95 backdrop-blur-md border-b border-rule shadow-subtle">
                <div className="max-w-container mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-semibold text-graphite uppercase tracking-wider block">
                            Question {currentQuestion + 1} of {questions.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Tabular Timer with Accessible Announcement */}
                        <div className="flex items-center gap-2">
                            <span
                                className={`text-xs font-medium ${
                                    timerIsCritical
                                        ? 'text-flagged'
                                        : timerIsWarning
                                        ? 'text-review'
                                        : 'text-graphite'
                                }`}
                            >
                                Time remaining:
                            </span>
                            <span
                                className={`text-base font-bold tabular-nums font-sans ${
                                    timerIsCritical
                                        ? 'text-flagged animate-pulse'
                                        : timerIsWarning
                                        ? 'text-review'
                                        : 'text-ink'
                                }`}
                                aria-live={timeLeft === 300 || timeLeft === 60 ? 'polite' : 'off'}
                            >
                                {formatTime(timeLeft)}
                            </span>
                        </div>

                        {/* Violation Indicator */}
                        <div className="flex items-center gap-2 pl-4 border-l border-rule">
                            <span className="text-xs text-graphite font-medium">Flags:</span>
                            <span
                                className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-chip border ${
                                    violationCount >= 3
                                        ? 'bg-flagged-soft text-flagged border-flagged/30'
                                        : violationCount > 0
                                        ? 'bg-review-soft text-review border-review/30'
                                        : 'bg-paper text-graphite border-rule'
                                }`}
                            >
                                {violationCount} / {EXAM_CONFIG.MAX_VIOLATIONS}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Question Progress Line */}
                <div className="w-full h-1 bg-paper overflow-hidden">
                    <div
                        className="h-full bg-signal transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </header>

            {/* Exam Body */}
            <main className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Main Question Panel */}
                    <section className="lg:col-span-8 bg-sheet border border-rule rounded-panel p-6 sm:p-10 shadow-subtle">
                        <div className="mb-6">
                            <span className="text-xs font-semibold uppercase tracking-wider text-signal block mb-2">
                                Multiple Choice Question
                            </span>
                            <h1 className="text-xl sm:text-2xl font-bold text-ink leading-snug">
                                {activeQuestion.question}
                            </h1>
                        </div>

                        {/* OMR Options List */}
                        <div className="space-y-3 mb-10">
                            {(activeQuestion.displayOptions || []).map((option, idx) => {
                                const isSelected = answers[activeQuestion._id] === option.originalIndex;
                                const letter = String.fromCharCode(65 + idx);
                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleAnswerChange(activeQuestion._id, option.originalIndex)}
                                        className={`w-full text-left rounded-card p-4 sm:p-5 border transition-all duration-150 flex items-center gap-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-signal ${
                                            isSelected
                                                ? 'bg-signal-soft border-signal text-ink shadow-subtle'
                                                : 'bg-sheet border-rule hover:border-rule-strong text-ink hover:bg-paper'
                                        }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full border-2 font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                                                isSelected
                                                    ? 'bg-signal text-white border-signal'
                                                    : 'bg-sheet text-graphite border-rule-strong'
                                            }`}
                                        >
                                            {letter}
                                        </div>
                                        <span className="text-sm font-medium leading-relaxed">
                                            {option.text}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Pagination & Submit Bar */}
                        <div className="flex items-center justify-between pt-6 border-t border-rule">
                            <button
                                type="button"
                                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                                disabled={currentQuestion === 0}
                                className="px-4 py-2.5 rounded-btn border border-rule text-xs font-semibold text-graphite hover:text-ink hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>

                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => void submitAssessment(false)}
                                    disabled={isSubmitting}
                                    className="px-5 py-2.5 rounded-btn bg-paper hover:bg-sheet border border-rule-strong text-xs font-semibold text-graphite hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? 'Submitting…' : 'Submit Exam'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
                                    disabled={currentQuestion >= questions.length - 1}
                                    className="px-5 py-2.5 rounded-btn bg-navy hover:bg-navy-2 text-xs font-semibold text-white shadow-subtle disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next Question
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Right Rail: Camera Sentinel & Proctoring Status */}
                    <aside className="lg:col-span-4 space-y-4">
                        <div className="bg-sheet rounded-card border border-rule p-4 shadow-subtle">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-clean animate-pulse" />
                                    <span className="text-xs font-bold text-ink">Proctoring Active</span>
                                </div>
                                <span className="text-[11px] text-graphite font-mono tabular-nums">
                                    {cameraStatus === 'ready' ? 'Connected' : 'Connecting'}
                                </span>
                            </div>

                            <div className="relative rounded-card overflow-hidden bg-paper border border-rule aspect-[4/3] mb-3">
                                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                                <div className="absolute top-2 left-2 px-2 py-0.5 bg-ink/75 text-white rounded-chip backdrop-blur-sm">
                                    <span className="text-[10px] font-medium">
                                        {proctoringReady ? 'GuardEye Vision On' : 'Initializing Vision'}
                                    </span>
                                </div>
                            </div>

                            {cameraError && (
                                <p className="text-xs text-flagged font-medium mt-2">{cameraError}</p>
                            )}

                            {cameraStatus !== 'ready' && (
                                <button
                                    type="button"
                                    onClick={() => void initCamera()}
                                    className="mt-2 w-full py-2 rounded-chip bg-sheet border border-rule text-xs font-medium text-ink hover:bg-paper"
                                >
                                    Retry Camera
                                </button>
                            )}
                        </div>

                        <div className="bg-sheet rounded-card border border-rule p-4 shadow-subtle">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-ink mb-2">
                                Examination Rules
                            </h3>
                            <ul className="text-xs text-graphite space-y-2 leading-relaxed">
                                <li>• Keep your face visible and centered.</li>
                                <li>• Do not exit full-screen mode or switch tabs.</li>
                                <li>• Copy and paste operations are restricted.</li>
                                <li>• Maximum {EXAM_CONFIG.MAX_VIOLATIONS} flags allowed before auto-submit.</li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
import { StatusChip } from './StatusChip';
import { OMRBubble } from './OMRBubble';

export function SessionReplay() {
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState(shouldReduceMotion ? 4 : 0);
  const [timerSeconds, setTimerSeconds] = useState(18 * 60 + 32); // 18:32

  useEffect(() => {
    if (shouldReduceMotion) return;

    const t1 = setTimeout(() => setStep(1), 400);   // Face box + "Face detected" (top-left)
    const t2 = setTimeout(() => setStep(2), 1200);  // Question 14, OMR C filled
    const t3 = setTimeout(() => setStep(3), 2000);  // Tab switched flag, Needs review chip
    const t4 = setTimeout(() => setStep(4), 3000);  // Question 15, OMR A filled
    const t5 = setTimeout(() => setStep(5), 3800);  // "Flag sent for review" note

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [shouldReduceMotion]);

  // Timer ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentQuestionNum = step >= 4 ? 15 : step >= 2 ? 14 : 13;
  const isNeedsReview = step >= 3;

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
      className="w-full max-w-md bg-white border border-line rounded-2xl p-5 shadow-sm select-none relative"
      aria-label="Interactive preview of an ongoing proctored assessment"
    >
      {/* Top Bar: Progress + Tabular Timer */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-navy">
            Question {currentQuestionNum} of 30
          </span>
          <span className="text-[10px] text-slate font-semibold uppercase tracking-wider bg-mist px-2 py-0.5 rounded border border-line">
            MCQ
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ok animate-pulse" aria-hidden="true" />
          <span
            className="text-xs font-bold tabular-nums text-navy tracking-tight font-sans"
            aria-hidden="true"
          >
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Center Layout: Webcam Frame + Face Tracker */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-paper border border-line mb-4 group">
        <Image
          src="/images/hero-candidate.webp"
          alt="Candidate taking an online assessment in front of a webcam"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover scale-105"
          style={{ objectPosition: 'center 18%' }}
        />

        {/* Corner-Bracket Face Detection Box */}
        {step >= 1 && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-x-8 inset-y-5 border border-navy/30 rounded-xl pointer-events-none flex flex-col justify-between p-3"
          >
            {/* Top Row: Left-Aligned 'Face detected' Badge + Top-Right Bracket */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 border-t-2 border-l-2 border-navy inline-block" />
                <span className="text-[10px] font-bold text-white bg-navy/90 px-2.5 py-1 rounded-md backdrop-blur-sm shadow-sm flex items-center gap-1.5 border border-white/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse" />
                  Face detected
                </span>
              </div>
              <span className="w-3 h-3 border-t-2 border-r-2 border-navy inline-block" />
            </div>

            {/* Bottom Corner Brackets */}
            <div className="flex justify-between items-end">
              <span className="w-3 h-3 border-b-2 border-l-2 border-navy inline-block" />
              <span className="w-3 h-3 border-b-2 border-r-2 border-navy inline-block" />
            </div>
          </motion.div>
        )}
      </div>

      {/* OMR Row & Question Preview */}
      <div className="bg-paper rounded-xl p-3 border border-line mb-3.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate">Select answer:</span>
        <div className="flex items-center gap-2">
          {['A', 'B', 'C', 'D'].map((letter) => {
            const isFilled =
              (currentQuestionNum === 14 && letter === 'C') ||
              (currentQuestionNum === 15 && letter === 'A');
            return (
              <OMRBubble
                key={letter}
                letter={letter}
                size="sm"
                filled={isFilled}
                className="cursor-default"
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Timeline Event & Status Chip */}
      <div className="flex items-center justify-between pt-1 text-xs">
        <div className="flex items-center gap-2">
          {step >= 3 ? (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-slate font-semibold text-xs flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-warn shrink-0" />
              <span>Tab switched · 06:12</span>
            </motion.div>
          ) : (
            <span className="text-slate font-semibold text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ok shrink-0" />
              <span>Proctoring active</span>
            </span>
          )}
        </div>

        <div className="flex flex-col items-end">
          <StatusChip variant={isNeedsReview ? 'review' : 'clean'} size="sm">
            {isNeedsReview ? 'Needs review' : 'No issues'}
          </StatusChip>
          {step >= 5 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] text-slate font-medium mt-1"
            >
              Flag sent for review
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default SessionReplay;

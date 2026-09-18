'use client';

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Award, Download, Share2 } from 'lucide-react';

interface ResultCardProps {
  title?: string;
  subtitle?: string;
}

export function ResultCard({
  title = 'Your result',
  subtitle = 'Prompt Engineering and AI Automation',
}: ResultCardProps) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const scorePercent = 0.87;
  const strokeDashoffset = circumference * (1 - scorePercent);

  return (
    <div className="w-[290px] bg-sheet rounded-[16px] p-4 border border-rule shadow-floating text-ink select-none relative">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-rule">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
            <Award className="w-3.5 h-3.5 text-signal" />
            <span>{title}</span>
          </div>
          <p className="text-[11px] text-graphite line-clamp-1">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 my-3">
        {/* Ring Gauge */}
        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
            <circle
              cx="36"
              cy="36"
              r={radius}
              fill="transparent"
              stroke="#DDE3EA"
              strokeWidth="5"
            />
            <motion.circle
              cx="36"
              cy="36"
              r={radius}
              fill="transparent"
              stroke="#2B46D1"
              strokeWidth="5"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-extrabold text-ink tabular-nums leading-none">26 / 30</span>
            <span className="text-[9px] text-graphite font-semibold mt-0.5">87%</span>
          </div>
        </div>

        <div className="space-y-1 text-left">
          <span className="text-[10px] text-graphite font-medium block">Integrity record</span>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-chip bg-clean-soft border border-clean/20">
            <CheckCircle2 className="w-3 h-3 text-clean shrink-0" />
            <span className="text-[10px] font-bold text-clean">No issues</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-rule">
        <button
          type="button"
          disabled
          tabIndex={-1}
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-btn bg-amber-500 text-white text-[11px] font-semibold opacity-90 cursor-default"
        >
          <Download className="w-3 h-3" />
          <span>Certificate</span>
        </button>
        <button
          type="button"
          disabled
          tabIndex={-1}
          className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-btn border border-signal text-signal bg-signal-soft/40 text-[11px] font-semibold opacity-90 cursor-default"
        >
          <Share2 className="w-3 h-3" />
          <span>Share link</span>
        </button>
      </div>
    </div>
  );
}

export default ResultCard;

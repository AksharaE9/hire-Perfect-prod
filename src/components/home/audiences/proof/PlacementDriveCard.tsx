'use client';

import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';

interface PlacementDriveCardProps {
  title?: string;
  subtitle?: string;
}

export function PlacementDriveCard({
  title = 'Placement drive',
  subtitle = 'Final-year students',
}: PlacementDriveCardProps) {
  return (
    <div className="w-[290px] bg-sheet rounded-[16px] p-4 border border-rule shadow-floating text-ink select-none relative">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-rule">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
            <GraduationCap className="w-3.5 h-3.5 text-signal" />
            <span>{title}</span>
          </div>
          <p className="text-[11px] text-graphite">{subtitle}</p>
        </div>
      </div>

      <div className="my-2">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-2xl font-black text-ink tabular-nums tracking-tight">
            412 <span className="text-sm font-semibold text-graphite">of 450</span>
          </span>
          <span className="text-[11px] font-semibold text-clean bg-clean-soft px-2 py-0.5 rounded-chip">
            92% submitted
          </span>
        </div>

        {/* Animated Progress Track */}
        <div className="w-full h-2 rounded-full bg-rule overflow-hidden mb-3">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 0.92 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'left' }}
            className="h-full bg-signal rounded-full"
          />
        </div>
      </div>

      <div className="space-y-1.5 text-xs mb-3">
        <div className="flex items-center justify-between py-1 px-2 rounded-btn bg-paper border border-rule">
          <span className="text-graphite text-[11px]">In progress</span>
          <span className="font-bold text-ink tabular-nums text-xs">26</span>
        </div>
        <div className="flex items-center justify-between py-1 px-2 rounded-btn bg-paper border border-rule">
          <span className="text-graphite text-[11px]">Not started</span>
          <span className="font-bold text-ink tabular-nums text-xs">12</span>
        </div>
        <div className="flex items-center justify-between py-1 px-2 rounded-btn bg-paper border border-rule">
          <span className="text-graphite text-[11px]">Flagged for review</span>
          <span className="font-bold text-review tabular-nums text-xs">9</span>
        </div>
      </div>

      <div className="pt-2 border-t border-rule flex items-center justify-between">
        <span className="text-[10px] text-graphite">Example view</span>
        <span className="text-[11px] font-semibold text-signal">Batch cohort #04</span>
      </div>
    </div>
  );
}

export default PlacementDriveCard;

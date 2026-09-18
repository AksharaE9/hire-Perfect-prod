'use client';

import React from 'react';
import { motion, MotionValue, useTransform } from 'motion/react';

interface AudienceProgressRailProps {
  progress: MotionValue<number>;
  labels: string[];
  active: number;
  onSelect: (index: number) => void;
}

function RailSegment({
  progress,
  index,
  total,
  label,
  isActive,
  onSelect,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  label: string;
  isActive: boolean;
  onSelect: () => void;
}) {
  const start = index / total;
  const end = (index + 1) / total;

  const fillScale = useTransform(progress, [start, end], [0, 1], {
    clamp: true,
  });

  return (
    <button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      onClick={onSelect}
      className="flex-1 flex flex-col gap-2.5 text-left group cursor-pointer focus:outline-none"
    >
      <span
        className={`text-xs sm:text-sm font-semibold transition-colors duration-200 truncate ${
          isActive ? 'text-ink font-bold' : 'text-graphite group-hover:text-ink'
        }`}
      >
        {label}
      </span>

      {/* 3px Track */}
      <div className="w-full h-[3px] rounded-full bg-rule overflow-hidden relative">
        <motion.div
          style={{ scaleX: fillScale, transformOrigin: 'left' }}
          className="absolute inset-0 bg-amber-500 rounded-full"
        />
      </div>
    </button>
  );
}

export function AudienceProgressRail({
  progress,
  labels,
  active,
  onSelect,
}: AudienceProgressRailProps) {
  return (
    <div
      aria-hidden="true"
      className="mt-8 pt-2 flex items-center justify-between gap-4 select-none"
    >
      {labels.map((label, idx) => (
        <RailSegment
          key={label}
          progress={progress}
          index={idx}
          total={labels.length}
          label={label}
          isActive={idx === active}
          onSelect={() => onSelect(idx)}
        />
      ))}
    </div>
  );
}

export default AudienceProgressRail;

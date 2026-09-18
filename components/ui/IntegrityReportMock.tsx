import React from 'react';
import Image from 'next/image';
import { StatusChip } from './StatusChip';

export function IntegrityReportMock() {
  return (
    <div className="w-full bg-sheet border border-rule rounded-panel p-6 sm:p-8 shadow-floating">
      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-rule gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h3 className="text-lg font-bold text-ink">Ananya R.</h3>
            <StatusChip variant="review" size="sm">
              Needs review
            </StatusChip>
          </div>
          <p className="text-xs text-graphite">
            Advanced Excel and Business Intelligence · Assessment 4
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-graphite block uppercase font-medium">Final Score</span>
            <span className="text-2xl font-bold tabular-nums text-ink">24 / 30 <span className="text-xs font-normal text-graphite">(80%)</span></span>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-[11px] text-graphite block uppercase font-medium">Flags Logged</span>
            <span className="text-2xl font-bold tabular-nums text-review">3</span>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-graphite">
            Attempt Timeline (50:00 Total Duration)
          </span>
          <span className="text-xs text-graphite tabular-nums">3 timestamped events</span>
        </div>

        <div className="relative pt-6 pb-2">
          {/* Base ruled timeline bar */}
          <div className="h-2 w-full bg-paper border border-rule rounded-full relative overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-signal/20 rounded-full"
              style={{ left: '0%', width: '100%' }}
            />
          </div>

          {/* Event Pins */}
          <div className="relative mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-paper p-3 rounded-card border border-rule flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-review">Left full-screen</span>
                <span className="text-[11px] font-mono tabular-nums text-graphite">06:12</span>
              </div>
              <p className="text-[11px] text-graphite">Candidate pressed Escape; returned in 3s</p>
            </div>

            <div className="bg-paper p-3 rounded-card border border-rule flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-review">Face not visible</span>
                <span className="text-[11px] font-mono tabular-nums text-graphite">11:48</span>
              </div>
              <p className="text-[11px] text-graphite">Frame empty for 4 seconds</p>
            </div>

            <div className="bg-paper p-3 rounded-card border border-rule flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-review">Tab switched</span>
                <span className="text-[11px] font-mono tabular-nums text-graphite">19:03</span>
              </div>
              <p className="text-[11px] text-graphite">Browser focus shifted to external application</p>
            </div>
          </div>
        </div>
      </div>

      {/* Snapshot Verification Strip */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-graphite block mb-3">
          Camera Verification Samples
        </span>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="relative aspect-square rounded-card overflow-hidden bg-paper border border-rule">
              <Image
                src="/images/report-snap-1.webp"
                alt="Webcam snapshot of candidate, facing the screen"
                fill
                sizes="(max-width: 768px) 30vw, 160px"
                className="object-cover"
              />
            </div>
            <span className="text-[10px] text-graphite font-mono tabular-nums">00:05 · In position</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="relative aspect-square rounded-card overflow-hidden bg-paper border border-rule border-review/60">
              <Image
                src="/images/report-snap-2.webp"
                alt="Webcam snapshot of candidate looking away"
                fill
                sizes="(max-width: 768px) 30vw, 160px"
                className="object-cover"
              />
            </div>
            <span className="text-[10px] text-review font-mono tabular-nums">11:48 · Flagged moment</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="relative aspect-square rounded-card overflow-hidden bg-paper border border-rule">
              <Image
                src="/images/report-snap-3.webp"
                alt="Webcam snapshot of candidate refocused on the screen"
                fill
                sizes="(max-width: 768px) 30vw, 160px"
                className="object-cover"
              />
            </div>
            <span className="text-[10px] text-graphite font-mono tabular-nums">11:53 · Refocused</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntegrityReportMock;

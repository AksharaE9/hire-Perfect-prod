'use client';

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, Users } from 'lucide-react';

interface ShortlistCardProps {
  title?: string;
  subtitle?: string;
}

export function ShortlistCard({
  title = 'Shortlist',
  subtitle = 'Advanced Excel and Business Intelligence',
}: ShortlistCardProps) {
  const candidates = [
    { name: 'Ravi K.', score: '27 / 30', status: 'clean', label: 'No issues' },
    { name: 'Meera S.', score: '25 / 30', status: 'review', label: 'Needs review' },
    { name: 'Arjun P.', score: '22 / 30', status: 'clean', label: 'No issues' },
  ];

  return (
    <div className="w-[290px] bg-sheet rounded-[16px] p-4 border border-rule shadow-floating text-ink select-none relative">
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-rule">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-ink">
            <Users className="w-3.5 h-3.5 text-signal" />
            <span>{title}</span>
          </div>
          <p className="text-[11px] text-graphite truncate max-w-[200px]">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {candidates.map((c, idx) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.07, duration: 0.3 }}
            className="flex items-center justify-between p-2 rounded-btn bg-paper border border-rule text-xs"
          >
            <div>
              <span className="font-semibold text-ink block">{c.name}</span>
              <div className="flex items-center gap-1 mt-0.5">
                {c.status === 'clean' ? (
                  <CheckCircle2 className="w-3 h-3 text-clean shrink-0" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-review shrink-0" />
                )}
                {c.status === 'review' ? (
                  <motion.span
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                    className="text-[10px] font-semibold text-review"
                  >
                    {c.label}
                  </motion.span>
                ) : (
                  <span className="text-[10px] font-semibold text-clean">{c.label}</span>
                )}
              </div>
            </div>

            <span className="font-bold text-ink tabular-nums text-xs">{c.score}</span>
          </motion.div>
        ))}
      </div>

      <div className="pt-2 border-t border-rule flex items-center justify-between">
        <span className="text-[10px] text-graphite">Example view</span>
        <button
          type="button"
          disabled
          tabIndex={-1}
          className="text-[11px] font-semibold text-white bg-signal px-2.5 py-1 rounded-btn opacity-90 cursor-default"
        >
          Share with panel
        </button>
      </div>
    </div>
  );
}

export default ShortlistCard;

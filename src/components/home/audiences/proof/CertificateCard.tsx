'use client';

import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface CertificateCardProps {
  title?: string;
  subtitle?: string;
}

export function CertificateCard({
  title = 'Certificate of completion',
  subtitle = 'Advanced Excel and Business Intelligence',
}: CertificateCardProps) {
  return (
    <div className="w-[290px] bg-sheet rounded-[16px] p-4 border-2 border-signal/40 shadow-floating text-ink select-none relative overflow-hidden">
      {/* Certificate Frame Pattern */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-rule">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-signal flex items-center justify-center text-[10px] font-bold text-white">
            H
          </span>
          <span className="text-[11px] font-bold text-ink">HirePerfect</span>
        </div>
        <span className="text-[10px] text-graphite font-mono">ID: HP-8842</span>
      </div>

      <div className="text-center my-2">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-graphite block">
          {title}
        </span>
        <h4 className="text-lg font-extrabold text-ink tracking-tight mt-0.5">Divya N.</h4>
        <p className="text-[11px] text-graphite mt-0.5 line-clamp-1">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 my-3 p-2 rounded-btn bg-paper border border-rule text-xs">
        <div>
          <span className="text-[10px] text-graphite block">Score</span>
          <span className="font-extrabold text-ink text-sm tabular-nums">84%</span>
        </div>
        <div>
          <span className="text-[10px] text-graphite block">Integrity</span>
          <div className="flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3 text-clean" />
            <span className="text-[10px] font-semibold text-clean">No issues</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-rule flex items-center justify-between">
        <span className="text-[10px] text-graphite">Example view</span>

        {/* Verified Circular Seal */}
        <motion.div
          initial={{ rotate: -20, scale: 0.8, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 220, damping: 20 }}
          className="flex items-center gap-1 bg-signal text-white px-2 py-0.5 rounded-chip text-[10px] font-bold shadow-subtle"
        >
          <ShieldCheck className="w-3 h-3 text-amber-300" />
          <span>Verified</span>
        </motion.div>
      </div>
    </div>
  );
}

export default CertificateCard;

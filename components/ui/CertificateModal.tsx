'use client';

import React, { useRef } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Printer, X } from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  assessmentTitle: string;
  completionDate: string;
  certificateId: string;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  assessmentTitle,
  completionDate,
  certificateId,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const authSuffix = React.useMemo(() => {
    let hash = 0;
    const str = `${certificateId}-${completionDate}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36).substring(0, 6).toUpperCase() || 'AUTH99';
  }, [certificateId, completionDate]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col items-center">
        {/* Certificate Container */}
        <div
          ref={certificateRef}
          id="certificate-print-area"
          className="relative w-full aspect-[1.414/1] bg-white border-[16px] border-ink shadow-floating overflow-hidden print:border-0 print:shadow-none font-sans text-ink"
          style={{ minHeight: '520px' }}
        >
          {/* Subtle Watermark Lattice */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#14203A_1px,transparent_1px)] bg-[length:24px_24px]" />
          </div>

          <div className="relative z-10 h-full flex flex-col items-center justify-between p-10 sm:p-14 text-center">
            {/* Top Decals */}
            <div className="w-full flex items-center justify-between text-[10px] text-graphite border-b border-rule pb-3">
              <div>
                <span className="font-bold uppercase tracking-wider block">Certificate ID</span>
                <span className="font-mono text-ink font-bold">
                  {certificateId.toUpperCase()}-{authSuffix}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold uppercase tracking-wider block">Issued On</span>
                <span className="font-bold text-ink">{completionDate}</span>
              </div>
            </div>

            {/* Header / Brand */}
            <div className="my-auto py-4">
              <div className="w-10 h-10 bg-signal text-white rounded-btn flex items-center justify-center font-bold text-lg mx-auto mb-3 shadow-subtle">
                H
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-signal block mb-1">
                HirePerfect Examination Authority
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight font-display uppercase mb-4">
                Certificate of Merit
              </h1>
              <p className="text-xs text-graphite italic mb-4">
                This official credential certifies that
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight border-b-2 border-ink/20 pb-2 mb-4 inline-block px-6">
                {candidateName}
              </h2>
              <p className="text-xs text-graphite mb-2">
                has successfully completed the proctored assessment in
              </p>
              <h3 className="text-base sm:text-lg font-bold text-signal px-4 py-1 bg-signal-soft rounded-chip inline-block mb-4">
                {assessmentTitle}
              </h3>
            </div>

            {/* Bottom Verification Footer */}
            <div className="w-full flex items-end justify-between pt-4 border-t border-rule text-left">
              <div>
                <span className="text-[10px] text-graphite uppercase font-bold tracking-wider block">
                  Proctoring Engine
                </span>
                <span className="text-xs font-bold text-ink">GuardEye AI Verified</span>
              </div>

              {/* Verified Stamp */}
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-ink/40 flex flex-col items-center justify-center text-center">
                <span className="text-[8px] font-bold uppercase tracking-wider text-signal">VERIFIED</span>
                <span className="text-[10px] font-extrabold text-ink">2026</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-graphite uppercase font-bold tracking-wider block">
                  Signature Authority
                </span>
                <span className="text-xs font-bold text-ink underline decoration-signal">
                  HirePerfect Platform
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="mt-6 flex items-center gap-3 no-print w-full justify-end">
          <Button variant="secondary" size="md" onClick={onClose} leftIcon={<X className="w-4 h-4" />}>
            Close
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Download / Print PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CertificateModal;

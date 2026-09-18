'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Check, BriefcaseBusiness, GraduationCap, Award, UserRound } from 'lucide-react';
import { Audience } from '@/src/content/home';
import ShortlistCard from './proof/ShortlistCard';
import PlacementDriveCard from './proof/PlacementDriveCard';
import CertificateCard from './proof/CertificateCard';
import ResultCard from './proof/ResultCard';

interface AudiencePanelProps {
  audience: Audience;
  isActive: boolean;
  onSelect: () => void;
  index: number;
}

const ICON_MAP = {
  BriefcaseBusiness: BriefcaseBusiness,
  GraduationCap: GraduationCap,
  Award: Award,
  UserRound: UserRound,
};

export function AudiencePanel({ audience, isActive, onSelect, index }: AudiencePanelProps) {
  const IconComponent = ICON_MAP[audience.icon] || BriefcaseBusiness;

  const renderProofCard = () => {
    switch (audience.proof.type) {
      case 'shortlist':
        return <ShortlistCard title={audience.proof.title} subtitle={audience.proof.subtitle} />;
      case 'placement':
        return <PlacementDriveCard title={audience.proof.title} subtitle={audience.proof.subtitle} />;
      case 'certificate':
        return <CertificateCard title={audience.proof.title} subtitle={audience.proof.subtitle} />;
      case 'result':
        return <ResultCard title={audience.proof.title} subtitle={audience.proof.subtitle} />;
      default:
        return null;
    }
  };

  return (
    <div
      role="tabpanel"
      id={`aud-panel-${audience.id}`}
      aria-labelledby={`aud-tab-${audience.id}`}
      className="relative w-full h-full overflow-hidden rounded-[20px] select-none group"
    >
      {/* Click Target Button for Inactive state */}
      <button
        type="button"
        role="tab"
        id={`aud-tab-${audience.id}`}
        aria-selected={isActive}
        aria-controls={`aud-panel-${audience.id}`}
        onClick={onSelect}
        className="absolute inset-0 z-20 w-full h-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-[20px] cursor-pointer"
        aria-label={audience.shortLabel}
      >
        <span className="sr-only">{audience.shortLabel}</span>
      </button>

      {/* Photo Background */}
      <motion.div
        animate={isActive ? { scale: [1.12, 1] } : { scale: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
      >
        <Image
          src={audience.image.src}
          alt={audience.image.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 86vw"
          style={{ objectPosition: audience.image.objectPosition }}
          className="object-cover"
        />
      </motion.div>

      {/* Dark Navy Overlays */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
          isActive
            ? 'bg-gradient-to-t from-navy/95 via-navy/50 to-transparent opacity-100'
            : 'bg-navy/55 group-hover:bg-navy/40 opacity-100'
        }`}
      />

      {/* Active 3px Marigold Top Bar */}
      {isActive && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
          style={{ transformOrigin: 'left' }}
          className="absolute top-0 inset-x-0 h-[3px] bg-amber-500 z-10"
        />
      )}

      {/* Inactive Bottom Label & Icon */}
      {!isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-6 left-6 z-10 flex flex-col gap-3 pointer-events-none"
        >
          <div className="w-9 h-9 rounded-btn border border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center text-white shadow-subtle">
            <IconComponent className="w-4 h-4" />
          </div>
          <span className="text-white text-lg font-bold tracking-tight drop-shadow-sm whitespace-nowrap">
            {audience.shortLabel}
          </span>
        </motion.div>
      )}

      {/* Active Panel Content */}
      <AnimatePresence mode="wait">
        {isActive && (
          <div className="relative z-10 w-full h-full flex flex-col justify-between p-6 sm:p-9 pointer-events-none">
            {/* Top Row: Proof Card (Desktop top-right) */}
            <div className="flex justify-end w-full">
              <motion.div
                initial={{ x: 24, y: -8, opacity: 0, rotate: 2 }}
                animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.25 }}
                className="pointer-events-auto hidden md:block"
              >
                {renderProofCard()}
              </motion.div>
              {/* Hidden screen reader summary */}
              <span className="sr-only">{audience.proof.srSummary}</span>
            </div>

            {/* Bottom-left: Title, description, outcomes, CTA */}
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="max-w-[440px] space-y-3.5 pointer-events-auto"
            >
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {audience.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {audience.description}
              </p>

              <ul className="space-y-2 pt-1 pb-1">
                {audience.outcomes.map((outcome, i) => (
                  <motion.li
                    key={i}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
                    className="flex items-center gap-2.5 text-xs sm:text-sm text-white"
                  >
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    </span>
                    <span>{outcome}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="pt-2">
                <Link href={audience.cta.href}>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-btn text-xs sm:text-sm font-semibold text-white border border-white/60 hover:bg-white/15 active:bg-white/25 transition-colors shadow-subtle cursor-pointer"
                  >
                    {audience.cta.label}
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AudiencePanel;

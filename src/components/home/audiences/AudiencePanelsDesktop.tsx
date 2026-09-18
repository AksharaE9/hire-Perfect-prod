'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useReducedMotion } from 'motion/react';
import { Audience } from '@/src/content/home';
import { useActiveAudience } from './useActiveAudience';
import AudiencePanel from './AudiencePanel';
import AudienceProgressRail from './AudienceProgressRail';

interface AudiencePanelsDesktopProps {
  audiences: Audience[];
  heading?: string;
  intro?: string;
}

export function AudiencePanelsDesktop({
  audiences,
  heading = 'Made for anyone who decides on a score',
  intro = 'Scroll through or pick your role to see how HirePerfect fits.',
}: AudiencePanelsDesktopProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  });

  const { active, scrollToIndex } = useActiveAudience(
    scrollYProgress,
    outerRef,
    audiences.length,
    !!reduced
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToIndex((active + 1) % audiences.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToIndex((active - 1 + audiences.length) % audiences.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToIndex(audiences.length - 1);
    }
  };

  return (
    <div
      ref={outerRef}
      style={{ height: reduced ? 'auto' : 'calc(100vh + 240vh)' }}
      className="relative"
    >
      <div className={reduced ? 'py-20' : 'sticky top-0 min-h-screen flex flex-col justify-center py-6'}>
        <div className="max-w-container mx-auto px-5 sm:px-8 w-full">
          {/* Header block */}
          <div className="max-w-2xl mb-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-2">
              {heading}
            </h2>
            <p className="text-base text-graphite">{intro}</p>
          </div>

          {/* Tablist Panel Row */}
          <div
            role="tablist"
            aria-label="Who HirePerfect is for"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="flex gap-3 h-[clamp(480px,58vh,580px)] focus:outline-none"
          >
            {audiences.map((audience, idx) => (
              <motion.div
                key={audience.id}
                layout
                transition={{ type: 'spring', stiffness: 170, damping: 26 }}
                style={{ flex: idx === active ? 3.2 : 1 }}
                className="relative overflow-hidden rounded-[20px] h-full"
              >
                <AudiencePanel
                  audience={audience}
                  isActive={idx === active}
                  onSelect={() => scrollToIndex(idx)}
                  index={idx}
                />
              </motion.div>
            ))}
          </div>

          {/* Progress Rail */}
          <AudienceProgressRail
            progress={scrollYProgress}
            labels={audiences.map((a) => a.shortLabel)}
            active={active}
            onSelect={scrollToIndex}
          />
        </div>
      </div>
    </div>
  );
}

export default AudiencePanelsDesktop;

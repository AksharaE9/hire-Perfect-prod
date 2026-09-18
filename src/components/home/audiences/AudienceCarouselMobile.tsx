'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Audience } from '@/src/content/home';
import ShortlistCard from './proof/ShortlistCard';
import PlacementDriveCard from './proof/PlacementDriveCard';
import CertificateCard from './proof/CertificateCard';
import ResultCard from './proof/ResultCard';

interface AudienceCarouselMobileProps {
  audiences: Audience[];
  heading?: string;
  intro?: string;
}

export function AudienceCarouselMobile({
  audiences,
  heading = 'Made for anyone who decides on a score',
  intro = 'Scroll through or pick your role to see how HirePerfect fits.',
}: AudienceCarouselMobileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setCurrentIndex(index);
            }
          }
        });
      },
      { root: containerRef.current, threshold: 0.6 }
    );

    cardRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [audiences]);

  const scrollToCard = (index: number) => {
    const target = cardRefs.current[index];
    if (target && containerRef.current) {
      containerRef.current.scrollTo({
        left: target.offsetLeft - 20,
        behavior: 'smooth',
      });
      setCurrentIndex(index);
    }
  };

  const renderProof = (type: string, title: string, subtitle: string) => {
    switch (type) {
      case 'shortlist':
        return <ShortlistCard title={title} subtitle={subtitle} />;
      case 'placement':
        return <PlacementDriveCard title={title} subtitle={subtitle} />;
      case 'certificate':
        return <CertificateCard title={title} subtitle={subtitle} />;
      case 'result':
        return <ResultCard title={title} subtitle={subtitle} />;
      default:
        return null;
    }
  };

  return (
    <div className="py-12 px-5">
      {/* Heading */}
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-ink tracking-tight mb-1.5">{heading}</h2>
        <p className="text-xs text-graphite">{intro}</p>
      </div>

      {/* Snap Scroll Row */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 no-scrollbar -mx-5 px-5"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {audiences.map((audience, idx) => (
          <div
            key={audience.id}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            data-index={idx}
            className="snap-center shrink-0 w-[86vw] max-w-[340px] bg-sheet border border-rule rounded-[20px] overflow-hidden flex flex-col justify-between shadow-subtle"
          >
            <div>
              {/* Photo on top with title/desc */}
              <div className="relative aspect-[4/5] w-full bg-paper overflow-hidden flex flex-col justify-end p-5">
                <Image
                  src={audience.image.src}
                  alt={audience.image.alt}
                  fill
                  sizes="86vw"
                  style={{ objectPosition: audience.image.objectPosition }}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D45]/95 via-[#0B1D45]/50 to-transparent" />

                <div className="relative z-10 text-white space-y-1">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    {audience.shortLabel}
                  </span>
                  <h3 className="text-xl font-bold leading-tight">{audience.title}</h3>
                  <p className="text-xs text-slate-200 line-clamp-2">{audience.description}</p>
                </div>
              </div>

              {/* White card details below */}
              <div className="p-5 space-y-4">
                <ul className="space-y-2">
                  {audience.outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-ink">
                      <Check className="w-3.5 h-3.5 text-clean shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>

                {/* Proof card representation */}
                <div className="scale-[0.88] origin-left pt-1">
                  {renderProof(audience.proof.type, audience.proof.title, audience.proof.subtitle)}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <Link href={audience.cta.href}>
                <button
                  type="button"
                  className="w-full py-3 rounded-btn bg-signal text-white text-xs font-bold shadow-subtle hover:bg-signal/90 active:bg-signal/80 transition-colors"
                >
                  {audience.cta.label}
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Counter & Nav Buttons (No dots) */}
      <div className="mt-4 flex items-center justify-between pt-2 border-t border-rule">
        <span className="text-xs font-bold text-ink tabular-nums">
          {currentIndex + 1} <span className="text-graphite font-medium">of {audiences.length}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => scrollToCard(Math.max(0, currentIndex - 1))}
            aria-label="Previous audience card"
            className="w-11 h-11 rounded-btn border border-rule bg-sheet text-ink flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-paper active:bg-rule/40 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            disabled={currentIndex === audiences.length - 1}
            onClick={() => scrollToCard(Math.min(audiences.length - 1, currentIndex + 1))}
            aria-label="Next audience card"
            className="w-11 h-11 rounded-btn border border-rule bg-sheet text-ink flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-paper active:bg-rule/40 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AudienceCarouselMobile;

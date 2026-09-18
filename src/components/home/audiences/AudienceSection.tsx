'use client';

import React from 'react';
import { Audience } from '@/src/content/home';
import AudiencePanelsDesktop from './AudiencePanelsDesktop';
import AudienceGridTablet from './AudienceGridTablet';
import AudienceCarouselMobile from './AudienceCarouselMobile';

interface AudienceSectionProps {
  audiences: Audience[];
  heading?: string;
  intro?: string;
}

export function AudienceSection({
  audiences,
  heading = 'Made for anyone who decides on a score',
  intro = 'Scroll through or pick your role to see how HirePerfect fits.',
}: AudienceSectionProps) {
  return (
    <section id="audiences" className="border-b border-rule bg-sheet">
      {/* Desktop Scroll-Pinned Panels (>= 1024px) */}
      <div className="hidden lg:block">
        <AudiencePanelsDesktop audiences={audiences} heading={heading} intro={intro} />
      </div>

      {/* Tablet 2x2 Grid (768px - 1023px) */}
      <div className="hidden md:block lg:hidden">
        <AudienceGridTablet audiences={audiences} heading={heading} intro={intro} />
      </div>

      {/* Mobile Snap Carousel (< 768px) */}
      <div className="block md:hidden">
        <AudienceCarouselMobile audiences={audiences} heading={heading} intro={intro} />
      </div>
    </section>
  );
}

export default AudienceSection;

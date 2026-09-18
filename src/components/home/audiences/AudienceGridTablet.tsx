'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Audience } from '@/src/content/home';
import ShortlistCard from './proof/ShortlistCard';
import PlacementDriveCard from './proof/PlacementDriveCard';
import CertificateCard from './proof/CertificateCard';
import ResultCard from './proof/ResultCard';

interface AudienceGridTabletProps {
  audiences: Audience[];
  heading?: string;
  intro?: string;
}

export function AudienceGridTablet({
  audiences,
  heading = 'Made for anyone who decides on a score',
  intro = 'Scroll through or pick your role to see how HirePerfect fits.',
}: AudienceGridTabletProps) {
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
    <div className="max-w-container mx-auto px-6 py-16">
      <div className="max-w-2xl mb-12">
        <h2 className="text-3xl font-extrabold text-ink tracking-tight mb-2">{heading}</h2>
        <p className="text-base text-graphite">{intro}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {audiences.map((audience, idx) => (
          <motion.div
            key={audience.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-sheet border border-rule rounded-[20px] overflow-hidden flex flex-col justify-between shadow-subtle"
          >
            <div>
              {/* Photo Frame + Overlapping Proof Card */}
              <div className="relative aspect-[4/3] w-full bg-paper overflow-hidden">
                <Image
                  src={audience.image.src}
                  alt={audience.image.alt}
                  fill
                  sizes="45vw"
                  style={{ objectPosition: audience.image.objectPosition }}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1D45]/70 to-transparent" />

                {/* Overlapping Proof Card Preview */}
                <div className="absolute bottom-2 right-2 scale-[0.75] origin-bottom-right drop-shadow-lg">
                  {renderProof(audience.proof.type, audience.proof.title, audience.proof.subtitle)}
                </div>
              </div>

              {/* Text Information */}
              <div className="p-6">
                <span className="text-xs font-bold uppercase tracking-wider text-signal block mb-1">
                  {audience.shortLabel}
                </span>
                <h3 className="text-xl font-bold text-ink mb-2">{audience.title}</h3>
                <p className="text-xs text-graphite leading-relaxed mb-4">{audience.description}</p>

                <ul className="space-y-1.5 mb-6">
                  {audience.outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-ink">
                      <Check className="w-3.5 h-3.5 text-clean shrink-0" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 pt-0">
              <Link href={audience.cta.href}>
                <button
                  type="button"
                  className="w-full py-2.5 rounded-btn bg-paper border border-rule hover:border-rule-strong text-xs font-bold text-ink transition-colors cursor-pointer"
                >
                  {audience.cta.label}
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default AudienceGridTablet;

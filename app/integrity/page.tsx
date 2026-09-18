import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { integrityContent } from '@/src/content/integrity';
import IntegrityTabsClient from './IntegrityTabsClient';

export const metadata: Metadata = {
  title: "How proctoring works",
  description: "What HirePerfect monitors during an assessment, why, and how flagged moments are reviewed.",
};

export default function IntegrityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-12 md:py-16 w-full">
        {/* Page Hero */}
        <div className="max-w-3xl mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight mb-4">
            {integrityContent.hero.heading}
          </h1>
          <p className="text-lg text-graphite leading-relaxed">
            {integrityContent.hero.subhead}
          </p>
        </div>

        {/* Hero Illustration / Photo */}
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-panel overflow-hidden bg-sheet border border-rule mb-12 shadow-subtle">
          <Image
            src="/images/integrity-check.webp"
            alt="Candidate setting up the camera before an assessment"
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
        </div>

        {/* Interactive Tabs: Candidates vs Organisations */}
        <IntegrityTabsClient content={integrityContent} />
      </main>

      <Footer />
    </div>
  );
}

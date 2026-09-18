import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { CATEGORIES } from '@/Backend/lib/constants';
import { assessmentsContent, assessmentGroups } from '@/src/content/assessments';
import { siteStats } from '@/src/config/site-stats';
import AssessmentsClientFilter from './AssessmentsClientFilter';

export const metadata: Metadata = {
  title: "Assessment library — 240 proctored assessments",
  description: "Browse 20 categories of proctored MCQ assessments, from generative AI and data engineering to HR analytics and ESG strategy.",
};

export default function AssessmentsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-10 md:py-14 w-full">
        {/* Page Header Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10 bg-sheet border border-rule rounded-panel p-6 sm:p-8 shadow-subtle">
          <div className="lg:col-span-8">
            <span className="text-xs font-bold uppercase tracking-wider text-signal bg-signal-soft px-2.5 py-0.5 rounded-chip inline-block mb-3">
              Standardized Examination Library
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
              {assessmentsContent.heading}
            </h1>
            <p className="text-base text-graphite leading-relaxed">
              {siteStats.categories} categories, {siteStats.assessmentsPerCategory} assessments each. Every assessment is proctored by GuardEye AI with instant certified scoring.
            </p>
          </div>
          <div className="lg:col-span-4 hidden lg:block">
            <div className="relative aspect-[16/10] w-full rounded-card overflow-hidden border border-rule bg-paper">
              <Image
                src="/images/library-header.webp"
                alt="Assessment Library Showcase"
                fill
                sizes="(max-width: 1200px) 30vw, 360px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Client Interactive Filter & Grid inside Suspense */}
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-sheet border border-rule rounded-card animate-pulse" />
              ))}
            </div>
          }
        >
          <AssessmentsClientFilter
            categories={CATEGORIES}
            groups={assessmentGroups}
          />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

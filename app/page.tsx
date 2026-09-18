'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  Eye,
  Users,
  Maximize,
  ExternalLink,
  Copy,
  Terminal,
  Clock,
  CheckCircle,
  Smartphone,
  Sparkles,
  Mic,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatusChip from '@/components/ui/StatusChip';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Accordion from '@/components/ui/Accordion';
import OMRBubble from '@/components/ui/OMRBubble';
import SessionReplay from '@/components/ui/SessionReplay';
import IntegrityReportMock from '@/components/ui/IntegrityReportMock';
import CategoryCard from '@/components/ui/CategoryCard';
import KineticGrid from '@/components/ui/KineticGrid';
import AudienceSection from '@/src/components/home/audiences/AudienceSection';
import { homeContent, audiences } from '@/src/content/home';
import { pricingContent } from '@/src/content/pricing';
import { siteStats } from '@/src/config/site-stats';
import { CATEGORIES } from '@/Backend/lib/constants';

type AudienceType = 'hiring' | 'candidate';

export default function HomePage() {
  const [audience, setAudience] = useState<AudienceType>('hiring');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');

  // Load and persist audience choice in sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('hp_audience') as AudienceType;
    if (saved === 'hiring' || saved === 'candidate') {
      setAudience(saved);
    }
  }, []);

  const handleAudienceChange = (val: AudienceType) => {
    setAudience(val);
    sessionStorage.setItem('hp_audience', val);
  };

  const currentHeroContent =
    audience === 'hiring' ? homeContent.hero.audience.hiring : homeContent.hero.audience.candidate;

  // Signal icons mapper
  const getSignalIcon = (id: string) => {
    switch (id) {
      case 'face-absence': return <Eye className="w-5 h-5 text-signal" />;
      case 'multiple-faces': return <Users className="w-5 h-5 text-signal" />;
      case 'fullscreen-exit': return <Maximize className="w-5 h-5 text-signal" />;
      case 'tab-switch': return <ExternalLink className="w-5 h-5 text-signal" />;
      case 'copy-paste': return <Copy className="w-5 h-5 text-signal" />;
      case 'dev-tools': return <Terminal className="w-5 h-5 text-signal" />;
      case 'unusual-timing': return <Clock className="w-5 h-5 text-signal" />;
      case 'second-device': return <Smartphone className="w-5 h-5 text-graphite" />;
      case 'ai-overlay': return <Sparkles className="w-5 h-5 text-graphite" />;
      case 'audio-voices': return <Mic className="w-5 h-5 text-graphite" />;
      default: return <Shield className="w-5 h-5 text-signal" />;
    }
  };

  const previewCategories = CATEGORIES.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* A. Hero Section with Interactive KineticGrid */}
        <section className="relative border-b border-rule overflow-hidden">
          <KineticGrid globalColor="paper" isAbsolute={true} className="pt-12 pb-20 md:pt-20 md:pb-28">
            <div className="max-w-container mx-auto px-5 sm:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                {/* Left Hero Content */}
                <div className="lg:col-span-7 flex flex-col items-start text-left">
                  {/* Segmented Audience Switcher */}
                  <div className="mb-6">
                    <SegmentedControl<AudienceType>
                      options={[
                        { value: 'hiring', label: "I'm hiring" },
                        { value: 'candidate', label: "I'm taking a test" },
                      ]}
                      value={audience}
                      onChange={handleAudienceChange}
                    />
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight mb-6 leading-[1.1]">
                    {homeContent.hero.title}
                  </h1>

                  <p className="text-base sm:text-lg text-graphite leading-relaxed max-w-xl mb-8 min-h-[56px] transition-opacity duration-150">
                    {currentHeroContent.subhead}
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <Link href={currentHeroContent.primaryCta.href}>
                      <Button variant="primary" size="lg">
                        {currentHeroContent.primaryCta.text}
                      </Button>
                    </Link>
                    <Link href={currentHeroContent.secondaryCta.href}>
                      <Button variant="secondary" size="lg">
                        {currentHeroContent.secondaryCta.text}
                      </Button>
                    </Link>
                  </div>

                  {/* Single quiet trust line */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-graphite font-medium">
                    <span>{siteStats.categories} categories</span>
                    <span className="text-rule-strong">/</span>
                    <span>{siteStats.assessments} assessments</span>
                    <span className="text-rule-strong">/</span>
                    <span>Payments secured by Razorpay</span>
                  </div>
                </div>

                {/* Right Hero Signature Animation */}
                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <SessionReplay />
                </div>
              </div>
            </div>
          </KineticGrid>
        </section>

        {/* B. How Every Attempt Is Protected (Numbered Sequence) */}
        <section className="py-20 md:py-28 border-b border-rule bg-sheet">
          <div className="max-w-container mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-3">
                {homeContent.protectionSteps.heading}
              </h2>
              <p className="text-base text-graphite leading-relaxed">
                {homeContent.protectionSteps.intro}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {homeContent.protectionSteps.steps.map((step, idx) => {
                const stepImages = [
                  '/images/step-before.webp',
                  '/images/step-during.webp',
                  '/images/step-after.webp',
                ];
                return (
                  <div
                    key={step.number}
                    className="flex flex-col gap-4 bg-paper rounded-card border border-rule p-5 shadow-subtle hover:shadow-floating transition-all duration-200 group"
                  >
                    <div className="relative aspect-[16/10] w-full rounded-chip overflow-hidden border border-rule bg-sheet">
                      <Image
                        src={stepImages[idx]}
                        alt={step.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <OMRBubble
                        letter={String(step.number)}
                        variant="signal"
                        filled
                        size="sm"
                      />
                      <h3 className="text-lg font-bold text-ink">{step.title}</h3>
                    </div>
                    <p className="text-sm text-graphite leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* C. Integrity Report Showcase */}
        <section className="py-20 md:py-28 border-b border-rule bg-paper">
          <div className="max-w-container mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-3">
                {homeContent.integrityReportShowcase.heading}
              </h2>
              <p className="text-base text-graphite leading-relaxed">
                {homeContent.integrityReportShowcase.body}
              </p>
            </div>

            <div className="max-w-4xl mx-auto mb-8">
              <IntegrityReportMock />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <span className="text-xs font-semibold text-graphite uppercase">Reviewer Tiers:</span>
              <StatusChip variant="clean">No issues</StatusChip>
              <StatusChip variant="review">Needs review</StatusChip>
              <StatusChip variant="flagged">Major issues</StatusChip>
            </div>
          </div>
        </section>

        {/* D. What GuardEye AI Monitors */}
        <section className="py-24 md:py-32 border-b border-rule bg-sheet">
          <div className="max-w-container mx-auto px-5 sm:px-8">
            <div className="max-w-3xl mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-4">
                {homeContent.guardEyeMonitored.heading}
              </h2>
              <p className="text-base sm:text-lg text-graphite leading-relaxed">
                Real-time browser heuristics and computer vision detection models running during every attempt.
              </p>
            </div>

            {/* Live Signals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {homeContent.guardEyeMonitored.signals.map((sig) => (
                <Card
                  key={sig.id}
                  className="p-6 sm:p-7 flex flex-col justify-between hover:shadow-floating transition-all duration-300 group border-rule"
                >
                  <div>
                    {/* Visual Card Image */}
                    <div className="relative aspect-[16/10] w-full rounded-card overflow-hidden bg-paper border border-rule mb-5 group-hover:border-signal/30 transition-colors shadow-subtle">
                      <Image
                        src={sig.image}
                        alt={sig.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <h3 className="text-lg font-bold text-ink mb-2 group-hover:text-signal transition-colors">
                      {sig.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-graphite leading-relaxed mb-6">
                      {sig.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-rule flex items-center justify-between">
                    <StatusChip variant="clean" size="sm">
                      Live detection
                    </StatusChip>
                    <span className="text-[11px] font-mono text-graphite">Real-time</span>
                  </div>
                </Card>
              ))}
            </div>

            {/* Roadmap Row */}
            <div className="border-t border-rule pt-12">
              <div className="flex items-center gap-3 mb-6">
                <StatusChip variant="roadmap" size="sm">
                  On the roadmap
                </StatusChip>
                <span className="text-sm font-medium text-graphite">Additional signals in development</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {homeContent.guardEyeMonitored.roadmapSignals.map((sig) => (
                  <div
                    key={sig.id}
                    className="p-5 rounded-card border border-dashed border-rule bg-paper flex flex-col justify-between hover:border-signal/40 transition-colors"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full rounded-card overflow-hidden bg-sheet border border-rule mb-4">
                        <Image
                          src={sig.image}
                          alt={sig.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-ink mb-1.5">{sig.title}</h4>
                      <p className="text-xs text-graphite leading-relaxed">{sig.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* E. Assessment Library Preview */}
        <section className="py-20 md:py-28 border-b border-rule bg-paper">
          <div className="max-w-container mx-auto px-5 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-2">
                  Assessment library
                </h2>
                <p className="text-base text-graphite">
                  {siteStats.assessments} assessments across {siteStats.categories} categories. Each category has 12 assessments.
                </p>
              </div>
              <Link href="/assessments">
                <Button variant="secondary" size="md">
                  View all 20 categories →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {previewCategories.map((category) => (
                <CategoryCard
                  key={category.slug}
                  name={category.name}
                  slug={category.slug}
                  description={category.description}
                  subjects={category.subjects}
                />
              ))}
            </div>
          </div>
        </section>

        {/* F. Who It's For (Expanding Scroll Panels) */}
        <AudienceSection
          audiences={audiences}
          heading={homeContent.whoItIsFor.heading}
          intro={homeContent.whoItIsFor.intro}
        />

        {/* G. Fairness Principles */}
        <section className="py-20 md:py-28 border-b border-rule bg-paper">
          <div className="max-w-container mx-auto px-5 sm:px-8">
            <div className="max-w-2xl mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-3">
                {homeContent.fairness.heading}
              </h2>
              <p className="text-base text-graphite">
                Proctoring should build confidence, not create anxiety.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {homeContent.fairness.principles.map((item, idx) => (
                <div key={idx} className="bg-sheet p-6 rounded-card border border-rule flex flex-col gap-3">
                  <div className="w-8 h-8 rounded-full bg-signal-soft text-signal flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <h3 className="text-base font-bold text-ink">{item.title}</h3>
                  <p className="text-sm text-graphite leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* H. Pricing Summary */}
        <section className="py-20 md:py-28 border-b border-rule bg-sheet">
          <div className="max-w-container mx-auto px-5 sm:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-2">
                  Simple, one-time pricing
                </h2>
                <p className="text-base text-graphite">
                  Pay once for what you need. No subscriptions or hidden fees.
                </p>
              </div>
              <Link href="/pricing">
                <Button variant="secondary" size="md">
                  Compare plan details →
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {pricingContent.plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`p-8 flex flex-col justify-between relative ${
                    plan.badge ? 'border-signal ring-1 ring-signal' : ''
                  }`}
                >
                  <div>
                    {plan.badge && (
                      <div className="mb-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-signal bg-signal-soft px-2.5 py-1 rounded-chip">
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-ink mb-1">{plan.name}</h3>
                    <p className="text-xs text-graphite mb-6">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-3xl font-extrabold text-ink">{plan.priceLabel}</span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="text-xs text-graphite flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-clean shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={plan.cta.href}>
                    <Button
                      variant={plan.badge ? 'primary' : 'secondary'}
                      size="md"
                      className="w-full"
                    >
                      {plan.cta.text}
                    </Button>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* I. FAQ */}
        <section className="py-20 md:py-28 border-b border-rule bg-paper">
          <div className="max-w-3xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-ink mb-3">
                Frequently asked questions
              </h2>
              <p className="text-sm text-graphite">
                Everything you need to know about taking tests and reviewing integrity reports.
              </p>
            </div>

            <Accordion
              items={homeContent.faq.map((f, i) => ({
                id: `faq-${i}`,
                question: f.question,
                answer: f.answer,
              }))}
            />
          </div>
        </section>

        {/* J. Final CTA Band (Centred) */}
        <section className="py-24 bg-sheet text-center">
          <div className="max-w-2xl mx-auto px-5 sm:px-8 flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-4">
              {homeContent.finalCta.heading}
            </h2>
            <p className="text-base text-graphite leading-relaxed mb-8 max-w-lg">
              {homeContent.finalCta.body}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href={homeContent.finalCta.primaryCta.href}>
                <Button variant="primary" size="lg">
                  {homeContent.finalCta.primaryCta.text}
                </Button>
              </Link>
              <Link href={homeContent.finalCta.secondaryCta.href}>
                <Button variant="secondary" size="lg">
                  {homeContent.finalCta.secondaryCta.text}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  CheckCircle,
  Shield,
  Layers,
  FileText,
  Award,
  Users,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { aboutContent } from '@/src/content/about';

export const metadata: Metadata = {
  title: "About HirePerfect",
  description: "We make remote assessments trustworthy for hiring teams, colleges and training programmes.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-12 md:py-16 w-full">
        {/* Hero Section */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-signal block mb-2">
            About HirePerfect
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight mb-6 leading-tight">
            {aboutContent.hero.heading}
          </h1>
          <p className="text-lg text-graphite leading-relaxed">
            {aboutContent.hero.lead}
          </p>
        </div>

        {/* Workspace Photo */}
        <div className="relative aspect-[16/9] w-full rounded-panel overflow-hidden bg-sheet border border-rule mb-16 shadow-subtle">
          <Image
            src="/images/about-workspace.webp"
            alt="Team working together in a bright office"
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
        </div>

        {/* What We Believe */}
        <section className="mb-16">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl font-bold text-ink mb-2">
              {aboutContent.beliefs.heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aboutContent.beliefs.items.map((item, idx) => (
              <Card key={idx} className="p-6 flex flex-col justify-between">
                <div>
                  <span className="w-8 h-8 rounded-full bg-signal-soft text-signal flex items-center justify-center font-bold text-sm mb-4">
                    {idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-ink mb-2">{item.title}</h3>
                  <p className="text-xs text-graphite leading-relaxed">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* What the Platform Includes */}
        <section className="bg-sheet border border-rule rounded-panel p-8 sm:p-12 mb-16">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl font-bold text-ink mb-2">
              {aboutContent.platformCapabilities.heading}
            </h2>
            <p className="text-sm text-graphite">
              Core technologies powering examination delivery and integrity verification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {aboutContent.platformCapabilities.items.map((cap, idx) => {
              const icons = [
                <Layers key="0" className="w-5 h-5 text-signal" />,
                <Shield key="1" className="w-5 h-5 text-signal" />,
                <CheckCircle key="2" className="w-5 h-5 text-signal" />,
                <FileText key="3" className="w-5 h-5 text-signal" />,
                <Award key="4" className="w-5 h-5 text-signal" />,
                <Users key="5" className="w-5 h-5 text-signal" />,
              ];
              return (
                <div key={idx} className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-btn bg-signal-soft flex items-center justify-center shrink-0">
                    {icons[idx % icons.length]}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink mb-1">{cap.title}</h3>
                    <p className="text-xs text-graphite leading-relaxed">{cap.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Who We Serve */}
        <section className="mb-16">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl font-bold text-ink mb-2">
              {aboutContent.whoWeServe.heading}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutContent.whoWeServe.groups.map((group, idx) => {
              const groupPhotos = [
                '/images/who-hiring.webp',
                '/images/who-campus.webp',
                '/images/who-academy.webp',
                '/images/who-candidate.webp',
              ];
              return (
                <div
                  key={idx}
                  className="bg-sheet rounded-card border border-rule overflow-hidden p-4 shadow-subtle hover:shadow-floating transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[4/3] w-full rounded-chip overflow-hidden border border-rule bg-paper mb-3">
                      <Image
                        src={groupPhotos[idx]}
                        alt={group.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-sm font-bold text-ink mb-1">{group.title}</h3>
                    <p className="text-xs text-graphite leading-relaxed">{group.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Security and Privacy Standard */}
        <section className="bg-paper border border-rule rounded-panel p-8 mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-lg font-bold text-ink mb-2">
            {aboutContent.standards.heading}
          </h2>
          <p className="text-xs text-graphite leading-relaxed max-w-xl mx-auto mb-4">
            {aboutContent.standards.body}
          </p>
          <Link
            href={aboutContent.standards.linkHref}
            className="text-xs font-semibold text-signal hover:underline"
          >
            {aboutContent.standards.linkText} →
          </Link>
        </section>

        {/* CTA */}
        <section className="bg-sheet border border-rule rounded-panel p-10 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-ink mb-2">
            {aboutContent.cta.heading}
          </h2>
          <p className="text-sm text-graphite mb-6">
            {aboutContent.cta.subhead}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href={aboutContent.cta.primaryCta.href}>
              <Button variant="primary" size="md">
                {aboutContent.cta.primaryCta.text}
              </Button>
            </Link>
            <Link href={aboutContent.cta.secondaryCta.href}>
              <Button variant="secondary" size="md">
                {aboutContent.cta.secondaryCta.text}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

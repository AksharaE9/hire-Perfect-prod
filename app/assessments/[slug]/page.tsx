import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { CATEGORIES } from '@/Backend/lib/constants';
import CategoryDetailClient from './CategoryDetailClient';
import IndividualAssessmentClient from './IndividualAssessmentClient';

interface SlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);
  if (category) {
    return {
      title: `${category.name} assessments`,
      description: `${category.description} 12 proctored assessments from beginner to expert.`,
    };
  }

  return {
    title: 'Assessment Details — HirePerfect',
    description: 'Proctored MCQ assessment with GuardEye AI integrity checks and reviewable report.',
  };
}

export default async function AssessmentOrCategoryPage({ params }: SlugPageProps) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-10 md:py-14 w-full">
        {category ? (
          <CategoryDetailClient category={category} />
        ) : (
          <IndividualAssessmentClient id={slug} />
        )}
      </main>

      <Footer />
    </div>
  );
}

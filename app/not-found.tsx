import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-16 md:py-24 flex flex-col items-center justify-center text-center">
        <div className="relative w-40 h-40 mb-8 rounded-card overflow-hidden bg-sheet border border-rule shadow-subtle flex items-center justify-center">
          <Image
            src="/images/empty-state.webp"
            alt="An OMR answer sheet with one empty bubble"
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-signal mb-2 block">
          404 · Not Found
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
          This page doesn&apos;t exist.
        </h1>
        <p className="text-sm text-graphite max-w-md mb-8">
          The link may be old, mistyped, or the page may have been moved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/">
            <Button variant="primary" size="md">
              Go to home
            </Button>
          </Link>
          <Link href="/assessments">
            <Button variant="secondary" size="md">
              Browse assessments
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

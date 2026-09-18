'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Button from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-16 md:py-24 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-flagged-soft text-flagged flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
          Something went wrong on our side.
        </h1>
        <p className="text-sm text-graphite max-w-md mb-8">
          Try refreshing the page or reloading. If it keeps happening, contact our support team.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button variant="primary" size="md" onClick={() => reset()}>
            Try again
          </Button>
          <Link href="/contact">
            <Button variant="secondary" size="md">
              Contact us
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

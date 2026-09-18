'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Card from './Card';
import Button from './Button';

interface CriticalErrorProps {
  title?: string;
  message?: string;
  nodeName?: string;
}

export default function CriticalError({
  title = "Assessment Unavailable",
  message = "This assessment attempt has already been completed or terminated.",
}: CriticalErrorProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg p-8 bg-sheet border border-rule shadow-floating text-center">
        <div className="w-12 h-12 rounded-full bg-flagged-soft border border-flagged/20 text-flagged flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h2 className="text-heading-lg font-bold text-ink mb-3">{title}</h2>
        <p className="text-graphite text-body-md leading-relaxed mb-8">{message}</p>

        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" onClick={() => (window.location.href = '/assessments')}>
            Browse assessments
          </Button>
          <Button variant="primary" onClick={() => (window.location.href = '/dashboard')}>
            Go to dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}

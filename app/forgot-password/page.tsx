'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process request');

      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || 'Unable to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-paper p-6 sm:p-12">
      {/* Brand Header */}
      <div className="max-w-md mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-btn bg-navy flex items-center justify-center text-white font-bold text-base shadow-subtle group-hover:bg-navy-2 transition-colors">
            H
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-ink">
            HirePerfect
          </span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="max-w-md mx-auto w-full my-auto py-8">
        <Card className="p-8 sm:p-10 shadow-floating">
          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-clean-soft text-clean flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-ink mb-2">Check your email</h1>
              <p className="text-xs text-graphite leading-relaxed mb-6">
                If an account exists for <strong className="text-ink">{email}</strong>, a password reset link has been sent. Please check your inbox and spam folder.
              </p>
              <Link href="/login">
                <Button variant="secondary" size="md" className="w-full">
                  Return to login
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-ink mb-2">Reset your password</h1>
                <p className="text-xs text-graphite leading-relaxed">
                  Enter your account email and we&apos;ll send a password reset link.
                </p>
              </div>

              {status === 'error' && (
                <div className="p-3.5 rounded-card bg-flagged-soft border border-flagged/20 text-xs text-flagged flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Account email address"
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={loading}
                >
                  Send reset link
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-graphite hover:text-ink transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Footer */}
      <div className="max-w-md mx-auto w-full text-center text-xs text-graphite">
        <p>© 2026 HirePerfect.</p>
      </div>
    </div>
  );
}

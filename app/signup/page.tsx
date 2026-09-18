'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { storeLoginTimestamp } from '@/lib/sessionUtils';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    role: 'candidate',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match. Please check and try again.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms of service and Privacy policy.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone ? `+91 ${formData.phone}` : undefined,
          role: formData.role === 'admin' ? 'admin' : 'candidate',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      storeLoginTimestamp();

      if (data.user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-paper">
      {/* Left Column: Form */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        {/* Brand Header */}
        <div className="mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-btn bg-navy flex items-center justify-center text-white font-bold text-base shadow-subtle group-hover:bg-navy-2 transition-colors">
              H
            </span>
            <span className="font-display font-bold text-lg tracking-tight text-ink">
              HirePerfect
            </span>
          </Link>
        </div>

        {/* Signup Form */}
        <div className="my-auto py-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-2">
              Create your account
            </h1>
            <p className="text-sm text-graphite">
              Take proctored assessments or evaluate candidates, all from one account.
            </p>
          </div>

          <Card className="p-8 sm:p-10 shadow-floating">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-card bg-flagged-soft border border-flagged/20 text-xs text-flagged flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Full name"
                id="name"
                placeholder="e.g. Rahul Verma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="role" className="text-xs font-medium text-ink">
                  I&apos;m joining as
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-sheet text-ink text-sm rounded-chip border border-rule-strong px-3.5 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-signal transition-colors cursor-pointer"
                >
                  <option value="candidate">Candidate (Taking assessments)</option>
                  <option value="admin">Recruiter or organisation</option>
                </select>
              </div>

              <Input
                label="Email address"
                id="email"
                type="email"
                placeholder="rahul@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="phone" className="text-xs font-medium text-ink">
                  Phone number (optional)
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-chip border border-r-0 border-rule-strong bg-paper text-xs text-graphite font-medium">
                    +91
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-sheet text-ink text-sm rounded-r-chip border border-rule-strong px-3.5 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-signal transition-colors"
                  />
                </div>
              </div>

              <Input
                label="Password"
                id="password"
                type="password"
                placeholder="At least 8 characters"
                helperText="Use 8 or more characters with a mix of letters and numbers."
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />

              <Input
                label="Confirm password"
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />

              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-graphite cursor-pointer select-none leading-relaxed">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-rule-strong text-signal focus:ring-signal"
                    required
                  />
                  <span>
                    I agree to the{' '}
                    <Link href="/terms" className="text-signal hover:underline">
                      Terms of service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-signal hover:underline">
                      Privacy policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={loading}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          </Card>

          <p className="text-center text-xs text-graphite mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-signal font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* Footer info */}
        <div className="text-xs text-graphite pt-4">
          <p>© 2026 HirePerfect. Proctoring integrity for every score.</p>
        </div>
      </div>

      {/* Right Column: Editorial Image Panel */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-sheet border-l border-rule flex-col justify-between p-12 overflow-hidden">
        <div className="relative aspect-[4/5] w-full rounded-panel overflow-hidden border border-rule shadow-subtle my-auto">
          <Image
            src="/images/auth-signup.webp"
            alt=""
            fill
            priority
            aria-hidden="true"
            sizes="40vw"
            className="object-cover"
          />
        </div>

        <div className="relative z-10 pt-6 text-center">
          <p className="text-xs text-graphite font-medium">
            Your results come with an integrity record employers can trust.
          </p>
        </div>
      </div>
    </div>
  );
}

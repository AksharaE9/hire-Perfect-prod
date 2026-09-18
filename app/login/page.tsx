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

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "That email and password don't match. Try again or reset your password."
        );
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      storeLoginTimestamp();

      if (data.user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || "That email and password don't match. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-paper">
      {/* Left Column: Form */}
      <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-xl mx-auto w-full">
        {/* Brand Header */}
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="w-8 h-8 rounded-btn bg-navy flex items-center justify-center text-white font-bold text-base shadow-subtle group-hover:bg-navy-2 transition-colors">
              H
            </span>
            <span className="font-display font-bold text-lg tracking-tight text-ink">
              HirePerfect
            </span>
          </Link>
        </div>

        {/* Login Form Box */}
        <div className="my-auto py-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight mb-2">
              Log in to HirePerfect
            </h1>
            <p className="text-sm text-graphite">
              Welcome back. Enter your email and password.
            </p>
          </div>

          <Card className="p-8 sm:p-10 shadow-floating">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3.5 rounded-card bg-flagged-soft border border-flagged/20 text-xs text-flagged flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Email address"
                id="email"
                type="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <Input
                label="Password"
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-graphite cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-rule-strong text-signal focus:ring-signal"
                  />
                  <span>Keep me signed in</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="font-medium text-signal hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={loading}
              >
                {loading ? 'Logging in…' : 'Log in'}
              </Button>
            </form>
          </Card>

          <p className="text-center text-xs text-graphite mt-6">
            New to HirePerfect?{' '}
            <Link href="/signup" className="text-signal font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* Footer info */}
        <div className="text-xs text-graphite pt-4">
          <p>© 2026 HirePerfect. All attempts are proctored and verified.</p>
        </div>
      </div>

      {/* Right Column: Editorial Image Panel */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-sheet border-l border-rule flex-col justify-between p-12 overflow-hidden">
        <div className="relative aspect-[4/5] w-full rounded-panel overflow-hidden border border-rule shadow-subtle my-auto">
          <Image
            src="/images/auth-login.webp"
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
            Every attempt on HirePerfect is proctored and reviewable.
          </p>
        </div>
      </div>
    </div>
  );
}

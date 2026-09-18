'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { CheckCircle, AlertCircle } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Password reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 sm:p-10 shadow-floating">
      {success ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-clean-soft text-clean flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-ink mb-2">Password reset complete</h1>
          <p className="text-xs text-graphite mb-6">
            Your password has been successfully updated. You can now log in with your new credentials.
          </p>
          <Link href="/login">
            <Button variant="primary" size="md" className="w-full">
              Proceed to login
            </Button>
          </Link>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ink mb-2">Set new password</h1>
            <p className="text-xs text-graphite">
              Enter your new password below to regain access to your account.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-card bg-flagged-soft border border-flagged/20 text-xs text-flagged flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New password"
              id="newPassword"
              type="password"
              placeholder="At least 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm new password"
              id="confirmPassword"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              Update password
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-paper p-6 sm:p-12">
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

      <div className="max-w-md mx-auto w-full my-auto py-8">
        <Suspense fallback={<Card className="p-8 animate-pulse h-64" />}>
          <ResetPasswordContent />
        </Suspense>
      </div>

      <div className="max-w-md mx-auto w-full text-center text-xs text-graphite">
        <p>© 2026 HirePerfect.</p>
      </div>
    </div>
  );
}

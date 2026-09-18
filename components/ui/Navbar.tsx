'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
import { Button } from './Button';
import { CameraManager } from '@/lib/cameraManager';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; role?: string; email?: string } | null>(null);

  useEffect(() => {
    const rawUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        setUser(parsed);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    CameraManager.stop();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginAt');
    setUser(null);
    router.push('/');
  };

  const navLinks = [
    { label: 'Assessments', href: '/assessments' },
    { label: 'How it works', href: '/integrity' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
  ];

  const authWorkspaceLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Assessments', href: '/my-assessments' },
    { label: 'Challenges', href: '/coding' },
    { label: 'Projects', href: '/projects' },
  ];

  const adminLinks = [
    { label: 'Admin Dashboard', href: '/admin/dashboard' },
    { label: 'Candidates', href: '/admin/candidates' },
    { label: 'Assessments Manager', href: '/admin/assessments' },
    { label: 'Submissions', href: '/admin/submissions' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-rule transition-colors">
      <div className="max-w-container mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo Wordmark */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-btn bg-signal flex items-center justify-center text-white font-bold text-base shadow-subtle group-hover:bg-signal/90 transition-colors">
            H
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-ink">
            HirePerfect
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-3.5 py-2 rounded-btn transition-colors ${
                  isActive
                    ? 'text-signal bg-signal-soft'
                    : 'text-graphite hover:text-ink hover:bg-sheet'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth / Action Area */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-ink bg-sheet border border-rule px-3.5 py-2 rounded-btn hover:border-rule-strong transition-colors"
              >
                <User className="w-4 h-4 text-signal" />
                <span className="max-w-[120px] truncate">{user.name || 'Account'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-graphite" />
              </button>

              <div className="absolute right-0 mt-1.5 w-52 bg-sheet border border-rule rounded-card shadow-floating p-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                {user.role === 'admin' ? (
                  adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-3 py-2 text-xs font-medium text-ink hover:bg-paper rounded-chip transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))
                ) : (
                  authWorkspaceLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-3 py-2 text-xs font-medium text-ink hover:bg-paper rounded-chip transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))
                )}
                <div className="my-1 border-t border-rule" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-flagged hover:bg-flagged-soft rounded-chip transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  Create account
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="p-2 text-graphite hover:text-ink rounded-btn focus-visible:outline-2 focus-visible:outline-signal"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-over Sheet Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-sheet border-t border-rule md:hidden flex flex-col justify-between p-6 animate-fadeIn">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-graphite px-3 mb-1">
              Menu
            </span>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-base font-medium px-4 py-3 rounded-btn min-h-[44px] flex items-center transition-colors ${
                    isActive ? 'bg-signal-soft text-signal' : 'text-ink hover:bg-paper'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {user && (
              <>
                <div className="my-2 border-t border-rule" />
                <span className="text-[11px] font-semibold uppercase tracking-wider text-graphite px-3 mb-1">
                  {user.role === 'admin' ? 'Admin Navigation' : 'Workspace'}
                </span>
                {(user.role === 'admin' ? adminLinks : authWorkspaceLinks).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-base font-medium px-4 py-3 rounded-btn min-h-[44px] flex items-center text-ink hover:bg-paper transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-rule">
            {user ? (
              <Button
                variant="destructive"
                size="lg"
                onClick={handleLogout}
                className="w-full min-h-[48px]"
              >
                Log out
              </Button>
            ) : (
              <>
                <Link href="/login" className="w-full">
                  <Button variant="secondary" size="lg" className="w-full min-h-[48px]">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button variant="primary" size="lg" className="w-full min-h-[48px]">
                    Create account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

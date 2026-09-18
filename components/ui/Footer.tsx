import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-paper border-t border-rule mt-auto">
      <div className="max-w-container mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-btn bg-signal flex items-center justify-center text-white font-bold text-base shadow-subtle group-hover:bg-signal/90 transition-colors">
                H
              </span>
              <span className="font-display font-bold text-lg tracking-tight text-ink">
                HirePerfect
              </span>
            </Link>
            <p className="text-sm text-graphite max-w-xs leading-relaxed">
              AI-proctored online assessments with browser lockdown, identity verification, and reviewable integrity records.
            </p>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-ink">Product</span>
            <Link href="/assessments" className="text-sm text-graphite hover:text-signal transition-colors">
              Assessments
            </Link>
            <Link href="/pricing" className="text-sm text-graphite hover:text-signal transition-colors">
              Pricing
            </Link>
            <Link href="/integrity" className="text-sm text-graphite hover:text-signal transition-colors">
              How proctoring works
            </Link>
            <Link href="/dashboard" className="text-sm text-graphite hover:text-signal transition-colors">
              Dashboard
            </Link>
          </div>

          {/* Company Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-ink">Company</span>
            <Link href="/about" className="text-sm text-graphite hover:text-signal transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-sm text-graphite hover:text-signal transition-colors">
              Contact
            </Link>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-ink">Legal</span>
            <Link href="/privacy" className="text-sm text-graphite hover:text-signal transition-colors">
              Privacy policy
            </Link>
            <Link href="/terms" className="text-sm text-graphite hover:text-signal transition-colors">
              Terms of service
            </Link>
          </div>
        </div>

        {/* Bottom Baseline */}
        <div className="pt-8 border-t border-rule flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-graphite">
          <p>© 2026 HirePerfect.</p>
          <p>Payments secured by Razorpay · HMAC-SHA256 signature verified</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

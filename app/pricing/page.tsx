import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, ShieldCheck, Lock, CreditCard } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Accordion from '@/components/ui/Accordion';
import { pricingContent } from '@/src/content/pricing';

export const metadata: Metadata = {
  title: "Pricing — one-time payments",
  description: "Single assessment ₹500, category pack ₹2,000, full library ₹8,000. No subscriptions.",
};

export default function PricingPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'HirePerfect Proctored Assessments',
    description: 'AI-proctored MCQ assessments for tech and business domains.',
    offers: pricingContent.plans.map((p) => ({
      '@type': 'Offer',
      name: p.name,
      price: p.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    })),
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-12 md:py-16 w-full">
        {/* Page Hero */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight mb-3">
            {pricingContent.hero.heading}
          </h1>
          <p className="text-lg text-graphite mb-2">
            {pricingContent.hero.subhead}
          </p>
          <span className="text-xs text-graphite font-medium">
            {pricingContent.hero.gstNote}
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 items-stretch">
          {pricingContent.plans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-8 flex flex-col justify-between relative ${
                plan.badge ? 'border-2 border-signal shadow-floating ring-1 ring-signal/20' : ''
              }`}
            >
              <div>
                {plan.badge && (
                  <div className="mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-signal bg-signal-soft px-2.5 py-1 rounded-chip">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <h2 className="text-xl font-bold text-ink mb-1">{plan.name}</h2>
                <p className="text-xs text-graphite mb-6">{plan.description}</p>

                <div className="mb-8">
                  <span className="text-3xl sm:text-4xl font-extrabold text-ink">
                    {plan.priceLabel}
                  </span>
                  <span className="text-xs text-graphite block mt-1">One-time payment</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="text-xs text-graphite flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-clean shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={plan.cta.href}>
                <Button
                  variant={plan.badge ? 'primary' : 'secondary'}
                  size="lg"
                  className="w-full"
                >
                  {plan.cta.text}
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* Payment Assurance Row */}
        <div className="bg-sheet border border-rule rounded-panel p-8 sm:p-10 mb-20">
          <div className="text-center max-w-md mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-signal block mb-1">
              Payment Assurance
            </span>
            <h2 className="text-xl font-bold text-ink">
              Secure, Signature-Verified Transactions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-btn bg-signal-soft flex items-center justify-center text-signal mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink mb-1">Secure checkout</h3>
              <p className="text-xs text-graphite leading-relaxed">
                Payments are handled by Razorpay. We never see or store your card details.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-btn bg-signal-soft flex items-center justify-center text-signal mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink mb-1">Verified payments</h3>
              <p className="text-xs text-graphite leading-relaxed">
                Every transaction is HMAC-SHA256 signature-checked before access is granted.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-10 h-10 rounded-btn bg-signal-soft flex items-center justify-center text-signal mb-3">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-ink mb-1">UPI, cards & net banking</h3>
              <p className="text-xs text-graphite leading-relaxed">
                Pay the way you prefer via cards, UPI (GPay, PhonePe, Paytm), or net banking.
              </p>
            </div>
          </div>
        </div>

        {/* Pricing FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-ink mb-2">
              Pricing questions & answers
            </h2>
            <p className="text-sm text-graphite">
              Clear answers to common questions about billing and access.
            </p>
          </div>

          <Accordion
            items={pricingContent.faq.map((f, i) => ({
              id: `pricing-faq-${i}`,
              question: f.question,
              answer: f.answer,
            }))}
          />
        </div>

        {/* Contact Strip */}
        <div className="bg-paper border border-rule rounded-card p-8 text-center max-w-xl mx-auto">
          <h3 className="text-lg font-bold text-ink mb-1">
            {pricingContent.contactCta.heading}
          </h3>
          <p className="text-xs text-graphite mb-4">
            {pricingContent.contactCta.subhead}
          </p>
          <Link href={pricingContent.contactCta.buttonHref}>
            <Button variant="secondary" size="md">
              {pricingContent.contactCta.buttonText} →
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

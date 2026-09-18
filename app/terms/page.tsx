import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service and user agreement for the HirePerfect platform.',
};

export default function TermsPage() {
  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'license', title: '2. Use License' },
    { id: 'conduct', title: '3. Integrity & Conduct' },
    { id: 'disclaimer', title: '4. Disclaimer' },
    { id: 'limitations', title: '5. Limitations' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-12 md:py-16 w-full">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 border-b border-rule pb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-signal block mb-2">
              Legal
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
              Terms of Service
            </h1>
            <p className="text-xs text-graphite">Last updated: February 17, 2026</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Table of Contents (Desktop Sticky) */}
            <aside className="hidden lg:block lg:col-span-4 sticky top-24 bg-sheet p-5 rounded-card border border-rule">
              <span className="text-xs font-bold uppercase tracking-wider text-ink block mb-3">
                Contents
              </span>
              <nav className="space-y-2">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block text-xs text-graphite hover:text-signal transition-colors py-1"
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </aside>

            {/* Main Article Content (68ch max) */}
            <article className="lg:col-span-8 bg-sheet p-8 sm:p-10 rounded-panel border border-rule shadow-subtle text-ink leading-relaxed space-y-8 max-w-[68ch]">
              <section id="acceptance">
                <h2 className="text-xl font-bold text-ink mb-3">1. Acceptance of Terms</h2>
                <p className="text-sm text-graphite leading-relaxed">
                  By accessing or using HirePerfect, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.
                </p>
              </section>

              <section id="license">
                <h2 className="text-xl font-bold text-ink mb-3">2. Use License</h2>
                <p className="text-sm text-graphite mb-3 leading-relaxed">
                  HirePerfect grants you a personal, non-exclusive, non-transferable license to use the platform for the purpose of completing or administering assessments. Under this license, you may not:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-graphite">
                  <li>Modify, distribute, or copy the assessment questions or AI proctoring code</li>
                  <li>Attempt to decompile or reverse engineer any software contained on the platform</li>
                  <li>Remove any copyright or proprietary notations from the platform materials</li>
                  <li>Circumvent or attempt to circumvent GuardEye AI monitoring protocols</li>
                </ul>
              </section>

              <section id="conduct">
                <h2 className="text-xl font-bold text-ink mb-3">3. Integrity & Conduct</h2>
                <p className="text-sm text-graphite mb-3 leading-relaxed">
                  Users agree to complete assessments with complete academic and professional honesty. Prohibited conduct includes but is not limited to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-graphite mb-3">
                  <li>Using unauthorized external assistance, hardware devices, or background software</li>
                  <li>Communicating with third parties during an active assessment attempt</li>
                  <li>Impersonating another registered individual</li>
                  <li>Screen capturing, recording, or redistributing assessment questions</li>
                </ul>
                <p className="text-xs text-graphite bg-paper p-4 rounded-card border border-rule">
                  Violation of these conduct standards may result in immediate attempt termination and flag logging in the integrity report.
                </p>
              </section>

              <section id="disclaimer">
                <h2 className="text-xl font-bold text-ink mb-3">4. Disclaimer</h2>
                <p className="text-sm text-graphite leading-relaxed">
                  The platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis. HirePerfect makes no warranties, expressed or implied, regarding uninterrupted service or fitness for a particular purpose beyond our stated service level objectives.
                </p>
              </section>

              <section id="limitations">
                <h2 className="text-xl font-bold text-ink mb-3">5. Limitations of Liability</h2>
                <p className="text-sm text-graphite leading-relaxed">
                  In no event shall HirePerfect or its suppliers be liable for any indirect or consequential damages arising out of the use or inability to use the platform.
                </p>
              </section>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

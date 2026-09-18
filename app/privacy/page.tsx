import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy and data processing standards for the HirePerfect platform.',
};

export default function PrivacyPage() {
  const sections = [
    { id: 'collection', title: '1. Information We Collect' },
    { id: 'proctoring', title: '2. AI Monitoring & Proctoring' },
    { id: 'usage', title: '3. Data Usage' },
    { id: 'security', title: '4. Data Security' },
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
              Privacy Policy
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
              <section id="collection">
                <h2 className="text-xl font-bold text-ink mb-3">1. Information We Collect</h2>
                <p className="text-sm text-graphite mb-3">
                  HirePerfect collects information to provide secure and reliable assessment services to candidates and organisations. This includes:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-graphite">
                  <li>Personal identifiers (Name, email address, account credentials)</li>
                  <li>Assessment responses (Answers, question timing, scoring records)</li>
                  <li>AI monitoring signals (Real-time camera feed analysis, full-screen events, tab focus state)</li>
                  <li>Device information (IP address, operating system, browser type)</li>
                </ul>
              </section>

              <section id="proctoring">
                <h2 className="text-xl font-bold text-ink mb-3">2. AI Monitoring & Proctoring</h2>
                <p className="text-sm text-graphite mb-3">
                  To ensure examination integrity, our GuardEye AI engine monitors testing sessions. During an assessment, the system monitors:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-graphite mb-4">
                  <li>Camera presence to detect candidate visibility and unauthorized secondary presence</li>
                  <li>Browser state to prevent tab switching, unauthorized navigation, or developer tools usage</li>
                  <li>Clipboard activity to restrict copy and paste operations</li>
                </ul>
                <p className="text-xs text-graphite bg-paper p-4 rounded-card border border-rule italic">
                  Video feeds are processed in real time on the client device. Flagged events are recorded in chronological integrity reports.
                </p>
              </section>

              <section id="usage">
                <h2 className="text-xl font-bold text-ink mb-3">3. Data Usage</h2>
                <p className="text-sm text-graphite mb-3">
                  Collected information is utilized strictly to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-graphite">
                  <li>Deliver assessment performance records and integrity reports to hiring teams and educators</li>
                  <li>Verify compliance with assessment rules and prevent fraudulent submissions</li>
                  <li>Maintain platform operational security and authentication</li>
                </ul>
              </section>

              <section id="security">
                <h2 className="text-xl font-bold text-ink mb-3">4. Data Security</h2>
                <p className="text-sm text-graphite">
                  We implement industry-standard encryption protocols (HTTPS/TLS) and secure token-based authentication to protect your data against unauthorized access or disclosure.
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

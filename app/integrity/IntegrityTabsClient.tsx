'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, Shield, CheckSquare, Info, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import SegmentedControl from '@/components/ui/SegmentedControl';
import StatusChip from '@/components/ui/StatusChip';
import OMRBubble from '@/components/ui/OMRBubble';
import IntegrityReportMock from '@/components/ui/IntegrityReportMock';

export default function IntegrityTabsClient({ content }: { content: any }) {
  const [activeTab, setActiveTab] = useState<'candidates' | 'organisations'>('candidates');

  return (
    <div className="space-y-10">
      {/* Segmented Tab Switcher */}
      <div className="flex justify-center sm:justify-start">
        <SegmentedControl<'candidates' | 'organisations'>
          options={[
            { value: 'candidates', label: 'For candidates' },
            { value: 'organisations', label: 'For organisations' },
          ]}
          value={activeTab}
          onChange={setActiveTab}
          size="md"
        />
      </div>

      {activeTab === 'candidates' ? (
        <div className="space-y-12">
          {/* Pre-Exam Checklist */}
          <section className="bg-sheet border border-rule rounded-panel p-6 sm:p-10">
            <h2 className="text-xl font-bold text-ink mb-2">
              {content.candidateTab.checklist.heading}
            </h2>
            <p className="text-sm text-graphite mb-8 max-w-2xl">
              {content.candidateTab.checklist.intro}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.candidateTab.checklist.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-4 rounded-card border border-rule bg-paper"
                >
                  <OMRBubble letter={String(idx + 1)} size="sm" filled variant="signal" />
                  <div>
                    <h3 className="text-sm font-bold text-ink mb-0.5">{item.label}</h3>
                    <p className="text-xs text-graphite leading-relaxed">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* What We Monitor and Why */}
          <section className="bg-sheet border border-rule rounded-panel p-6 sm:p-10">
            <h2 className="text-xl font-bold text-ink mb-6">
              {content.candidateTab.monitored.heading}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.candidateTab.monitored.signals.map((sig: any, idx: number) => (
                <div key={idx} className="p-4 rounded-card border border-rule bg-paper">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-signal shrink-0" />
                    <h3 className="text-sm font-bold text-ink">{sig.name}</h3>
                  </div>
                  <p className="text-xs text-graphite leading-relaxed">{sig.reason}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Troubleshooting & Privacy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3 text-ink">
                <AlertTriangle className="w-5 h-5 text-review" />
                <h3 className="text-base font-bold">{content.candidateTab.troubleshooting.heading}</h3>
              </div>
              <p className="text-xs text-graphite leading-relaxed">
                {content.candidateTab.troubleshooting.body}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-3 text-ink">
                <Shield className="w-5 h-5 text-clean" />
                <h3 className="text-base font-bold">{content.candidateTab.dataPrivacy.heading}</h3>
              </div>
              <p className="text-xs text-graphite leading-relaxed mb-4">
                {content.candidateTab.dataPrivacy.body}
              </p>
              <Link
                href={content.candidateTab.dataPrivacy.linkHref}
                className="text-xs font-semibold text-signal hover:underline"
              >
                {content.candidateTab.dataPrivacy.linkText} →
              </Link>
            </Card>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* 3-Stage Protection Model */}
          <section className="bg-sheet border border-rule rounded-panel p-6 sm:p-10">
            <h2 className="text-xl font-bold text-ink mb-6">
              {content.organisationTab.model.heading}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.organisationTab.model.stages.map((st: any, idx: number) => (
                <div key={idx} className="p-5 rounded-card border border-rule bg-paper">
                  <h3 className="text-base font-bold text-ink mb-2">{st.stage}</h3>
                  <p className="text-xs text-graphite leading-relaxed">{st.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Reviewer Guidance & Tiers */}
          <section className="bg-sheet border border-rule rounded-panel p-6 sm:p-10">
            <h2 className="text-xl font-bold text-ink mb-3">
              {content.organisationTab.integrityReportGuidance.heading}
            </h2>
            <p className="text-sm text-graphite leading-relaxed mb-8 max-w-2xl">
              {content.organisationTab.integrityReportGuidance.body}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {content.organisationTab.integrityReportGuidance.tiers.map((t: any, idx: number) => {
                const variant = idx === 0 ? 'clean' : idx === 1 ? 'review' : 'flagged';
                return (
                  <div key={idx} className="p-5 rounded-card border border-rule bg-paper">
                    <div className="mb-3">
                      <StatusChip variant={variant} size="sm">
                        {t.name}
                      </StatusChip>
                    </div>
                    <p className="text-xs text-graphite leading-relaxed">{t.detail}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-rule">
              <span className="text-xs font-bold uppercase tracking-wider text-graphite block mb-4">
                Interactive Report Sample
              </span>
              <IntegrityReportMock />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

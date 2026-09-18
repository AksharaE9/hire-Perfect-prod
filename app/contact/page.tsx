'use client';

import React, { useState } from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { contactContent } from '@/src/content/contact';
import { Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'assessments',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    const topicLabel =
      contactContent.topics.find((t) => t.value === formData.topic)?.label || formData.topic;

    try {
      const res = await fetch('/api/faq-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: `[Contact] ${topicLabel}`,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit message');

      setStatus('success');
      setFormData({ name: '', email: '', topic: 'assessments', message: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || contactContent.errorToast);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-12 md:py-16 w-full">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-signal block mb-2">
              Get in Touch
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight mb-3">
              {contactContent.heading}
            </h1>
            <p className="text-base text-graphite leading-relaxed">
              {contactContent.subhead}
            </p>
          </div>

          <Card className="p-8 sm:p-10 shadow-floating">
            {status === 'success' ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-clean-soft text-clean flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-ink mb-2">Message sent successfully</h2>
                <p className="text-sm text-graphite mb-6 max-w-md mx-auto">
                  Thank you for contacting us. A member of our team will review your inquiry and reply via email.
                </p>
                <Button variant="secondary" onClick={() => setStatus('idle')}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                  <div className="p-4 rounded-card bg-flagged-soft border border-flagged/20 text-xs text-flagged flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <Input
                  label="Your full name"
                  id="name"
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <Input
                  label="Your email address"
                  id="email"
                  type="email"
                  placeholder="e.g. priya@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="topic" className="text-xs font-medium text-ink">
                    Topic
                  </label>
                  <select
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-sheet text-ink text-sm rounded-chip border border-rule-strong px-3.5 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-signal transition-colors cursor-pointer"
                  >
                    {contactContent.topics.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label htmlFor="message" className="text-xs font-medium text-ink">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Tell us about your requirements, questions, or batch sizes..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-sheet text-ink text-sm rounded-chip border border-rule-strong px-3.5 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-signal transition-colors resize-y min-h-[120px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={loading}
                >
                  Send message
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

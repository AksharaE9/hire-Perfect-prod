'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import StatusChip from '@/components/ui/StatusChip';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';
import { FolderGit2, Plus, ExternalLink, AlertCircle, X } from 'lucide-react';

const TECH_OPTIONS = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'FastAPI', 'Django',
  'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'Tailwind CSS',
  'PyTorch', 'TensorFlow', 'OpenAI API', 'Pandas', 'Spark', 'Solidity'
];

export default function ProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    techStack: [] as string[],
    githubLink: '',
    liveLink: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!checkAndClearExpiredSession(router)) return;
    fetchProjects();
  }, [router]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProjects(data.projects || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addTech = (tech: string) => {
    if (!form.techStack.includes(tech)) {
      setForm({ ...form, techStack: [...form.techStack, tech] });
    }
  };

  const removeTech = (tech: string) => {
    setForm({ ...form, techStack: form.techStack.filter((t) => t !== tech) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Project title is required');
    if (!form.description.trim()) return setError('Description is required');
    if (!form.githubLink.trim()) return setError('GitHub link is required');

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setForm({ title: '', description: '', techStack: [], githubLink: '', liveLink: '' });
        fetchProjects();
      } else {
        setError(data.error || 'Submission failed');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading variant="spinner" fullScreen text="Loading projects..." />;

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <Navbar />

      <main id="main-content" className="flex-1 max-w-container mx-auto px-5 sm:px-8 py-10 md:py-14 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-6 pb-6 border-b border-rule">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-signal block mb-1">
              Portfolio
            </span>
            <h1 className="text-3xl font-extrabold text-ink tracking-tight">
              Capstone Projects
            </h1>
            <p className="text-sm text-graphite mt-1 max-w-xl">
              Submit your real-world software applications and data pipelines for reviewer evaluation and portfolio verification.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Close form' : 'Submit project'}
          </Button>
        </div>

        {/* Project Submission Form Panel */}
        {showForm && (
          <Card className="p-6 sm:p-8 mb-12 shadow-floating">
            <h2 className="text-xl font-bold text-ink mb-2">Submit New Project</h2>
            <p className="text-xs text-graphite mb-6">
              Provide project details, source repository, and live deployment link.
            </p>

            {error && (
              <div className="p-3.5 rounded-card bg-flagged-soft border border-flagged/20 text-xs text-flagged flex items-center gap-2 mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Project title"
                id="pTitle"
                placeholder="e.g. Distributed Analytics Engine"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="pDesc" className="text-xs font-medium text-ink">
                  Description & Architecture
                </label>
                <textarea
                  id="pDesc"
                  rows={4}
                  placeholder="Explain problem statement, architecture decisions, and core features..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-sheet text-ink text-sm rounded-chip border border-rule-strong px-3.5 py-2.5 outline-none focus-visible:outline-2 focus-visible:outline-signal"
                  required
                />
              </div>

              {/* Tech Stack Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-ink">Technologies used</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-signal bg-signal-soft px-2.5 py-1 rounded-chip"
                    >
                      <span>{tech}</span>
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="hover:text-ink"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {TECH_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addTech(t)}
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-chip border transition-colors ${
                        form.techStack.includes(t)
                          ? 'bg-signal-soft text-signal border-signal/30'
                          : 'bg-paper text-graphite hover:text-ink border-rule'
                      }`}
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="GitHub repository URL"
                  id="pGithub"
                  type="url"
                  placeholder="https://github.com/..."
                  value={form.githubLink}
                  onChange={(e) => setForm({ ...form, githubLink: e.target.value })}
                  required
                />
                <Input
                  label="Live demo URL (optional)"
                  id="pLive"
                  type="url"
                  placeholder="https://..."
                  value={form.liveLink}
                  onChange={(e) => setForm({ ...form, liveLink: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" isLoading={submitting}>
                  Submit for review
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="p-12 text-center max-w-md mx-auto my-8">
            <FolderGit2 className="w-12 h-12 text-graphite mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-bold text-ink mb-1">No projects submitted yet</h3>
            <p className="text-xs text-graphite mb-6">
              Add your portfolio projects to showcase hands-on development experience.
            </p>
            <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
              Submit your first project
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => {
              const statusVariant =
                proj.status === 'reviewed'
                  ? 'clean'
                  : proj.status === 'under_review'
                  ? 'review'
                  : 'signal';

              return (
                <Card key={proj._id} className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <StatusChip variant={statusVariant} size="sm">
                        {String(proj.status || 'submitted').replace('_', ' ')}
                      </StatusChip>
                    </div>

                    <h3 className="text-base font-bold text-ink mb-2 line-clamp-1">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-graphite leading-relaxed line-clamp-3 mb-4">
                      {proj.description}
                    </p>

                    {proj.techStack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {proj.techStack.map((tech: string) => (
                          <span
                            key={tech}
                            className="text-[10px] text-graphite bg-paper px-2 py-0.5 rounded-chip border border-rule"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-rule flex items-center justify-between gap-3 text-xs">
                    {proj.githubLink && (
                      <a
                        href={proj.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-graphite hover:text-ink transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        <span>Source</span>
                      </a>
                    )}
                    {proj.liveLink && (
                      <a
                        href={proj.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-signal font-semibold hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

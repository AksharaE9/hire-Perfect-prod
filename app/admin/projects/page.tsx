'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const STATUS_STYLES: Record<string, string> = {
    submitted: 'bg-blue-tint text-navy border-info-line',
    under_review: 'bg-warn-bg text-warn border-warn-line',
    reviewed: 'bg-ok-bg text-ok border-ok-line',
};

export default function AdminProjectsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [evalForm, setEvalForm] = useState({ rating: '', feedback: '', status: 'under_review' });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') { router.push('/dashboard'); return; }
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = new URL('/api/projects', window.location.origin);
            if (statusFilter) url.searchParams.set('status', statusFilter);
            const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setProjects(data.projects);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (!loading) fetchProjects(); }, [statusFilter]);

    const openProject = (p: any) => {
        setSelected(p);
        setEvalForm({
            rating: p.rating?.toString() || '',
            feedback: p.feedback || '',
            status: p.status === 'submitted' ? 'under_review' : p.status,
        });
        setSaveMsg('');
    };

    const handleEvaluate = async () => {
        if (!selected) return;
        if (evalForm.rating !== '' && (Number(evalForm.rating) < 1 || Number(evalForm.rating) > 10)) {
            setSaveMsg('Rating must be 1–10');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/projects/${selected._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    rating: evalForm.rating !== '' ? Number(evalForm.rating) : undefined,
                    feedback: evalForm.feedback,
                    status: evalForm.status,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSaveMsg('✓ Evaluation saved');
                setSelected(data.project);
                setProjects(projects.map(p => p._id === data.project._id ? data.project : p));
            } else {
                setSaveMsg(data.error || 'Save failed');
            }
        } catch { setSaveMsg('Network error'); }
        finally { setSaving(false); }
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Projects..." />;

    return (
        <div className="min-h-screen bg-paper text-ink">
            <Navbar />

            <main className="container mx-auto px-6 py-12 lg:py-16 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 bg-blue-tint border border-info-line text-navy text-[11px] font-bold uppercase tracking-wider rounded-lg mb-3">
                            Admin · Portfolio Review
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-navy tracking-tight uppercase">
                            Project Portfolio Review
                        </h1>
                        <p className="text-slate text-sm mt-1">Review candidate projects, evaluate architecture quality, and assign ratings.</p>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="bg-white border border-line-strong rounded-lg px-4 py-2.5 text-xs font-bold text-navy uppercase tracking-wider focus:border-navy outline-none cursor-pointer shadow-sm"
                    >
                        <option value="">All Statuses</option>
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="reviewed">Reviewed</option>
                    </select>
                </div>

                <div className="grid grid-cols-3 gap-5 mb-8">
                    {[
                        { label: 'Total Submitted', value: projects.length },
                        { label: 'Pending Review', value: projects.filter(p => p.status === 'submitted').length },
                        { label: 'Evaluated', value: projects.filter(p => p.status === 'reviewed').length },
                    ].map(({ label, value }) => (
                        <Card key={label} className="p-6 bg-white border border-line shadow-sm rounded-xl text-center">
                            <p className="text-3xl font-black text-navy tabular-nums">{value}</p>
                            <p className="text-xs font-semibold text-slate uppercase tracking-wider mt-1">{label}</p>
                        </Card>
                    ))}
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Project List */}
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden border border-line bg-white shadow-sm rounded-xl">
                            <div className="divide-y divide-line">
                                {projects.map((p) => (
                                    <button
                                        key={p._id}
                                        onClick={() => openProject(p)}
                                        className={`w-full text-left px-5 py-4 hover:bg-mist transition-all ${selected?._id === p._id ? 'bg-blue-tint/50 border-l-4 border-navy' : ''}`}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-bold text-navy truncate pr-2">{p.title}</span>
                                            <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${STATUS_STYLES[p.status] || STATUS_STYLES.submitted}`}>
                                                {p.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate">{p.userId?.name} · {p.userId?.email}</p>
                                        {p.rating !== null && p.rating !== undefined && (
                                            <p className="text-xs font-bold text-navy mt-1 tabular-nums">Rating: {p.rating}/10</p>
                                        )}
                                    </button>
                                ))}
                                {projects.length === 0 && (
                                    <div className="p-12 text-center text-slate text-sm">No projects found.</div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Detail Panel */}
                    <div className="lg:col-span-3">
                        {!selected ? (
                            <Card className="p-16 text-center border-line bg-white shadow-sm rounded-xl">
                                <div className="text-4xl mb-3">🗂️</div>
                                <p className="text-slate text-xs uppercase font-bold tracking-wider">Select a project to review</p>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                                    <h2 className="text-xl font-bold text-navy mb-2">{selected.title}</h2>
                                    <div className="flex items-center gap-2 mb-4 text-xs">
                                        <p className="font-semibold text-ink">{selected.userId?.name}</p>
                                        <span className="text-slate-soft">·</span>
                                        <p className="text-slate">{selected.userId?.email}</p>
                                    </div>
                                    <p className="text-xs text-ink leading-relaxed mb-4">{selected.description}</p>
                                    {selected.techStack?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {selected.techStack.map((t: string) => (
                                                <span key={t} className="px-2 py-0.5 bg-mist border border-line rounded text-[11px] font-medium text-slate uppercase">{t}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex gap-4 mt-4 pt-4 border-t border-line">
                                        {selected.githubLink && (
                                            <a href={selected.githubLink} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-xs font-bold text-navy hover:underline">
                                                GitHub Repository →
                                            </a>
                                        )}
                                        {selected.liveLink && (
                                            <a href={selected.liveLink} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-xs font-bold text-navy hover:underline">
                                                Live Demonstration →
                                            </a>
                                        )}
                                    </div>
                                </Card>

                                {/* Evaluation Form */}
                                <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                                    <p className="text-xs font-bold text-navy uppercase tracking-wider mb-5">
                                        Rate This Project
                                    </p>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-1 block">Rating (1–10)</label>
                                                <input
                                                    type="number" min={1} max={10}
                                                    value={evalForm.rating}
                                                    onChange={e => setEvalForm({ ...evalForm, rating: e.target.value })}
                                                    className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none"
                                                    placeholder="1–10"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-1 block">Status</label>
                                                <select
                                                    value={evalForm.status}
                                                    onChange={e => setEvalForm({ ...evalForm, status: e.target.value })}
                                                    className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none cursor-pointer"
                                                >
                                                    <option value="under_review">Under Review</option>
                                                    <option value="reviewed">Reviewed</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-1 block">Reviewer Feedback</label>
                                            <textarea
                                                value={evalForm.feedback}
                                                onChange={e => setEvalForm({ ...evalForm, feedback: e.target.value })}
                                                className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none resize-none"
                                                rows={3}
                                                placeholder="Share your evaluation of project quality, architecture, and documentation..."
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 pt-2">
                                            <Button
                                                variant="primary"
                                                className="py-2.5 px-6 bg-navy hover:bg-navy-2 text-white border-none shadow-sm text-xs font-bold"
                                                onClick={handleEvaluate}
                                                disabled={saving}
                                            >
                                                {saving ? 'Saving...' : 'Save Rating'}
                                            </Button>
                                            {saveMsg && (
                                                <span className={`text-xs font-bold ${saveMsg.startsWith('✓') ? 'text-ok' : 'text-danger'}`}>
                                                    {saveMsg}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-mist text-slate border-line',
    under_review: 'bg-warn-bg text-warn border-warn-line',
    approved: 'bg-ok-bg text-ok border-ok-line',
    rejected: 'bg-danger-bg text-danger border-danger-line',
    needs_improvement: 'bg-warn-bg text-warn border-warn-line',
};

const LANG_ICONS: Record<string, string> = {
    javascript: 'JS',
    typescript: 'TS',
    python: 'PY',
    java: 'JAVA',
    cpp: 'C++',
};

export default function AdminSubmissionsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [selected, setSelected] = useState<any>(null);
    const [filter, setFilter] = useState({ status: '', challengeId: '' });
    const [evalForm, setEvalForm] = useState({ score: '', feedback: '', status: 'approved' });
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') { router.push('/dashboard'); return; }
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = new URL('/api/coding-submissions', window.location.origin);
            if (filter.status) url.searchParams.set('status', filter.status);
            const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSubmissions(data.submissions);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!loading) fetchSubmissions();
    }, [filter.status]);

    const openSubmission = (s: any) => {
        setSelected(s);
        setEvalForm({
            score: s.score?.toString() || '',
            feedback: s.feedback || '',
            status: s.status === 'pending' ? 'under_review' : s.status,
        });
        setSaveMsg('');
    };

    const handleEvaluate = async () => {
        if (!selected) return;
        if (evalForm.score !== '' && (Number(evalForm.score) < 0 || Number(evalForm.score) > 100)) {
            setSaveMsg('Score must be 0–100');
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/coding-submissions/${selected._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    score: evalForm.score !== '' ? Number(evalForm.score) : undefined,
                    feedback: evalForm.feedback,
                    status: evalForm.status,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSaveMsg('✓ Evaluation saved');
                setSelected(data.submission);
                setSubmissions(submissions.map(s => s._id === data.submission._id ? data.submission : s));
            } else {
                setSaveMsg(data.error || 'Save failed');
            }
        } catch { setSaveMsg('Network error'); }
        finally { setSaving(false); }
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Submissions..." />;

    return (
        <div className="min-h-screen bg-paper text-ink">
            <Navbar />

            <main className="container mx-auto px-6 py-12 lg:py-16 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 bg-blue-tint border border-info-line text-navy text-[11px] font-bold uppercase tracking-wider rounded-lg mb-3">
                            Admin · Code Review
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-navy tracking-tight uppercase">
                            Code Submissions
                        </h1>
                        <p className="text-slate text-sm mt-1">Audit, score, and provide feedback on candidate coding submissions.</p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={filter.status}
                            onChange={e => setFilter({ ...filter, status: e.target.value })}
                            className="bg-white border border-line-strong rounded-lg px-4 py-2.5 text-xs font-bold text-navy uppercase tracking-wider focus:border-navy outline-none cursor-pointer shadow-sm"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="under_review">Under Review</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="needs_improvement">Needs Improvement</option>
                        </select>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-5 gap-4 mb-8">
                    {[
                        { label: 'Total', value: submissions.length },
                        { label: 'Pending', value: submissions.filter(s => s.status === 'pending').length },
                        { label: 'Approved', value: submissions.filter(s => s.status === 'approved').length },
                        { label: 'Rejected', value: submissions.filter(s => s.status === 'rejected').length },
                        { label: 'Avg Score', value: (() => {
                            const scored = submissions.filter(s => s.score !== null && s.score !== undefined);
                            return scored.length ? Math.round(scored.reduce((a, s) => a + s.score, 0) / scored.length) : '--';
                        })() },
                    ].map(({ label, value }) => (
                        <Card key={label} className="p-4 bg-white border border-line shadow-sm rounded-xl text-center">
                            <p className="text-2xl font-black text-navy tabular-nums">{value}</p>
                            <p className="text-[11px] font-semibold text-slate uppercase tracking-wider mt-1">{label}</p>
                        </Card>
                    ))}
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Submissions List */}
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden border border-line bg-white shadow-sm rounded-xl">
                            <div className="divide-y divide-line">
                                {submissions.map((s) => (
                                    <button
                                        key={s._id}
                                        onClick={() => openSubmission(s)}
                                        className={`w-full text-left px-5 py-4 hover:bg-mist transition-all group ${selected?._id === s._id ? 'bg-blue-tint/50 border-l-4 border-navy' : ''}`}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-bold text-navy truncate pr-2">
                                                {s.userId?.name || 'Unknown Candidate'}
                                            </span>
                                            <span className={`shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${STATUS_STYLES[s.status] || STATUS_STYLES.pending}`}>
                                                {s.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate truncate">
                                            {s.challengeId?.title || 'Unknown Challenge'}
                                        </p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[11px] font-semibold text-slate uppercase bg-mist px-2 py-0.5 rounded border border-line">
                                                {LANG_ICONS[s.language] || s.language}
                                            </span>
                                            {s.score !== null && s.score !== undefined && (
                                                <span className="text-xs font-bold text-ok tabular-nums">Score: {s.score}/100</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                                {submissions.length === 0 && (
                                    <div className="p-12 text-center text-slate text-sm">No submissions found.</div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Detail Panel */}
                    <div className="lg:col-span-3">
                        {!selected ? (
                            <Card className="p-16 text-center border-line bg-white shadow-sm rounded-xl">
                                <div className="text-4xl mb-3">👈</div>
                                <p className="text-slate text-xs uppercase font-bold tracking-wider">Select a submission to review</p>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {/* Candidate & Challenge Info */}
                                <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-[11px] font-bold text-slate uppercase tracking-wider">Candidate</p>
                                            <p className="text-base font-bold text-navy">{selected.userId?.name}</p>
                                            <p className="text-xs text-slate">{selected.userId?.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-bold text-slate uppercase tracking-wider">Challenge</p>
                                            <p className="text-sm font-bold text-navy">{selected.challengeId?.title}</p>
                                            <span className="text-xs text-slate font-medium uppercase">{selected.language}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-soft">Submitted on: {new Date(selected.createdAt).toLocaleString()}</p>
                                </Card>

                                {/* Code */}
                                <Card className="bg-white border border-line shadow-sm rounded-xl overflow-hidden">
                                    <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-table-head-bg">
                                        <span className="text-xs font-bold text-navy uppercase tracking-wider">
                                            Submitted Solution ({selected.language})
                                        </span>
                                    </div>
                                    <pre className="p-5 text-xs text-code-ink font-mono bg-code-bg overflow-x-auto whitespace-pre-wrap break-words max-h-80 overflow-y-auto">
                                        {selected.code}
                                    </pre>
                                </Card>

                                {/* Explanation */}
                                {selected.explanation && (
                                    <Card className="p-5 bg-white border border-line shadow-sm rounded-xl">
                                        <p className="text-xs font-bold text-navy uppercase tracking-wider mb-2">
                                            Candidate Explanation
                                        </p>
                                        <p className="text-xs text-ink leading-relaxed">{selected.explanation}</p>
                                    </Card>
                                )}

                                {/* Evaluation Form */}
                                <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                                    <p className="text-xs font-bold text-navy uppercase tracking-wider mb-5">
                                        Evaluate Solution
                                    </p>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-1 block">Score (0–100)</label>
                                                <input
                                                    type="number"
                                                    min={0} max={100}
                                                    value={evalForm.score}
                                                    onChange={e => setEvalForm({ ...evalForm, score: e.target.value })}
                                                    className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none"
                                                    placeholder="0–100"
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
                                                    <option value="approved">Approved</option>
                                                    <option value="rejected">Rejected</option>
                                                    <option value="needs_improvement">Needs Improvement</option>
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
                                                placeholder="Provide constructive feedback on the solution..."
                                            />
                                        </div>

                                        <div className="flex items-center gap-3 pt-2">
                                            <Button
                                                variant="primary"
                                                className="py-2.5 px-6 bg-navy hover:bg-navy-2 text-white border-none shadow-sm text-xs font-bold"
                                                onClick={handleEvaluate}
                                                disabled={saving}
                                            >
                                                {saving ? 'Saving...' : 'Save Evaluation'}
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

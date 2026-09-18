'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const DIFFICULTY_MAP: Record<string, string> = {
    easy: 'text-ok bg-ok-bg border-ok-line',
    medium: 'text-warn bg-warn-bg border-warn-line',
    hard: 'text-danger bg-danger-bg border-danger-line',
};

const STARTER: Record<string, string> = {
    javascript: '// JavaScript starter\nfunction solution(input) {\n  // your code here\n}',
    python: '# Python starter\ndef solution(input):\n    pass',
    java: '// Java starter\npublic class Solution {\n    public static void main(String[] args) {\n        // your code here\n    }\n}',
    cpp: '// C++ starter\n#include<bits/stdc++.h>\nusing namespace std;\nint main() {\n    // your code here\n    return 0;\n}',
    typescript: '// TypeScript starter\nfunction solution(input: string): string {\n    return "";\n}',
};

export default function AdminChallengesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [challenges, setChallenges] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        difficulty: 'medium',
        constraints: '',
        tags: [] as string[],
        examples: [{ input: '', output: '', explanation: '' }],
        starterCode: { ...STARTER },
    });
    const [tagInput, setTagInput] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') { router.push('/dashboard'); return; }
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/coding-challenges', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setChallenges(data.challenges);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const openCreate = () => {
        setEditing(null);
        setForm({
            title: '',
            description: '',
            difficulty: 'medium',
            constraints: '',
            tags: [],
            examples: [{ input: '', output: '', explanation: '' }],
            starterCode: { ...STARTER },
        });
        setShowForm(true);
        setError('');
    };

    const addTag = () => {
        if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
            setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
            setTagInput('');
        }
    };

    const addExample = () => {
        setForm({ ...form, examples: [...form.examples, { input: '', output: '', explanation: '' }] });
    };

    const updateExample = (i: number, field: string, val: string) => {
        const exs = [...form.examples];
        exs[i] = { ...exs[i], [field]: val };
        setForm({ ...form, examples: exs });
    };

    const handleSubmit = async () => {
        setError('');
        if (!form.title.trim()) return setError('Title is required');
        if (!form.description.trim()) return setError('Description is required');

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/coding-challenges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setShowForm(false);
                fetchChallenges();
            } else {
                setError(data.error || 'Failed to create');
            }
        } catch { setError('Network error'); }
        finally { setSubmitting(false); }
    };

    const handleArchive = async (id: string) => {
        if (!confirm('Archive this challenge?')) return;
        const token = localStorage.getItem('token');
        await fetch(`/api/coding-challenges/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchChallenges();
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Challenges..." />;

    return (
        <div className="min-h-screen bg-paper text-ink">
            <Navbar />

            <main className="container mx-auto px-6 py-12 lg:py-16 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 bg-blue-tint border border-info-line text-navy text-[11px] font-bold uppercase tracking-wider rounded-lg mb-3">
                            Admin · Challenge Control
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-navy tracking-tight uppercase">
                            Coding Challenges
                        </h1>
                        <p className="text-sm text-slate mt-1">Manage interactive programming problems and assessment testbeds.</p>
                    </div>
                    <Button
                        variant="primary"
                        className="px-6 py-3 text-xs font-bold bg-navy hover:bg-navy-2 text-white border-none shadow-sm rounded-lg"
                        onClick={openCreate}
                    >
                        + New Challenge
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-5 mb-8">
                    {[
                        { label: 'Total Challenges', value: challenges.length, icon: '⚡' },
                        { label: 'Easy Problems', value: challenges.filter(c => c.difficulty === 'easy').length, icon: '🟢' },
                        { label: 'Hard Problems', value: challenges.filter(c => c.difficulty === 'hard').length, icon: '🔴' },
                    ].map(({ label, value, icon }) => (
                        <Card key={label} className="p-6 bg-white border border-line shadow-sm rounded-xl text-center">
                            <div className="text-2xl mb-2">{icon}</div>
                            <p className="text-3xl font-black text-navy tabular-nums">{value}</p>
                            <p className="text-xs font-semibold text-slate uppercase tracking-wider mt-1">{label}</p>
                        </Card>
                    ))}
                </div>

                {/* Challenges Table */}
                <Card className="overflow-hidden border border-line bg-white shadow-sm rounded-xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-table-head-bg border-b border-table-rule">
                                <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider">Challenge</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider">Difficulty</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider">Tags</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-table-rule">
                            {challenges.map((c, idx) => (
                                <tr key={c._id} className={`group hover:bg-table-row-hover transition-colors ${idx % 2 === 1 ? 'bg-table-row-alt' : 'bg-white'}`}>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-navy">{c.title}</p>
                                        <p className="text-xs text-slate mt-0.5 line-clamp-1">{c.description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded border ${DIFFICULTY_MAP[c.difficulty] || 'text-slate bg-mist border-line'}`}>
                                            {c.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {c.tags?.slice(0, 3).map((t: string) => (
                                                <span key={t} className="px-2 py-0.5 bg-mist border border-line rounded text-[10px] font-medium text-slate uppercase">{t}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleArchive(c._id)}
                                            className="px-3 py-1.5 rounded-lg bg-danger-bg border border-danger-line text-danger text-xs font-bold hover:bg-danger hover:text-white transition-all"
                                        >
                                            Archive
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {challenges.length === 0 && (
                        <div className="p-16 text-center">
                            <p className="text-slate text-sm">No challenges created yet.</p>
                        </div>
                    )}
                </Card>
            </main>

            {/* Create Challenge Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center p-6 bg-navy/45 backdrop-blur-sm overflow-y-auto">
                    <Card className="w-full max-w-3xl my-8 bg-white border border-line shadow-lg rounded-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-line bg-paper">
                            <h2 className="text-xl font-bold text-navy">Create Coding Challenge</h2>
                            <button onClick={() => setShowForm(false)} className="text-slate hover:text-navy text-lg font-bold">✕</button>
                        </div>
                        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1.5 block">Title *</label>
                                    <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                        className="w-full bg-white border border-line-strong rounded-lg px-4 py-2.5 text-sm text-ink focus:border-navy outline-none"
                                        placeholder="e.g. Two Sum, Binary Search..." />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1.5 block">Difficulty</label>
                                    <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                                        className="w-full bg-white border border-line-strong rounded-lg px-4 py-2.5 text-sm text-ink focus:border-navy outline-none cursor-pointer">
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1.5 block">Tags</label>
                                    <div className="flex gap-2">
                                        <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()}
                                            className="flex-1 bg-white border border-line-strong rounded-lg px-3 py-2.5 text-sm text-ink focus:border-navy outline-none"
                                            placeholder="Array, DP..." />
                                        <button onClick={addTag} className="px-3 rounded-lg bg-mist border border-line text-navy text-sm font-bold hover:bg-sunken">+</button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {form.tags.map(t => (
                                            <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-blue-tint border border-info-line rounded text-xs font-semibold text-navy">
                                                {t} <button onClick={() => setForm({ ...form, tags: form.tags.filter(x => x !== t) })} className="text-slate hover:text-danger">×</button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1.5 block">Description *</label>
                                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full bg-white border border-line-strong rounded-lg px-4 py-2.5 text-sm text-ink focus:border-navy outline-none resize-none"
                                    rows={4} placeholder="Describe the problem clearly..." />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1.5 block">Constraints</label>
                                <textarea value={form.constraints} onChange={e => setForm({ ...form, constraints: e.target.value })}
                                    className="w-full bg-paper border border-line-strong rounded-lg px-4 py-2.5 text-sm text-code-ink font-mono focus:border-navy outline-none resize-none"
                                    rows={3} placeholder="1 <= n <= 10^5&#10;-10^9 <= nums[i] <= 10^9" />
                            </div>

                            {/* Examples */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider">Examples</label>
                                    <button onClick={addExample} className="text-xs font-bold text-navy hover:underline">+ Add Example</button>
                                </div>
                                <div className="space-y-3">
                                    {form.examples.map((ex, i) => (
                                        <div key={i} className="p-4 bg-paper rounded-xl border border-line space-y-2.5">
                                            <p className="text-[11px] font-bold text-slate uppercase">Example {i + 1}</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input value={ex.input} onChange={e => updateExample(i, 'input', e.target.value)}
                                                    className="bg-white border border-line rounded-lg px-3 py-2 text-xs text-ink font-mono focus:border-navy outline-none"
                                                    placeholder="Input: [1,2,3]" />
                                                <input value={ex.output} onChange={e => updateExample(i, 'output', e.target.value)}
                                                    className="bg-white border border-line rounded-lg px-3 py-2 text-xs text-ink font-mono focus:border-navy outline-none"
                                                    placeholder="Output: 6" />
                                            </div>
                                            <input value={ex.explanation} onChange={e => updateExample(i, 'explanation', e.target.value)}
                                                className="w-full bg-white border border-line rounded-lg px-3 py-2 text-xs text-ink focus:border-navy outline-none"
                                                placeholder="Explanation (optional)" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="px-4 py-3 rounded-lg bg-danger-bg border border-danger-line text-danger text-xs font-bold">⚠ {error}</div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" className="flex-1 border-line text-slate hover:bg-mist" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button variant="primary" className="flex-1 bg-navy hover:bg-navy-2 text-white border-none shadow-sm" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? 'Creating...' : 'Create Challenge'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

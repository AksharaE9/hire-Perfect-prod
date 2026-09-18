'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript', icon: 'JS' },
    { value: 'typescript', label: 'TypeScript', icon: 'TS' },
    { value: 'python', label: 'Python', icon: 'PY' },
    { value: 'java', label: 'Java', icon: 'JAVA' },
    { value: 'cpp', label: 'C++', icon: 'C++' },
];

const DIFFICULTY_COLOR: Record<string, string> = {
    easy: 'text-ok bg-ok-bg border-ok-line',
    medium: 'text-warn bg-warn-bg border-warn-line',
    hard: 'text-danger bg-danger-bg border-danger-line',
};

export default function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [challenge, setChallenge] = useState<any>(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [explanation, setExplanation] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [existingSubmissions, setExistingSubmissions] = useState<any[]>([]);

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        fetchChallenge();
        fetchMySubmissions();
    }, [id]);

    const fetchChallenge = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/coding-challenges/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setChallenge(data.challenge);
                if (data.challenge.starterCode?.[language]) {
                    setCode(data.challenge.starterCode[language]);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchMySubmissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/coding-submissions?challengeId=${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setExistingSubmissions(data.submissions);
        } catch (e) { /* ignore */ }
    };

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        if (challenge?.starterCode?.[lang]) {
            setCode(challenge.starterCode[lang]);
        }
    };

    const handleSubmit = async () => {
        setError('');
        if (!code.trim()) return setError('Please write your code solution');
        if (!explanation.trim() || explanation.length < 10)
            return setError('Please explain your approach (min. 10 characters)');

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/coding-submissions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ challengeId: id, code, language, explanation }),
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                fetchMySubmissions();
            } else {
                setError(data.error || 'Submission failed');
            }
        } catch (e) {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Challenge..." />;
    if (!challenge) return (
        <div className="min-h-screen bg-paper flex items-center justify-center">
            <p className="text-navy font-bold">Challenge not found</p>
        </div>
    );

    const diffClass = DIFFICULTY_COLOR[challenge.difficulty] || DIFFICULTY_COLOR.medium;

    return (
        <div className="min-h-screen bg-paper text-ink">
            <Navbar />

            <main className="container mx-auto px-6 py-12 lg:py-16 page-container relative z-10">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Challenge Description */}
                    <div className="space-y-6">
                        <div>
                            <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border rounded-md mb-3 ${diffClass}`}>
                                {challenge.difficulty}
                            </span>
                            <h1 className="text-3xl font-black text-navy uppercase tracking-tight leading-tight mb-3">
                                {challenge.title}
                            </h1>
                            {challenge.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {challenge.tags.map((t: string) => (
                                        <span key={t} className="px-2 py-0.5 bg-mist border border-line rounded text-[11px] font-medium text-slate uppercase">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                            <h2 className="text-xs font-bold text-navy uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-3.5 bg-navy rounded-full" />
                                Problem Statement
                            </h2>
                            <p className="text-ink leading-relaxed text-sm whitespace-pre-wrap">
                                {challenge.description}
                            </p>
                        </Card>

                        {challenge.constraints && (
                            <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                                <h2 className="text-xs font-bold text-warn uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-3.5 bg-warn rounded-full" />
                                    Constraints
                                </h2>
                                <p className="text-code-ink bg-code-bg p-3 rounded-lg leading-relaxed text-xs whitespace-pre-wrap font-mono border border-line">
                                    {challenge.constraints}
                                </p>
                            </Card>
                        )}

                        {challenge.examples?.length > 0 && (
                            <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                                <h2 className="text-xs font-bold text-navy uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="w-1.5 h-3.5 bg-navy rounded-full" />
                                    Test Cases & Examples
                                </h2>
                                <div className="space-y-4">
                                    {challenge.examples.map((ex: any, i: number) => (
                                        <div key={i} className="space-y-2">
                                            <p className="text-[11px] font-bold text-slate uppercase">Example {i + 1}</p>
                                            <div className="bg-paper rounded-lg p-3.5 border border-line font-mono text-xs">
                                                <p className="text-slate">Input: <span className="text-ink font-semibold">{ex.input}</span></p>
                                                <p className="text-slate mt-1">Output: <span className="text-ok font-semibold">{ex.output}</span></p>
                                            </div>
                                            {ex.explanation && (
                                                <p className="text-xs text-slate italic">{ex.explanation}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Previous submissions */}
                        {existingSubmissions.length > 0 && (
                            <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                                <h2 className="text-xs font-bold text-navy uppercase tracking-wider mb-4">
                                    Your Submissions ({existingSubmissions.length})
                                </h2>
                                <div className="space-y-2.5">
                                    {existingSubmissions.map((s: any) => (
                                        <div key={s._id} className="flex items-center justify-between p-3 bg-paper rounded-lg border border-line">
                                            <div>
                                                <span className="text-xs font-bold text-navy uppercase">{s.language}</span>
                                                <p className="text-[11px] text-slate mt-0.5">{new Date(s.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {s.score !== null && s.score !== undefined && (
                                                    <span className="text-xs font-bold text-ok tabular-nums">Score: {s.score}/100</span>
                                                )}
                                                <StatusBadge status={s.status} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right: Code Submission */}
                    <div className="space-y-6">
                        {submitted ? (
                            <Card className="p-10 text-center bg-white border border-ok-line shadow-sm rounded-xl">
                                <div className="w-14 h-14 rounded-full bg-ok-bg border border-ok-line flex items-center justify-center text-2xl mx-auto mb-4 text-ok">
                                    ✓
                                </div>
                                <h2 className="text-xl font-bold text-navy mb-2">
                                    Solution Submitted Successfully!
                                </h2>
                                <p className="text-slate text-sm mb-6">Your code solution is under evaluation. Check back soon for audit review.</p>
                                <div className="flex gap-3 justify-center">
                                    <Button variant="outline" className="border-line text-slate hover:bg-mist text-xs" onClick={() => setSubmitted(false)}>
                                        Submit Another
                                    </Button>
                                    <Button variant="primary" className="bg-navy hover:bg-navy-2 text-white border-none text-xs" onClick={() => router.push('/coding')}>
                                        More Challenges
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <>
                                {/* Language Selector */}
                                <Card className="p-5 bg-white border border-line shadow-sm rounded-xl">
                                    <p className="text-xs font-bold text-navy uppercase tracking-wider mb-3">Select Language</p>
                                    <div className="flex flex-wrap gap-2">
                                        {LANGUAGES.map((lang) => (
                                            <button
                                                key={lang.value}
                                                onClick={() => handleLanguageChange(lang.value)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${language === lang.value
                                                    ? 'bg-blue-tint border-info-line text-navy font-bold'
                                                    : 'bg-paper border-line text-slate hover:text-navy hover:bg-mist'
                                                    }`}
                                            >
                                                {lang.icon} {lang.label}
                                            </button>
                                        ))}
                                    </div>
                                </Card>

                                {/* Code Editor */}
                                <Card className="bg-white border border-line shadow-sm rounded-xl overflow-hidden">
                                    <div className="flex items-center justify-between px-5 py-3 border-b border-line bg-table-head-bg">
                                        <span className="text-xs font-bold text-navy uppercase tracking-wider">
                                            solution.{language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language === 'java' ? 'java' : 'cpp'}
                                        </span>
                                        <span className="text-[11px] font-semibold text-slate">
                                            {code.split('\n').length} lines
                                        </span>
                                    </div>
                                    <textarea
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="// Write your solution here..."
                                        className="w-full bg-code-bg text-code-ink font-mono text-xs p-5 outline-none resize-none"
                                        style={{ minHeight: '300px', lineHeight: '1.7' }}
                                        spellCheck={false}
                                    />
                                </Card>

                                {/* Explanation */}
                                <Card className="bg-white border border-line shadow-sm rounded-xl overflow-hidden">
                                    <div className="px-5 py-3 border-b border-line flex items-center justify-between">
                                        <p className="text-xs font-bold text-navy uppercase tracking-wider">
                                            Algorithm Explanation <span className="text-danger">*</span>
                                        </p>
                                        <p className={`text-[10px] font-semibold ${explanation.length < 10 ? 'text-slate-soft' : 'text-ok'}`}>
                                            {explanation.length} / min. 10 chars
                                        </p>
                                    </div>
                                    <textarea
                                        value={explanation}
                                        onChange={(e) => setExplanation(e.target.value)}
                                        placeholder="Describe your algorithm, time complexity, and edge cases handled..."
                                        className="w-full bg-white text-ink text-xs p-4 outline-none resize-none"
                                        style={{ minHeight: '110px', lineHeight: '1.6' }}
                                    />
                                </Card>

                                {error && (
                                    <div className="px-4 py-2.5 rounded-lg bg-danger-bg border border-danger-line text-danger text-xs font-bold">
                                        ⚠ {error}
                                    </div>
                                )}

                                <Button
                                    variant="primary"
                                    className="w-full py-3 text-xs font-bold uppercase tracking-wider bg-navy hover:bg-navy-2 text-white border-none shadow-sm rounded-lg"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting Solution...' : 'Submit Solution'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        pending: 'bg-mist text-slate border-line',
        under_review: 'bg-warn-bg text-warn border-warn-line',
        approved: 'bg-ok-bg text-ok border-ok-line',
        rejected: 'bg-danger-bg text-danger border-danger-line',
        needs_improvement: 'bg-warn-bg text-warn border-warn-line',
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${map[status] || map.pending}`}>
            {status ? status.replace('_', ' ') : 'pending'}
        </span>
    );
}

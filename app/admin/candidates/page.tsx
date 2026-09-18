'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const STATUS_COLORS: Record<string, string> = {
    'Not Attempted': 'bg-mist text-slate border-line',
    'In Progress': 'bg-blue-tint text-navy border-info-line',
    'Submitted': 'bg-blue-tint text-navy border-info-line',
    'Under Review': 'bg-warn-bg text-warn border-warn-line',
    'Evaluated': 'bg-ok-bg text-ok border-ok-line',
};

export default function AdminCandidatesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<Record<string, any>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingProfiles, setLoadingProfiles] = useState(false);

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') { router.push('/dashboard'); return; }
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/users?role=candidate', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                const candidateList = data.users.filter((u: any) => u.role === 'candidate');
                setCandidates(candidateList);
                loadProfiles(candidateList.slice(0, 10), token as string);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const loadProfiles = async (users: any[], token: string) => {
        setLoadingProfiles(true);
        const results: Record<string, any> = {};
        await Promise.allSettled(
            users.map(async (u) => {
                try {
                    const res = await fetch(`/api/profile/${u._id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await res.json();
                    if (data.success) results[u._id] = data.profile;
                } catch { /* ignore */ }
            })
        );
        setProfiles(prev => ({ ...prev, ...results }));
        setLoadingProfiles(false);
    };

    const filtered = candidates.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Candidates..." />;

    return (
        <div className="min-h-screen bg-paper text-ink">
            <Navbar />

            <main className="container mx-auto px-6 py-12 lg:py-16 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 bg-blue-tint border border-info-line text-navy text-[11px] font-bold uppercase tracking-wider rounded-lg mb-3">
                            Candidate Directory
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-navy tracking-tight uppercase">
                            Candidate Profiles
                        </h1>
                        <p className="text-slate text-sm mt-1 max-w-lg">View unified candidate profiles with MCQ scores, coding submissions, and project ratings.</p>
                    </div>
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search candidates..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-white border border-line-strong rounded-lg px-4 py-2.5 text-xs text-ink focus:border-navy outline-none shadow-sm transition-all w-full md:w-80"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <Card className="p-5 bg-white border border-line shadow-sm rounded-xl text-center">
                        <p className="text-3xl font-black text-navy tabular-nums">{candidates.length}</p>
                        <p className="text-[11px] font-semibold text-slate uppercase tracking-wider mt-1">Total Candidates</p>
                    </Card>
                    {['Evaluated', 'Under Review', 'Not Attempted'].map(status => (
                        <Card key={status} className="p-5 bg-white border border-line shadow-sm rounded-xl text-center">
                            <p className="text-3xl font-black text-navy tabular-nums">
                                {Object.values(profiles).filter((p: any) => p.candidateStatus === status).length}
                            </p>
                            <p className="text-[11px] font-semibold text-slate uppercase tracking-wider mt-1">{status}</p>
                        </Card>
                    ))}
                </div>

                {/* Candidate Cards Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((candidate) => {
                        const profile = profiles[candidate._id];
                        return (
                            <Link key={candidate._id} href={`/profile/${candidate._id}`}>
                                <Card className="p-6 group hover:border-navy transition-all duration-200 bg-white border border-line shadow-sm rounded-xl cursor-pointer h-full flex flex-col">
                                    {/* Header */}
                                    <div className="flex items-center gap-3.5 mb-5">
                                        <div className="w-11 h-11 rounded-lg bg-blue-tint border border-info-line flex items-center justify-center text-lg font-bold text-navy">
                                            {candidate.name?.[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-navy truncate">{candidate.name}</p>
                                            <p className="text-xs text-slate truncate">{candidate.email}</p>
                                        </div>
                                    </div>

                                    {profile ? (
                                        <>
                                            {/* Status */}
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${STATUS_COLORS[profile.candidateStatus] || STATUS_COLORS['Not Attempted']}`}>
                                                    {profile.candidateStatus}
                                                </span>
                                                <div className="text-right">
                                                    <span className="text-xl font-bold text-navy tabular-nums">{Math.round(profile.overallScore)}</span>
                                                    <span className="text-xs text-slate ml-0.5">/100</span>
                                                </div>
                                            </div>

                                            {/* Score bars */}
                                            <div className="space-y-2 mb-4">
                                                {[
                                                    { label: 'MCQ', value: profile.mcq?.score || 0, color: 'bg-navy' },
                                                    { label: 'Code', value: profile.coding?.score || 0, color: 'bg-ok' },
                                                    { label: 'Projects', value: profile.projects?.score || 0, color: 'bg-info' },
                                                ].map(({ label, value, color }) => (
                                                    <div key={label}>
                                                        <div className="flex justify-between text-[10px] font-semibold uppercase text-slate mb-1">
                                                            <span>{label}</span>
                                                            <span className="tabular-nums">{Number(value).toFixed(0)}</span>
                                                        </div>
                                                        <div className="h-1.5 bg-sunken rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Skills preview */}
                                            {profile.skills?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-4">
                                                    {profile.skills.slice(0, 4).map((us: any) => (
                                                        <span key={us._id} className="px-2 py-0.5 bg-mist border border-line rounded text-[10px] font-medium text-slate uppercase">
                                                            {us.skillId?.name} {us.rating}/10
                                                        </span>
                                                    ))}
                                                    {profile.skills.length > 4 && (
                                                        <span className="px-2 py-0.5 bg-mist rounded text-[10px] text-slate-soft">+{profile.skills.length - 4}</span>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center py-6">
                                            <p className="text-xs text-slate-soft">
                                                {loadingProfiles ? 'Loading metrics...' : 'No diagnostic data yet'}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-line flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate group-hover:text-navy transition-colors">View Complete Profile</span>
                                        <span className="text-xs font-bold text-navy">→</span>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {filtered.length === 0 && (
                    <Card className="p-16 text-center border-line bg-white shadow-sm rounded-xl">
                        <div className="text-4xl mb-3">👥</div>
                        <p className="text-slate text-sm font-semibold">No candidates match your search.</p>
                    </Card>
                )}
            </main>
        </div>
    );
}

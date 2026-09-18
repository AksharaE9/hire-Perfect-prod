'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [attempts, setAttempts] = useState<any[]>([]);

    const [logs, setLogs] = useState<any[]>([]);
    const [isLogsOpen, setIsLogsOpen] = useState(false);

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [statsRes, attemptsRes] = await Promise.all([
                fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/attempts', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const statsData = await statsRes.json();
            const attemptsData = await attemptsRes.json();

            if (statsData.success) setStats(statsData.stats);
            if (attemptsData.success) setAttempts(attemptsData.attempts);
        } catch (error) {
            console.error('Failed to load admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setLogs(data.logs);
            setIsLogsOpen(true);
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        }
    };

    if (loading) return <Loading variant="spinner" fullScreen text="Loading admin telemetry..." />;

    return (
        <div className="min-h-screen bg-paper text-ink relative">
            <Navbar />

            <main className="container mx-auto px-6 py-12 lg:py-16 page-container relative z-10">
                {/* Header Context */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 bg-blue-tint border border-info-line text-navy text-[11px] font-bold uppercase tracking-wider rounded-lg mb-3">
                            Platform Command Center
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-navy tracking-tight uppercase">
                            Admin Telemetry
                        </h1>
                        <p className="text-base text-slate font-medium mt-2 max-w-lg">
                            High-precision overview of candidate performance, revenue acquisition, and session integrity.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link href="/admin/candidates">
                            <Button variant="outline" className="px-4 py-2.5 text-xs font-bold border-line hover:border-line-strong text-ink hover:bg-mist">
                                Profiles
                            </Button>
                        </Link>
                        <Link href="/admin/challenges">
                            <Button variant="outline" className="px-4 py-2.5 text-xs font-bold border-line hover:border-line-strong text-ink hover:bg-mist">
                                Challenges
                            </Button>
                        </Link>
                        <Link href="/admin/submissions">
                            <Button variant="outline" className="px-4 py-2.5 text-xs font-bold border-line hover:border-line-strong text-ink hover:bg-mist">
                                Code
                            </Button>
                        </Link>
                        <Link href="/admin/projects">
                            <Button variant="outline" className="px-4 py-2.5 text-xs font-bold border-line hover:border-line-strong text-ink hover:bg-mist">
                                Projects
                            </Button>
                        </Link>
                        <Link href="/admin/skills">
                            <Button variant="outline" className="px-4 py-2.5 text-xs font-bold border-line hover:border-line-strong text-ink hover:bg-mist">
                                Skills
                            </Button>
                        </Link>
                        <Button variant="primary" className="px-5 py-2.5 text-xs font-bold bg-navy hover:bg-navy-2 text-white border-none rounded-lg" onClick={loadData}>Refresh</Button>
                    </div>
                </div>

                {/* Analytical Bento */}
                <div className="grid md:grid-cols-4 gap-5 mb-10">
                    <StatCard title="Gross Revenue" value={`₹${stats?.totalRevenue || 0}`} trend="+12.4%" subtitle="Cumulative platform revenue" icon="💰" />
                    <StatCard title="Active Deployments" value={stats?.totalAttempts || 0} trend="+8.2%" subtitle="Unique session starts" icon="⚡" />
                    <StatCard title="Accuracy Mean" value={`${stats?.averageScore || 0}%`} trend="-1.1%" subtitle="Global performance mean" icon="🎯" />
                    <StatCard title="Protocol Breach" value={stats?.totalViolations || 0} trend="Nominal" subtitle="GuardEye proctor alerts" icon="🛡️" />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Live Operations Feed */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-navy flex items-center gap-2.5">
                                Live Operations
                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-ok-bg rounded-full border border-ok-line">
                                    <span className="w-1.5 h-1.5 bg-ok rounded-full animate-pulse"></span>
                                    <span className="text-[10px] font-bold text-ok uppercase tracking-wider">Active</span>
                                </span>
                            </h2>
                            <span className="text-xs font-semibold text-slate">{attempts.length} Deployments</span>
                        </div>

                        <Card className="overflow-hidden border border-line bg-white shadow-sm rounded-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-table-head-bg border-b border-table-rule">
                                            <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider">Candidate</th>
                                            <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider">Metric Status</th>
                                            <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider text-right">Deployment</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-table-rule">
                                        {attempts.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-8 text-center text-slate text-sm">No recent candidate deployments found.</td>
                                            </tr>
                                        ) : (
                                            attempts.map((attempt, idx) => (
                                                <tr key={attempt._id} className={`group hover:bg-table-row-hover transition-colors ${idx % 2 === 1 ? 'bg-table-row-alt' : 'bg-white'}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-blue-tint flex items-center justify-center text-navy font-bold text-xs border border-info-line">
                                                                {attempt.user?.name?.[0]?.toUpperCase() || 'U'}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <Link href={`/admin/attempts/${attempt._id}`} className="text-sm font-bold text-navy hover:underline">
                                                                    {attempt.user?.name || 'Anonymous Candidate'}
                                                                </Link>
                                                                <span className="text-xs text-slate mt-0.5">{attempt.assessment?.title || 'General Assessment'}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-5">
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate uppercase tracking-wider mb-0.5">Accuracy</p>
                                                                <p className={`text-sm font-bold tabular-nums ${attempt.percentage >= 60 ? 'text-ok' : 'text-danger'}`}>
                                                                    {attempt.status === 'completed' ? `${Math.round(attempt.percentage)}%` : '--'}
                                                                </p>
                                                            </div>
                                                            <div className="h-6 w-px bg-line"></div>
                                                            <div>
                                                                <p className="text-[10px] font-bold text-slate uppercase tracking-wider mb-0.5">Alerts</p>
                                                                <p className={`text-sm font-bold tabular-nums ${attempt.violationCount > 3 ? 'text-danger' : 'text-navy'}`}>
                                                                    {attempt.violationCount || 0}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${attempt.status === 'completed' ? 'bg-ok-bg text-ok border-ok-line' :
                                                            attempt.status === 'terminated' ? 'bg-danger-bg text-danger border-danger-line' :
                                                                'bg-blue-tint text-navy border-info-line'
                                                            }`}>
                                                            {attempt.status ? attempt.status.replace('_', ' ') : 'in progress'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Operational Intelligence */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-navy">Ops Intelligence</h3>

                        <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                            <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-navy rounded-full"></span>
                                Revenue Breakdown
                            </h4>
                            <div className="space-y-5">
                                <div className="flex justify-between items-end border-b border-line pb-4">
                                    <div>
                                        <p className="text-[11px] font-bold text-slate uppercase tracking-wider mb-0.5">Single Assessments</p>
                                        <p className="text-base font-bold text-ink">Individual Units</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-navy tabular-nums">₹{Math.round((stats?.totalRevenue || 0) * 0.6)}</p>
                                        <p className="text-[10px] font-semibold text-slate">60% Contribution</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-end border-b border-line pb-4">
                                    <div>
                                        <p className="text-[11px] font-bold text-slate uppercase tracking-wider mb-0.5">Category Packs</p>
                                        <p className="text-base font-bold text-ink">Bundle Delta</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-navy tabular-nums">₹{Math.round((stats?.totalRevenue || 0) * 0.3)}</p>
                                        <p className="text-[10px] font-semibold text-slate">30% Contribution</p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[11px] font-bold text-slate mb-4 uppercase tracking-wider">Track Distribution</p>
                                    <div className="space-y-4">
                                        <DistributionBar label="IT Core" percentage={42} color="#0B1D45" />
                                        <DistributionBar label="Development" percentage={28} color="#2B6CB0" />
                                        <DistributionBar label="Enterprise" percentage={15} color="#5A6680" />
                                        <DistributionBar label="Humanitarian" percentage={15} color="#7CA1D8" />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                            <h4 className="font-bold text-navy text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-ok rounded-full"></span>
                                Node Health
                            </h4>
                            <div className="space-y-3.5">
                                <SystemMetric label="Kernel Core" status="Optimized" ok />
                                <SystemMetric label="Dataplumb" status="Synchronized" ok />
                                <SystemMetric label="GuardEye AI" status="Active" ok pulse />
                                <SystemMetric label="Telemetry" status="Stable" ok />
                            </div>
                            <Button variant="outline" className="w-full mt-6 border-line text-slate hover:text-navy hover:bg-mist py-2.5 text-xs font-bold uppercase tracking-wider" onClick={fetchLogs}>
                                View Audit Logs
                            </Button>
                        </Card>
                    </div>
                </div>

                {/* Log Modal */}
                {isLogsOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/45 backdrop-blur-sm">
                        <Card className="w-full max-w-4xl max-h-[80vh] bg-white border border-line shadow-lg rounded-2xl flex flex-col overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-line bg-paper">
                                <h2 className="text-xl font-bold text-navy flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-ok animate-pulse"></span>
                                    Audit & Telemetry Logs
                                </h2>
                                <button onClick={() => setIsLogsOpen(false)} className="text-slate hover:text-navy font-bold text-sm">✕ Close</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                                {logs.length === 0 ? (
                                    <p className="text-center text-slate text-sm py-8">No recent logs recorded.</p>
                                ) : (
                                    logs.map((log, i) => (
                                        <div key={log._id || i} className={`p-3.5 rounded-xl border flex items-start gap-4 transition-all ${log.severity === 'critical' ? 'bg-danger-bg border-danger-line' :
                                            log.severity === 'warning' ? 'bg-warn-bg border-warn-line' :
                                                'bg-paper border-line'
                                            }`}>
                                            <span className="text-xs font-mono text-slate shrink-0 mt-0.5">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${log.severity === 'critical' ? 'text-danger' :
                                                        log.severity === 'warning' ? 'text-warn' :
                                                            'text-ok'
                                                        }`}>{log.action}</span>
                                                    <span className="text-xs font-medium text-slate">by {log.actor?.name || 'System'} ({log.actor?.role || 'Daemon'})</span>
                                                </div>
                                                <p className="text-xs text-ink leading-relaxed">{log.description}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}

function StatCard({ title, value, trend, subtitle, icon }: any) {
    return (
        <Card className="p-6 bg-white border border-line shadow-sm rounded-xl hover:border-line-strong transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-tint flex items-center justify-center text-lg border border-info-line text-navy">{icon}</div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-mist text-slate border border-line">{trend}</span>
            </div>
            <p className="text-xs font-semibold text-slate mb-1">{title}</p>
            <p className="text-3xl font-black text-navy tracking-tight leading-none mb-2 tabular-nums">{value}</p>
            <p className="text-xs text-slate-soft">{subtitle}</p>
        </Card>
    );
}

function DistributionBar({ label, percentage, color }: any) {
    return (
        <div>
            <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-ink">{label}</span>
                <span className="text-slate font-bold tabular-nums">{percentage}%</span>
            </div>
            <div className="h-2 w-full bg-sunken rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                />
            </div>
        </div>
    );
}

function SystemMetric({ label, status, ok, pulse }: any) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-ink">{label}</span>
            <div className="flex items-center gap-2">
                {pulse && <div className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse"></div>}
                <span className={`text-[11px] font-bold border py-0.5 px-2.5 rounded-full ${ok ? 'text-ok bg-ok-bg border-ok-line' : 'text-slate bg-mist border-line'}`}>
                    {status}
                </span>
            </div>
        </div>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

export default function FAQSubmissionsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = new URL('/api/admin/faq-submissions', window.location.origin);
            if (statusFilter) url.searchParams.append('status', statusFilter);
            if (searchQuery.trim()) url.searchParams.append('query', searchQuery.trim());

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setSubmissions(data.submissions);
        } catch (error) {
            console.error('Failed to fetch FAQ submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (submissionId: string, status: 'new' | 'reviewed' | 'resolved') => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/faq-submissions', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ submissionId, status }),
            });
            const data = await res.json();
            if (data.success) {
                setSubmissions((prev) =>
                    prev.map((item) => (item._id === submissionId ? { ...item, status } : item))
                );
            }
        } catch (error) {
            console.error('Failed to update FAQ submission status:', error);
        }
    };

    if (loading && submissions.length === 0) {
        return <Loading variant="spinner" fullScreen text="Loading FAQ submissions..." />;
    }

    return (
        <div className="min-h-screen bg-paper text-ink">
            <Navbar />

            <main className="container mx-auto px-6 py-12 lg:py-16 page-container">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 bg-blue-tint border border-info-line text-navy text-[11px] font-bold uppercase tracking-wider rounded-lg mb-3">
                            Communication Inbox
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-navy tracking-tight uppercase">
                            FAQ Submissions
                        </h1>
                        <p className="text-slate mt-1 text-sm max-w-xl font-medium">
                            Review and manage customer queries submitted through the platform contact forms.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search by name, email, subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchSubmissions()}
                            className="bg-white border border-line-strong rounded-lg px-4 py-2.5 text-xs text-ink placeholder:text-slate-soft focus:border-navy outline-none w-full md:w-80 shadow-sm"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-white border border-line-strong rounded-lg px-4 py-2.5 text-xs font-bold text-navy uppercase tracking-wider focus:border-navy outline-none shadow-sm cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="resolved">Resolved</option>
                        </select>
                        <Button variant="primary" className="px-5 py-2.5 text-xs font-bold bg-navy hover:bg-navy-2 text-white border-none rounded-lg" onClick={fetchSubmissions}>
                            Refresh
                        </Button>
                    </div>
                </div>

                <Card className="overflow-hidden border border-line bg-white shadow-sm rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-table-head-bg border-b border-table-rule">
                                    <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider">Subject & Message</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider">Submitted</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-table-rule">
                                {submissions.map((submission, idx) => (
                                    <tr key={submission._id} className={`hover:bg-table-row-hover transition-colors align-top ${idx % 2 === 1 ? 'bg-table-row-alt' : 'bg-white'}`}>
                                        <td className="px-6 py-4">
                                            <p className="text-navy font-bold text-sm">{submission.name}</p>
                                            <p className="text-slate text-xs mt-0.5">{submission.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-navy font-bold text-xs mb-1">{submission.subject}</p>
                                            <p className="text-ink text-xs leading-relaxed whitespace-pre-wrap">
                                                {submission.message}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-slate text-xs">
                                                {new Date(submission.createdAt).toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={submission.status}
                                                onChange={(e) =>
                                                    updateStatus(
                                                        submission._id,
                                                        e.target.value as 'new' | 'reviewed' | 'resolved'
                                                    )
                                                }
                                                className="bg-paper border border-line-strong rounded-md px-2.5 py-1 text-xs font-semibold text-ink uppercase tracking-wider focus:border-navy outline-none cursor-pointer"
                                            >
                                                <option value="new">New</option>
                                                <option value="reviewed">Reviewed</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && submissions.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate text-sm">
                                            No submissions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </main>
        </div>
    );
}

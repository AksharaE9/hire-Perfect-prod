'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Badge from '@/components/ui/Badge';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

export default function AssessmentManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        category: '',
        duration: 50,
        price: 500,
        totalQuestions: 50,
        passingScore: 60,
        difficulty: 'intermediate',
        isActive: true
    });

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [assessRes, catRes] = await Promise.all([
                fetch('/api/admin/assessments', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const assessData = await assessRes.json();
            const catData = await catRes.json();

            if (assessData.success) setAssessments(assessData.assessments);
            if (catData.success) setCategories(catData.categories);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const method = editingAssessment ? 'PATCH' : 'POST';
            const body = editingAssessment ? { ...formData, id: editingAssessment._id } : formData;

            const res = await fetch('/api/admin/assessments', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                fetchData();
                setIsModalOpen(false);
                setEditingAssessment(null);
                setFormData({
                    title: '', slug: '', description: '', category: '',
                    duration: 50, price: 500, totalQuestions: 50,
                    passingScore: 60, difficulty: 'intermediate', isActive: true
                });
            }
        } catch (error) {
            console.error('Failed to save assessment:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this assessment?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/assessments?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAssessments(assessments.filter(a => a._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete assessment:', error);
        }
    };

    const openEditModal = (assessment: any) => {
        setEditingAssessment(assessment);
        setFormData({
            title: assessment.title,
            slug: assessment.slug,
            description: assessment.description,
            category: assessment.category?._id || assessment.category,
            duration: assessment.duration,
            price: assessment.price,
            totalQuestions: assessment.totalQuestions,
            passingScore: assessment.passingScore,
            difficulty: assessment.difficulty,
            isActive: assessment.isActive
        });
        setIsModalOpen(true);
    };

    if (loading && assessments.length === 0) return <Loading variant="spinner" fullScreen text="Loading assessment catalog..." />;

    return (
        <div className="min-h-screen bg-paper text-ink">
            <Navbar />

            <main className="container mx-auto px-6 py-12 lg:py-16 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 bg-blue-tint border border-info-line text-navy text-[11px] font-bold uppercase tracking-wider rounded-lg mb-3">
                            Assessment Catalog
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-navy tracking-tight uppercase">
                            Assessments
                        </h1>
                        <p className="text-slate text-sm mt-1">
                            Configure assessment parameters, pricing, and question banks.
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        className="px-6 py-3 text-xs font-bold bg-navy hover:bg-navy-2 text-white border-none shadow-sm rounded-lg"
                        onClick={() => { setEditingAssessment(null); setIsModalOpen(true); }}
                    >
                        + New Assessment
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assessments.map((a) => (
                        <Card key={a._id} className="p-6 border border-line bg-white shadow-sm rounded-xl hover:border-line-strong transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${
                                        a.difficulty === 'beginner' ? 'bg-ok-bg text-ok border-ok-line' :
                                        a.difficulty === 'intermediate' ? 'bg-blue-tint text-navy border-info-line' :
                                        'bg-danger-bg text-danger border-danger-line'
                                    }`}>
                                        {a.difficulty}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(a)} className="text-slate hover:text-navy text-xs font-bold px-2 py-1 bg-mist rounded border border-line">Edit</button>
                                        <button onClick={() => handleDelete(a._id)} className="text-danger hover:text-danger-line text-xs font-bold px-2 py-1 bg-danger-bg rounded border border-danger-line">Delete</button>
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-navy mb-2">{a.title}</h3>
                                <p className="text-xs text-slate mb-5 line-clamp-2">{a.description}</p>

                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    <div className="bg-paper rounded-lg p-3 border border-line">
                                        <p className="text-[10px] font-bold text-slate uppercase tracking-wider mb-0.5">Time Limit</p>
                                        <p className="text-xs font-bold text-navy tabular-nums">{a.duration} Mins</p>
                                    </div>
                                    <div className="bg-paper rounded-lg p-3 border border-line">
                                        <p className="text-[10px] font-bold text-slate uppercase tracking-wider mb-0.5">Price</p>
                                        <p className="text-xs font-bold text-navy tabular-nums">₹{a.price}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-line">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${a.isActive ? 'bg-ok' : 'bg-slate-soft'}`}></span>
                                    <span className="text-xs font-bold text-slate uppercase tracking-wider">{a.isActive ? 'Active' : 'Offline'}</span>
                                </div>
                                <Link href={`/admin/assessments/${a._id}/questions`} className="text-xs font-bold text-navy hover:underline">
                                    Manage Questions →
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </main>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/45 backdrop-blur-sm overflow-y-auto">
                    <Card className="w-full max-w-2xl p-6 bg-white border border-line shadow-lg rounded-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-line">
                            <h2 className="text-xl font-bold text-navy">
                                {editingAssessment ? 'Edit Assessment' : 'New Assessment'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate hover:text-navy text-lg font-bold">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1 block">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1 block">Slug (URL)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                        className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1 block">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1 block">Category</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none cursor-pointer"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1 block">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                                        className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none cursor-pointer"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1 block">Duration (mins)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1 block">Price (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                        className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-6 border-t border-line">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        id="isActive"
                                        className="w-4 h-4 rounded border-line-strong accent-navy"
                                    />
                                    <label htmlFor="isActive" className="text-xs font-bold text-navy cursor-pointer">Live / Active</label>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="border-line text-slate hover:bg-mist text-xs">Cancel</Button>
                                    <Button variant="primary" type="submit" className="px-6 py-2.5 bg-navy hover:bg-navy-2 text-white border-none text-xs font-bold">Save Assessment</Button>
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}

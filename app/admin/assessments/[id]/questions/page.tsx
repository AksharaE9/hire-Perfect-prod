'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

export default function QuestionManagement({ params }: { params: any }) {
    const router = useRouter();
    const resolvedParams: any = use(params);
    const assessmentId = resolvedParams.id;

    const [loading, setLoading] = useState(true);
    const [assessment, setAssessment] = useState<any>(null);
    const [questions, setQuestions] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState<any>({
        type: 'mcq',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        points: 1,
        difficulty: 'medium',
        tags: []
    });

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        fetchData();
    }, [assessmentId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [assessRes, questRes] = await Promise.all([
                fetch(`/api/assessments/${assessmentId}`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/admin/questions?assessmentId=${assessmentId}`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const assessData = await assessRes.json();
            const questData = await questRes.json();

            if (assessData.success) setAssessment(assessData.assessment);
            if (questData.success) setQuestions(questData.questions);
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
            const method = editingQuestion ? 'PATCH' : 'POST';
            const body = editingQuestion
                ? { ...formData, id: editingQuestion._id }
                : { ...formData, assessmentId };

            const res = await fetch('/api/admin/questions', {
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
                setEditingQuestion(null);
                setFormData({
                    type: 'mcq', question: '', options: ['', '', '', ''],
                    correctAnswer: 0, explanation: '', points: 1,
                    difficulty: 'medium', tags: []
                });
            }
        } catch (error) {
            console.error('Failed to save question:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/questions?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setQuestions(questions.filter(q => q._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete question:', error);
        }
    };

    const openEditModal = (q: any) => {
        setEditingQuestion(q);
        setFormData({
            type: q.type,
            question: q.question,
            options: q.options || ['', '', '', ''],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || '',
            points: q.points,
            difficulty: q.difficulty,
            tags: q.tags || []
        });
        setIsModalOpen(true);
    };

    if (loading && questions.length === 0) return <Loading variant="spinner" fullScreen text="Loading question repository..." />;

    return (
        <div className="min-h-screen bg-paper text-ink">
            <Navbar />

            <main className="container mx-auto px-6 py-12 lg:py-16 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 bg-blue-tint border border-info-line text-navy text-[11px] font-bold uppercase tracking-wider rounded-lg mb-3">
                            Question Bank
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-navy tracking-tight uppercase">
                            Question Design
                        </h1>
                        <p className="text-slate text-sm mt-1">
                            Managing questions for assessment: <span className="text-navy font-bold">{assessment?.title}</span>
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" className="border-line text-slate hover:text-navy hover:bg-mist text-xs font-bold" onClick={() => router.push('/admin/assessments')}>
                            Back to Assessments
                        </Button>
                        <Button
                            variant="primary"
                            className="px-6 py-2.5 text-xs font-bold bg-navy hover:bg-navy-2 text-white border-none shadow-sm rounded-lg"
                            onClick={() => { setEditingQuestion(null); setIsModalOpen(true); }}
                        >
                            + Add Question
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    {questions.map((q, idx) => (
                        <Card key={q._id} className="p-6 border border-line bg-white shadow-sm rounded-xl hover:border-line-strong transition-all">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <span className="text-navy font-bold text-xs">Q{idx + 1}.</span>
                                        <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 bg-blue-tint text-navy border border-info-line rounded">
                                            {q.type}
                                        </span>
                                        <span className="text-[11px] font-semibold text-slate uppercase tracking-wider">{q.points} Points</span>
                                    </div>
                                    <h3 className="text-base font-bold text-navy mb-4">{q.question}</h3>

                                    {q.type === 'mcq' && (
                                        <div className="grid md:grid-cols-2 gap-3">
                                            {q.options.map((opt: string, i: number) => (
                                                <div key={i} className={`p-3 rounded-lg border text-xs font-medium ${i === parseInt(q.correctAnswer) ? 'bg-ok-bg border-ok-line text-ok font-bold' : 'bg-paper border-line text-ink'}`}>
                                                    <span className="font-bold mr-2 text-slate">{String.fromCharCode(65 + i)}.</span>
                                                    {opt}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <button onClick={() => openEditModal(q)} className="px-3 py-1.5 rounded-lg bg-mist border border-line text-navy text-xs font-bold hover:bg-sunken transition-all">Edit</button>
                                    <button onClick={() => handleDelete(q._id)} className="px-3 py-1.5 rounded-lg bg-danger-bg border border-danger-line text-danger text-xs font-bold hover:bg-danger hover:text-white transition-all">Delete</button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {questions.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-xl border border-line border-dashed">
                            <p className="text-slate text-sm font-semibold">No questions found for this assessment. Add questions to proceed.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Question Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/45 backdrop-blur-sm overflow-y-auto">
                    <Card className="w-full max-w-3xl p-6 bg-white border border-line shadow-lg rounded-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-line">
                            <h2 className="text-xl font-bold text-navy">
                                {editingQuestion ? 'Edit Question' : 'Add Question'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate hover:text-navy text-lg font-bold">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1 block">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none cursor-pointer"
                                    >
                                        <option value="mcq">Multiple Choice</option>
                                        <option value="scenario">Scenario</option>
                                        <option value="coding">Coding</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1 block">Points</label>
                                    <input
                                        type="number"
                                        value={formData.points}
                                        onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                                        className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1 block">Difficulty</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none cursor-pointer"
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1 block">Question Text</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none resize-none"
                                />
                            </div>

                            {formData.type === 'mcq' && (
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-slate uppercase tracking-wider block">Answer Options</label>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {formData.options.map((opt: string, i: number) => (
                                            <div key={i} className="flex gap-2 items-center bg-paper p-2 rounded-lg border border-line">
                                                <input
                                                    type="radio"
                                                    name="correctAnswer"
                                                    checked={parseInt(formData.correctAnswer) === i}
                                                    onChange={() => setFormData({ ...formData, correctAnswer: i })}
                                                    className="accent-navy w-4 h-4 cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                                    onChange={(e) => {
                                                        const newOpts = [...formData.options];
                                                        newOpts[i] = e.target.value;
                                                        setFormData({ ...formData, options: newOpts });
                                                    }}
                                                    className="w-full bg-white border border-line rounded-md px-3 py-1.5 text-xs text-ink focus:border-navy outline-none"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-semibold text-slate uppercase tracking-wider mb-1 block">Explanation (Optional)</label>
                                <textarea
                                    rows={2}
                                    value={formData.explanation}
                                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                    className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-line">
                                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="border-line text-slate hover:bg-mist text-xs">Cancel</Button>
                                <Button variant="primary" type="submit" className="px-6 py-2.5 bg-navy hover:bg-navy-2 text-white border-none text-xs font-bold">Save Question</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}

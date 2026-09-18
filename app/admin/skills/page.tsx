'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

const CAT_COLORS: Record<string, string> = {
    frontend: 'text-navy bg-blue-tint border-info-line',
    backend: 'text-ok bg-ok-bg border-ok-line',
    database: 'text-warn bg-warn-bg border-warn-line',
    devops: 'text-navy-2 bg-blue-tint/60 border-line-strong',
    dsa: 'text-danger bg-danger-bg border-danger-line',
    other: 'text-slate bg-mist border-line',
};

const CATEGORIES = ['frontend', 'backend', 'database', 'devops', 'dsa', 'other'];

export default function AdminSkillsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [skills, setSkills] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [userSkills, setUserSkills] = useState<any[]>([]);
    const [userSearch, setUserSearch] = useState('');
    const [newSkill, setNewSkill] = useState({ name: '', category: 'other' });
    const [seeding, setSeeding] = useState(false);
    const [seedMsg, setSeedMsg] = useState('');
    const [assignForm, setAssignForm] = useState({ skillId: '', rating: '', notes: '' });
    const [assigning, setAssigning] = useState(false);
    const [assignMsg, setAssignMsg] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') { router.push('/dashboard'); return; }
        fetchSkills();
        fetchUsers();
    }, []);

    const fetchSkills = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/skills', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setSkills(data.skills);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setUsers(data.users.filter((u: any) => u.role !== 'admin'));
        } catch (e) { console.error(e); }
    };

    const fetchUserSkills = async (userId: string) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/user-skills?userId=${userId}`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) setUserSkills(data.userSkills);
        } catch (e) { console.error(e); }
    };

    const handleSeedSkills = async () => {
        setSeeding(true);
        setSeedMsg('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/skills/seed', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setSeedMsg(data.message || 'Done');
            fetchSkills();
        } catch { setSeedMsg('Error'); }
        finally { setSeeding(false); }
    };

    const handleCreateSkill = async () => {
        if (!newSkill.name) return;
        const token = localStorage.getItem('token');
        const res = await fetch('/api/skills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(newSkill),
        });
        const data = await res.json();
        if (data.success) {
            setNewSkill({ name: '', category: 'other' });
            fetchSkills();
        }
    };

    const handleAssignSkill = async () => {
        if (!selectedUser || !assignForm.skillId || !assignForm.rating) {
            setAssignMsg('Please select skill and rating');
            return;
        }
        setAssigning(true);
        setAssignMsg('');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/user-skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    userId: selectedUser._id,
                    skillId: assignForm.skillId,
                    rating: Number(assignForm.rating),
                    notes: assignForm.notes,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setAssignMsg('✓ Skill assigned successfully');
                setAssignForm({ skillId: '', rating: '', notes: '' });
                fetchUserSkills(selectedUser._id);
            } else {
                setAssignMsg(data.error || 'Error');
            }
        } catch { setAssignMsg('Network error'); }
        finally { setAssigning(false); }
    };

    const handleRemoveSkill = async (skillId: string) => {
        if (!selectedUser) return;
        const token = localStorage.getItem('token');
        await fetch(`/api/user-skills?userId=${selectedUser._id}&skillId=${skillId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchUserSkills(selectedUser._id);
    };

    const selectUser = (user: any) => {
        setSelectedUser(user);
        fetchUserSkills(user._id);
        setAssignMsg('');
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(userSearch.toLowerCase())
    );

    if (loading) return <Loading variant="spinner" fullScreen text="Loading Skills Panel..." />;

    const grouped = CATEGORIES.reduce((acc, cat) => {
        acc[cat] = skills.filter(s => s.category === cat);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="min-h-screen bg-paper text-ink">
            <Navbar />

            <main className="container mx-auto px-6 py-12 lg:py-16 page-container relative z-10">
                <div className="mb-10">
                    <div className="inline-block px-3 py-1 bg-blue-tint border border-info-line text-navy text-[11px] font-bold uppercase tracking-wider rounded-lg mb-3">
                        Admin · Skill Matrix
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-navy tracking-tight uppercase">
                        Skills Manager
                    </h1>
                    <p className="text-slate text-sm mt-1">Manage the global skill taxonomy and evaluate candidate skill proficiencies.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left: Skill Catalog */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                            <h2 className="text-xs font-bold text-navy uppercase tracking-wider mb-4">Skill Catalog ({skills.length})</h2>

                            <div className="flex gap-2 mb-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-line text-navy hover:bg-mist text-xs font-bold uppercase tracking-wider py-2"
                                    onClick={handleSeedSkills}
                                    disabled={seeding}
                                >
                                    {seeding ? 'Seeding...' : 'Seed Defaults'}
                                </Button>
                            </div>
                            {seedMsg && <p className="text-xs font-bold text-ok uppercase mb-3">{seedMsg}</p>}

                            {/* Add Skill */}
                            <div className="space-y-3 mb-5 p-4 bg-paper rounded-xl border border-line">
                                <p className="text-xs font-bold text-slate uppercase tracking-wider">Add Custom Skill</p>
                                <input
                                    value={newSkill.name}
                                    onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                                    onKeyDown={e => e.key === 'Enter' && handleCreateSkill()}
                                    className="w-full bg-white border border-line rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none"
                                    placeholder="Skill name"
                                />
                                <select
                                    value={newSkill.category}
                                    onChange={e => setNewSkill({ ...newSkill, category: e.target.value })}
                                    className="w-full bg-white border border-line rounded-lg px-3.5 py-2 text-sm text-ink focus:border-navy outline-none cursor-pointer"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <button
                                    onClick={handleCreateSkill}
                                    className="w-full py-2 rounded-lg bg-navy text-white text-xs font-bold uppercase tracking-wider hover:bg-navy-2 transition-all shadow-sm"
                                >
                                    + Add Skill
                                </button>
                            </div>

                            {/* Skill list by category */}
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                                {CATEGORIES.map(cat => grouped[cat]?.length ? (
                                    <div key={cat}>
                                        <p className="text-[11px] font-bold text-slate uppercase tracking-wider mb-1.5">{cat}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {grouped[cat].map((s: any) => (
                                                <span key={s._id} className={`px-2 py-0.5 text-xs font-semibold rounded border ${CAT_COLORS[cat] || 'bg-mist text-slate border-line'}`}>
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ) : null)}
                            </div>
                        </Card>
                    </div>

                    {/* Middle: User Selector */}
                    <div className="space-y-6">
                        <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                            <h2 className="text-xs font-bold text-navy uppercase tracking-wider mb-4">Select Candidate</h2>
                            <div className="relative mb-4">
                                <input
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="w-full bg-paper border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink focus:border-navy outline-none"
                                    placeholder="Search candidates by name or email..."
                                />
                            </div>
                            <div className="divide-y divide-line max-h-96 overflow-y-auto">
                                {filteredUsers.map((u) => (
                                    <button
                                        key={u._id}
                                        onClick={() => selectUser(u)}
                                        className={`w-full text-left px-3 py-3.5 hover:bg-mist transition-all rounded-lg ${selectedUser?._id === u._id ? 'bg-blue-tint border border-info-line' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-mist border border-line flex items-center justify-center text-navy text-xs font-bold">
                                                {u.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-navy">{u.name}</p>
                                                <p className="text-[11px] text-slate">{u.email}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <p className="text-center text-slate text-sm py-8">No candidates found.</p>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right: Assign Skills */}
                    <div className="space-y-6">
                        {!selectedUser ? (
                            <Card className="p-16 text-center border-line bg-white shadow-sm rounded-xl">
                                <div className="text-4xl mb-3">👈</div>
                                <p className="text-slate text-xs uppercase font-bold tracking-wider">Select a candidate to manage skills</p>
                            </Card>
                        ) : (
                            <>
                                <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                                    <p className="text-xs font-bold text-navy uppercase tracking-wider mb-1">Assigning Skills To</p>
                                    <p className="text-base font-bold text-ink">{selectedUser.name}</p>
                                    <p className="text-xs text-slate">{selectedUser.email}</p>

                                    <div className="mt-5 space-y-3">
                                        <select
                                            value={assignForm.skillId}
                                            onChange={e => setAssignForm({ ...assignForm, skillId: e.target.value })}
                                            className="w-full bg-white border border-line-strong rounded-lg px-3.5 py-2.5 text-sm text-ink focus:border-navy outline-none cursor-pointer"
                                        >
                                            <option value="">Select Skill...</option>
                                            {CATEGORIES.map(cat => (
                                                grouped[cat]?.length ? (
                                                    <optgroup key={cat} label={cat.toUpperCase()}>
                                                        {grouped[cat].map((s: any) => (
                                                            <option key={s._id} value={s._id}>{s.name}</option>
                                                        ))}
                                                    </optgroup>
                                                ) : null
                                            ))}
                                        </select>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-1 block">Rating (1–10)</label>
                                                <input
                                                    type="number" min={1} max={10}
                                                    value={assignForm.rating}
                                                    onChange={e => setAssignForm({ ...assignForm, rating: e.target.value })}
                                                    className="w-full bg-white border border-line-strong rounded-lg px-3 py-2 text-sm text-ink focus:border-navy outline-none"
                                                    placeholder="1–10"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-1 block">Notes</label>
                                                <input
                                                    value={assignForm.notes}
                                                    onChange={e => setAssignForm({ ...assignForm, notes: e.target.value })}
                                                    className="w-full bg-white border border-line-strong rounded-lg px-3 py-2 text-sm text-ink focus:border-navy outline-none"
                                                    placeholder="Optional"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAssignSkill}
                                            disabled={assigning}
                                            className="w-full py-2.5 rounded-lg bg-navy hover:bg-navy-2 text-xs font-bold uppercase tracking-wider text-white transition-all shadow-sm disabled:opacity-50"
                                        >
                                            {assigning ? 'Assigning...' : 'Assign Skill'}
                                        </button>

                                        {assignMsg && (
                                            <p className={`text-xs font-semibold ${assignMsg.startsWith('✓') ? 'text-ok' : 'text-danger'}`}>
                                                {assignMsg}
                                            </p>
                                        )}
                                    </div>
                                </Card>

                                {/* Current Skills */}
                                <Card className="p-6 bg-white border border-line shadow-sm rounded-xl">
                                    <p className="text-xs font-bold text-navy uppercase tracking-wider mb-4">Current Skills ({userSkills.length})</p>
                                    {userSkills.length === 0 ? (
                                        <p className="text-xs text-slate text-center py-4">No skills assigned yet</p>
                                    ) : (
                                        <div className="space-y-2.5">
                                            {userSkills.map((us: any) => (
                                                <div key={us._id} className="flex items-center justify-between p-3 bg-paper rounded-lg border border-line group">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${CAT_COLORS[us.skillId?.category] || CAT_COLORS.other}`}>
                                                            {us.skillId?.category?.slice(0, 3).toUpperCase()}
                                                        </span>
                                                        <span className="text-xs font-bold text-navy">{us.skillId?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-1.5 bg-sunken rounded-full overflow-hidden">
                                                                <div className="h-full bg-navy rounded-full" style={{ width: `${us.rating * 10}%` }} />
                                                            </div>
                                                            <span className="text-xs font-bold tabular-nums text-navy">{us.rating}/10</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveSkill(us.skillId._id)}
                                                            className="w-5 h-5 rounded bg-danger-bg border border-danger-line text-danger text-xs flex items-center justify-center hover:bg-danger hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

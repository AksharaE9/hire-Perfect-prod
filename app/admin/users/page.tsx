'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import { checkAndClearExpiredSession } from '@/lib/sessionUtils';

export default function UserManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        if (!checkAndClearExpiredSession(router)) return;
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = new URL('/api/admin/users', window.location.origin);
            if (searchQuery) url.searchParams.append('query', searchQuery);
            if (roleFilter) url.searchParams.append('role', roleFilter);

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setUsers(data.users);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId: string, updateData: any) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ userId, ...updateData })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.map(u => u._id === userId ? { ...u, ...data.user } : u));
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action is irreversible.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/admin/users?userId=${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUsers(users.filter(u => u._id !== userId));
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    if (loading && users.length === 0) return <Loading variant="spinner" fullScreen text="Accessing User Database..." />;

    return (
        <div className="min-h-screen bg-paper text-ink">
            <Navbar />

            <main className="container mx-auto px-6 py-12 lg:py-16 page-container relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div>
                        <div className="inline-block px-3 py-1 bg-blue-tint border border-info-line text-navy text-[11px] font-bold uppercase tracking-wider rounded-lg mb-3">
                            User Directory
                        </div>
                        <h1 className="text-3xl lg:text-4xl font-black text-navy tracking-tight uppercase">
                            User Registry
                        </h1>
                        <p className="text-slate text-sm mt-1 max-w-lg">
                            Manage candidate and administrator permissions and profile access.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                            className="bg-white border border-line-strong rounded-lg px-4 py-2.5 text-xs text-ink focus:border-navy outline-none shadow-sm transition-all w-full md:w-80"
                        />
                        <select
                            value={roleFilter}
                            onChange={(e) => { setRoleFilter(e.target.value); setTimeout(fetchUsers, 0); }}
                            className="bg-white border border-line-strong rounded-lg px-4 py-2.5 text-xs font-bold text-navy uppercase tracking-wider focus:border-navy outline-none shadow-sm cursor-pointer"
                        >
                            <option value="">All Roles</option>
                            <option value="candidate">Candidate</option>
                            <option value="admin">Admin</option>
                        </select>
                        <Button variant="primary" className="px-5 py-2.5 text-xs font-bold bg-navy hover:bg-navy-2 text-white border-none rounded-lg" onClick={fetchUsers}>
                            Search
                        </Button>
                    </div>
                </div>

                <Card className="overflow-hidden border border-line bg-white shadow-sm rounded-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-table-head-bg border-b border-table-rule">
                                    <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3.5 text-xs font-semibold text-slate uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-table-rule">
                                {users.map((u, idx) => (
                                    <tr key={u._id} className={`group hover:bg-table-row-hover transition-colors ${idx % 2 === 1 ? 'bg-table-row-alt' : 'bg-white'}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-blue-tint border border-info-line flex items-center justify-center text-navy font-bold text-xs">
                                                    {u.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-navy">{u.name}</span>
                                                    <span className="text-xs text-slate mt-0.5">{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-ok"></span>
                                                    <span className="text-xs font-semibold text-ink">Active</span>
                                                </div>
                                                <span className="text-[11px] text-slate-soft mt-0.5">Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleUpdateUser(u._id, { role: e.target.value })}
                                                className={`text-xs font-bold uppercase tracking-wider border py-1 px-2.5 rounded-md outline-none cursor-pointer ${u.role === 'admin'
                                                    ? 'text-navy border-info-line bg-blue-tint'
                                                    : 'text-ink border-line bg-mist'
                                                    }`}
                                            >
                                                <option value="candidate">Candidate</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="px-3 py-1 rounded-md bg-danger-bg border border-danger-line text-danger text-xs font-bold hover:bg-danger hover:text-white transition-all"
                                                title="Delete User"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate text-sm">No users found.</td>
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

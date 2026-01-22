/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import {
    CheckCircle, XCircle, Clock, Search,
    Mail, Briefcase, Package
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './AdminStyles.css';

interface PendingUser {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: 'seller' | 'provider';
    approval_status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export default function AdminApprovals() {
    const { user, isAuthenticated } = useAuthStore();
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'all'>('pending');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPendingUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            let query = supabase
                .from('users')
                .select('id, full_name, email, phone, role, approval_status, created_at')
                .in('role', ['seller', 'provider'])
                .order('created_at', { ascending: false });

            if (filter === 'pending') {
                query = query.eq('approval_status', 'pending');
            }

            const { data, error } = await query;
            if (error) throw error;
            setPendingUsers((data || []) as PendingUser[]);
        } catch (err) {
            console.error('Error fetching users:', err);
            toast.error('Failed to load pending users');
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchPendingUsers();
        }
    }, [user, filter, fetchPendingUsers]);

    const handleApproval = async (userId: string, action: 'approved' | 'rejected') => {
        try {
            const { error } = await (supabase
                .from('users') as any)
                .update({ approval_status: action })
                .eq('id', userId);

            if (error) throw error;

            // Get user email for notification
            const userData = pendingUsers.find(u => u.id === userId);
            if (userData && action === 'approved') {
                // TODO: Send approval email via edge function
                console.log(`Would send approval email to ${userData.email}`);
            }

            toast.success(`User ${action === 'approved' ? 'approved' : 'rejected'} successfully`);
            fetchPendingUsers();
        } catch {
            toast.error('Failed to update user status');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { class: string; label: string; icon: React.ReactNode }> = {
            pending: { class: 'warning', label: 'Pending', icon: <Clock size={12} /> },
            approved: { class: 'success', label: 'Approved', icon: <CheckCircle size={12} /> },
            rejected: { class: 'error', label: 'Rejected', icon: <XCircle size={12} /> },
        };
        const s = statusMap[status] || statusMap.pending;
        return (
            <span className={`badge badge-${s.class}`}>
                {s.icon} {s.label}
            </span>
        );
    };

    const getRoleIcon = (role: string) => {
        return role === 'seller' ? <Package size={16} /> : <Briefcase size={16} />;
    };

    const filteredUsers = pendingUsers.filter(u =>
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/1234/admin" replace />;
    }

    return (
        <>
            <header className="admin-header">
                <div>
                    <h1>User Approvals</h1>
                    <p>Approve or reject seller and provider registrations</p>
                </div>
            </header>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select value={filter} onChange={e => setFilter(e.target.value as 'pending' | 'all')}>
                        <option value="pending">Pending Only</option>
                        <option value="all">All Registrations</option>
                    </select>
                </div>
            </div>

            {/* Pending Users Table */}
            <div className="data-table-wrapper">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <CheckCircle size={48} />
                        <h3>No pending approvals</h3>
                        <p>All seller and provider registrations have been reviewed.</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Contact</th>
                                <th>Registered</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(userData => (
                                <tr key={userData.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar">
                                                {userData.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="user-name">{userData.full_name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="role-badge">
                                            {getRoleIcon(userData.role)}
                                            {userData.role === 'seller' ? 'Seller' : 'Provider'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <span><Mail size={12} /> {userData.email}</span>
                                            <span>{userData.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {new Date(userData.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </td>
                                    <td>{getStatusBadge(userData.approval_status)}</td>
                                    <td>
                                        {userData.approval_status === 'pending' && (
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleApproval(userData.id, 'approved')}
                                                >
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline"
                                                    onClick={() => handleApproval(userData.id, 'rejected')}
                                                >
                                                    <XCircle size={14} /> Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}

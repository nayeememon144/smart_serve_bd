/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
    Search, X, Check, Eye, Ban, Unlock, Mail, Phone
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import type { User } from '../../types/database';
import toast from 'react-hot-toast';
import './AdminStyles.css';

export default function AdminUsers() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        let filtered = users;

        if (roleFilter !== 'all') {
            filtered = filtered.filter(u => u.role === roleFilter);
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(u => u.status === statusFilter);
        }

        if (searchQuery) {
            filtered = filtered.filter(u =>
                u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.phone?.includes(searchQuery)
            );
        }

        setFilteredUsers(filtered);
    }, [users, roleFilter, statusFilter, searchQuery]);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewUser = (user: User) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended') => {
        try {
            const { error } = await (supabase
                .from('users') as any)
                .update({ status: newStatus })
                .eq('id', userId);

            if (error) throw error;
            toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'}`);
            fetchUsers();
            setShowModal(false);
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const { error } = await (supabase
                .from('users') as any)
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;
            toast.success('User role updated');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user role');
        }
    };

    if (authLoading) {
        return (
            <div className="loading-state" style={{ minHeight: '100vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/1234/admin" replace />;
    }

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'admin': return 'badge-admin';
            case 'provider': return 'badge-provider';
            case 'seller': return 'badge-seller';
            default: return 'badge-customer';
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'active': return 'status-active';
            case 'suspended': return 'status-suspended';
            default: return 'status-pending';
        }
    };

    return (
        <>
            <header className="admin-header">
                <div>
                    <h1>User Management</h1>
                    <p>Manage platform users</p>
                </div>
                <div className="header-stats">
                    <span className="stat">Total: {users.length}</span>
                    <span className="stat">Active: {users.filter(u => u.status === 'active').length}</span>
                </div>
            </header>

            {/* Filters */}
            <div className="content-filters">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="filter-group">
                    <select
                        className="form-input filter-select"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="customer">Customers</option>
                        <option value="provider">Providers</option>
                        <option value="seller">Sellers</option>
                        <option value="admin">Admins</option>
                    </select>
                    <select
                        className="form-input filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="pending_verification">Pending</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="content-card">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Contact</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar">
                                                {u.profile_photo ? (
                                                    <img src={u.profile_photo} alt="" />
                                                ) : (
                                                    u.full_name.charAt(0)
                                                )}
                                            </div>
                                            <div className="user-info">
                                                <span className="name">{u.full_name}</span>
                                                <span className="id">ID: {u.id.slice(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-cell">
                                            <span className="email">
                                                <Mail size={14} /> {u.email}
                                            </span>
                                            {u.phone && (
                                                <span className="phone">
                                                    <Phone size={14} /> {u.phone}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadgeClass(u.status)}`}>
                                            {u.status === 'active' && <Check size={12} />}
                                            {u.status === 'suspended' && <Ban size={12} />}
                                            {u.status}
                                        </span>
                                    </td>
                                    <td>
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon view"
                                                onClick={() => handleViewUser(u)}
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            {u.status === 'active' ? (
                                                <button
                                                    className="btn-icon delete"
                                                    onClick={() => handleStatusChange(u.id, 'suspended')}
                                                    title="Suspend User"
                                                >
                                                    <Ban size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn-icon edit"
                                                    onClick={() => handleStatusChange(u.id, 'active')}
                                                    title="Activate User"
                                                >
                                                    <Unlock size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <p>No users found</p>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {showModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content user-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>User Details</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="user-profile-card">
                                <div className="avatar-large">
                                    {selectedUser.profile_photo ? (
                                        <img src={selectedUser.profile_photo} alt="" />
                                    ) : (
                                        selectedUser.full_name.charAt(0)
                                    )}
                                </div>
                                <h3>{selectedUser.full_name}</h3>
                                <span className={`role-badge ${getRoleBadgeClass(selectedUser.role)}`}>
                                    {selectedUser.role}
                                </span>
                            </div>

                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>Email</label>
                                    <span>{selectedUser.email}</span>
                                    {selectedUser.email_verified && <Check size={14} className="verified-icon" />}
                                </div>
                                <div className="detail-item">
                                    <label>Phone</label>
                                    <span>{selectedUser.phone || 'Not provided'}</span>
                                    {selectedUser.phone_verified && <Check size={14} className="verified-icon" />}
                                </div>
                                <div className="detail-item">
                                    <label>Gender</label>
                                    <span>{selectedUser.gender || 'Not specified'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Date of Birth</label>
                                    <span>{selectedUser.date_of_birth || 'Not provided'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Language</label>
                                    <span>{selectedUser.language_preference === 'bn' ? 'Bangla' : 'English'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Last Login</label>
                                    <span>{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Joined</label>
                                    <span>{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-item">
                                    <label>Status</label>
                                    <span className={`status-badge ${getStatusBadgeClass(selectedUser.status)}`}>
                                        {selectedUser.status}
                                    </span>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <div className="form-group">
                                    <label className="form-label">Change Role</label>
                                    <select
                                        className="form-input"
                                        value={selectedUser.role}
                                        onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="provider">Provider</option>
                                        <option value="seller">Seller</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            {selectedUser.status === 'active' ? (
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleStatusChange(selectedUser.id, 'suspended')}
                                >
                                    <Ban size={16} />
                                    Suspend User
                                </button>
                            ) : (
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleStatusChange(selectedUser.id, 'active')}
                                >
                                    <Unlock size={16} />
                                    Activate User
                                </button>
                            )}
                            <button className="btn btn-outline" onClick={() => setShowModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

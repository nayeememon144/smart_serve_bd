 
/* eslint-disable @typescript-eslint/no-unused-vars */
 
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Users, FolderOpen, Wrench, ShoppingBag,
    CalendarCheck, CreditCard
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import './AdminStyles.css';

export default function AdminDashboard() {
    const { t: _t } = useTranslation();
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        users: 0,
        services: 0,
        bookings: 0,
        revenue: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            const [usersRes, servicesRes, bookingsRes] = await Promise.all([
                supabase.from('users').select('id', { count: 'exact', head: true }),
                supabase.from('services').select('id', { count: 'exact', head: true }),
                supabase.from('bookings').select('id', { count: 'exact', head: true }),
            ]);

            setStats({
                users: usersRes.count || 0,
                services: servicesRes.count || 0,
                bookings: bookingsRes.count || 0,
                revenue: 0,
            });
        };

        fetchStats();
    }, []);

    // Check if user is admin
    if (user && user.role !== 'admin') {
        return <Navigate to="/1234/admin" replace />;
    }

    return (
        <>
            <header className="admin-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back, {user?.full_name || 'Admin'}</p>
                </div>
            </header>

            <div className="admin-content">
                {/* Stats Cards */}
                <div className="admin-stats">
                    <div className="admin-stat-card">
                        <div className="stat-icon users">
                            <Users size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.users}</span>
                            <span className="stat-label">Total Users</span>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="stat-icon services">
                            <Wrench size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.services}</span>
                            <span className="stat-label">Services</span>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="stat-icon bookings">
                            <CalendarCheck size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.bookings}</span>
                            <span className="stat-label">Bookings</span>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="stat-icon revenue">
                            <CreditCard size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">৳{stats.revenue}</span>
                            <span className="stat-label">Revenue</span>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="admin-section">
                    <h2>Recent Activity</h2>
                    <div className="activity-list">
                        <p className="empty-text">No recent activity to display.</p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="admin-section">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions-grid">
                        <button className="quick-action-btn">
                            <FolderOpen size={20} />
                            Add Category
                        </button>
                        <button className="quick-action-btn">
                            <Wrench size={20} />
                            Add Service
                        </button>
                        <button className="quick-action-btn">
                            <ShoppingBag size={20} />
                            Add Product
                        </button>
                        <button className="quick-action-btn">
                            <Users size={20} />
                            Manage Users
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

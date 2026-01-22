/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Calendar, DollarSign, Star, Clock,
    ChevronRight, Plus, Check, X, Bell
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import type { Booking, Service } from '../../types/database';
import toast from 'react-hot-toast';
import './ProviderDashboard.css';

export default function ProviderDashboard() {
    const { t: _t } = useTranslation();
    const { user } = useAuthStore();

    const [stats, setStats] = useState({
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        totalEarnings: 0,
        avgRating: 0,
        totalReviews: 0,
    });
    const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
    const [myServices, setMyServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchDashboardData();
    }, [user?.id]);

    const fetchDashboardData = async () => {
        if (!user?.id) return;

        try {
            // Fetch bookings stats
            const { data: allBookings, count: totalBookings } = await (supabase
                .from('bookings') as any)
                .select('*', { count: 'exact' })
                .eq('provider_id', user.id);

            const pendingCount = allBookings?.filter((b: any) => b.status === 'pending').length || 0;
            const completedCount = allBookings?.filter((b: any) => b.status === 'completed').length || 0;
            const totalEarnings = allBookings
                ?.filter((b: any) => b.payment_status === 'paid')
                .reduce((sum: number, b: any) => sum + b.total_amount, 0) || 0;

            // Fetch provider profile for ratings
            const { data: profile } = await (supabase
                .from('provider_profiles') as any)
                .select('avg_rating, total_ratings')
                .eq('user_id', user.id)
                .single();

            setStats({
                totalBookings: totalBookings || 0,
                pendingBookings: pendingCount,
                completedBookings: completedCount,
                totalEarnings,
                avgRating: profile?.avg_rating || 0,
                totalReviews: profile?.total_ratings || 0,
            });

            // Fetch recent bookings
            const { data: recentData } = await supabase
                .from('bookings')
                .select('*, service:services(title_en, title_bn), customer:users!bookings_customer_id_fkey(full_name, phone)')
                .eq('provider_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentData) setRecentBookings(recentData as Booking[]);

            // Fetch my services
            const { data: servicesData } = await supabase
                .from('services')
                .select('*')
                .eq('provider_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (servicesData) setMyServices(servicesData as Service[]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject') => {
        try {
            const newStatus = action === 'accept' ? 'confirmed' : 'cancelled';
            const { error } = await (supabase
                .from('bookings') as any)
                .update({ status: newStatus })
                .eq('id', bookingId);

            if (error) throw error;

            toast.success(`Booking ${action === 'accept' ? 'accepted' : 'rejected'}`);
            setRecentBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
            );
        } catch (error) {
            toast.error('Failed to update booking');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { class: string; label: string }> = {
            pending: { class: 'warning', label: 'Pending' },
            confirmed: { class: 'info', label: 'Confirmed' },
            in_progress: { class: 'primary', label: 'In Progress' },
            completed: { class: 'success', label: 'Completed' },
            cancelled: { class: 'error', label: 'Cancelled' },
        };
        const s = statusMap[status] || { class: 'default', label: status };
        return <span className={`badge badge-${s.class}`}>{s.label}</span>;
    };

    return (
        <div className="provider-dashboard-content">
            {/* Page Header */}
            <header className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Manage your services and bookings</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-icon">
                        <Bell size={20} />
                    </button>
                    <Link to="/provider/services/new" className="btn btn-primary">
                        <Plus size={18} />
                        Add Service
                    </Link>
                </div>
            </header>

            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner" />
                </div>
            ) : (
                <div className="dashboard-content">
                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary-500)' }}>
                                <Calendar size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.totalBookings}</span>
                                <span className="stat-label">Total Bookings</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-500)' }}>
                                <Clock size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.pendingBookings}</span>
                                <span className="stat-label">Pending Bookings</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-500)' }}>
                                <DollarSign size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">৳{stats.totalEarnings.toLocaleString()}</span>
                                <span className="stat-label">Total Earnings</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#f59e0b' }}>
                                <Star size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.avgRating.toFixed(1)}</span>
                                <span className="stat-label">{stats.totalReviews} Reviews</span>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        {/* Recent Bookings */}
                        <div className="section-card">
                            <div className="section-header">
                                <h2>Recent Bookings</h2>
                                <Link to="/provider/bookings" className="section-link">
                                    View All <ChevronRight size={16} />
                                </Link>
                            </div>

                            {recentBookings.length > 0 ? (
                                <div className="bookings-list">
                                    {recentBookings.map((booking) => (
                                        <div key={booking.id} className="booking-item">
                                            <div className="booking-info">
                                                <h4>{(booking as any).service?.title_en}</h4>
                                                <p>
                                                    <span>{(booking as any).customer?.full_name}</span> •
                                                    <span> {new Date(booking.booking_date).toLocaleDateString()}</span> at
                                                    <span> {booking.booking_time}</span>
                                                </p>
                                            </div>
                                            <div className="booking-meta">
                                                <span className="booking-amount">৳{booking.total_amount}</span>
                                                {getStatusBadge(booking.status)}
                                            </div>
                                            {booking.status === 'pending' && (
                                                <div className="booking-actions">
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleBookingAction(booking.id, 'accept')}
                                                    >
                                                        <Check size={14} /> Accept
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline"
                                                        onClick={() => handleBookingAction(booking.id, 'reject')}
                                                    >
                                                        <X size={14} /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-small">
                                    <p>No bookings yet</p>
                                </div>
                            )}
                        </div>

                        {/* My Services */}
                        <div className="section-card">
                            <div className="section-header">
                                <h2>My Services</h2>
                                <Link to="/provider/services" className="section-link">
                                    View All <ChevronRight size={16} />
                                </Link>
                            </div>

                            {myServices.length > 0 ? (
                                <div className="services-list">
                                    {myServices.map((service) => (
                                        <Link key={service.id} to={`/provider/services/${service.id}`} className="service-item">
                                            <div className="service-thumb">
                                                <img src={service.images?.[0] || '/placeholder-service.jpg'} alt={service.title_en} />
                                            </div>
                                            <div className="service-info">
                                                <h4>{service.title_en}</h4>
                                                <div className="service-meta">
                                                    <span className="price">৳{service.price_display}</span>
                                                    <span className="rating">
                                                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                                        {service.avg_rating.toFixed(1)}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`status-dot ${service.status}`} />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-small">
                                    <p>No services yet</p>
                                    <Link to="/provider/services/new" className="btn btn-primary btn-sm">
                                        <Plus size={14} /> Add First Service
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="tips-card">
                        <h3>💡 Tips to increase bookings</h3>
                        <ul>
                            <li>Complete your profile with a professional photo</li>
                            <li>Add detailed descriptions to your services</li>
                            <li>Respond quickly to booking requests</li>
                            <li>Ask satisfied customers to leave reviews</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

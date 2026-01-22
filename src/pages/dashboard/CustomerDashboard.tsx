/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { Calendar, Package, Star, Clock, ChevronRight, MapPin, User, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import './Dashboard.css';

interface Booking {
    id: string;
    booking_code: string;
    booking_date: string;
    booking_time: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded';
    total_amount: number;
    address_text: string;
    created_at: string;
    service: {
        id: string;
        title_en: string;
        title_bn: string;
        slug: string;
        images: string[] | null;
    };
    provider: {
        id: string;
        full_name: string;
        profile_photo: string | null;
    };
}

interface Order {
    id: string;
    order_code: string;
    total_amount: number;
    status: string;
    created_at: string;
}

interface DashboardStats {
    totalBookings: number;
    totalOrders: number;
    pendingReviews: number;
    totalSpent: number;
}

export default function CustomerDashboard() {
    const { t, i18n } = useTranslation();
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const lang = i18n.language as 'en' | 'bn';

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalBookings: 0,
        totalOrders: 0,
        pendingReviews: 0,
        totalSpent: 0,
    });
    const [isDataLoading, setIsDataLoading] = useState(true);

    useEffect(() => {
        if (user?.id) {
            fetchDashboardData();
        }
    }, [user?.id]);

    const fetchDashboardData = async () => {
        if (!user?.id) return;

        try {
            // Fetch bookings
            const { data: bookingsData, error: bookingsError } = await (supabase
                .from('bookings') as any)
                .select(`
                    id,
                    booking_code,
                    booking_date,
                    booking_time,
                    status,
                    payment_status,
                    total_amount,
                    address_text,
                    created_at,
                    service:services!bookings_service_id_fkey(id, title_en, title_bn, slug, images),
                    provider:users!bookings_provider_id_fkey(id, full_name, profile_photo)
                `)
                .eq('customer_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (bookingsError) throw bookingsError;

            // Get bookings count
            const { count: bookingsCount } = await (supabase
                .from('bookings') as any)
                .select('*', { count: 'exact', head: true })
                .eq('customer_id', user.id);

            // Calculate bookings total
            const bookingsTotal = bookingsData?.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0;

            setBookings(bookingsData as Booking[] || []);
            setStats(prev => ({
                ...prev,
                totalBookings: bookingsCount || 0,
                totalSpent: bookingsTotal,
            }));

            // Try to fetch orders (may fail if table doesn't exist)
            try {
                const { data: ordersData, error: ordersError } = await (supabase
                    .from('orders') as any)
                    .select('id, order_code, total_amount, status, created_at')
                    .eq('customer_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (!ordersError && ordersData) {
                    const { count: ordersCount } = await (supabase
                        .from('orders') as any)
                        .select('*', { count: 'exact', head: true })
                        .eq('customer_id', user.id);

                    const ordersTotal = ordersData.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

                    setOrders(ordersData);
                    setStats(prev => ({
                        ...prev,
                        totalOrders: ordersCount || 0,
                        totalSpent: prev.totalSpent + ordersTotal,
                    }));
                }
            } catch (ordersErr) {
                // Orders table might not exist - just log and continue
                console.log('Orders table not available:', ordersErr);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsDataLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { icon: React.ReactNode; class: string; label: string }> = {
            pending: { icon: <Clock size={14} />, class: 'status-pending', label: 'Pending' },
            confirmed: { icon: <CheckCircle size={14} />, class: 'status-confirmed', label: 'Confirmed' },
            in_progress: { icon: <AlertCircle size={14} />, class: 'status-progress', label: 'In Progress' },
            completed: { icon: <CheckCircle size={14} />, class: 'status-completed', label: 'Completed' },
            cancelled: { icon: <XCircle size={14} />, class: 'status-cancelled', label: 'Cancelled' },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`status-badge ${config.class}`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    const getPaymentBadge = (status: string) => {
        if (status === 'paid') {
            return <span className="payment-badge paid">Paid</span>;
        }
        return <span className="payment-badge pending">Pay After Service</span>;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    if (isLoading) {
        return (
            <div className="loading-state" style={{ minHeight: '60vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const statsData = [
        { icon: <Calendar size={24} />, value: stats.totalBookings.toString(), label: t('dashboard.totalBookings'), color: 'var(--primary-500)' },
        { icon: <Package size={24} />, value: stats.totalOrders.toString(), label: 'Total Orders', color: 'var(--secondary-500)' },
        { icon: <Star size={24} />, value: stats.pendingReviews.toString(), label: t('dashboard.pendingReviews'), color: 'var(--accent-500)' },
        { icon: <Clock size={24} />, value: `৳${stats.totalSpent.toLocaleString()}`, label: t('dashboard.totalSpent'), color: 'var(--success-500)' },
    ];

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Welcome Header */}
                <div className="dashboard-header">
                    <div className="welcome-section">
                        <h1 className="welcome-title">
                            {t('dashboard.welcome')}, {user?.full_name?.split(' ')[0] || 'User'}! 👋
                        </h1>
                        <p className="welcome-subtitle">
                            Manage your bookings, orders, and account settings
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {statsData.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="section-card">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="quick-actions">
                        <Link to="/services" className="action-card">
                            <span className="action-icon">🔧</span>
                            <span className="action-text">Book a Service</span>
                            <ChevronRight size={18} />
                        </Link>
                        <Link to="/products" className="action-card">
                            <span className="action-icon">🛒</span>
                            <span className="action-text">Shop Products</span>
                            <ChevronRight size={18} />
                        </Link>
                        <Link to="/profile" className="action-card">
                            <span className="action-icon">👤</span>
                            <span className="action-text">Edit Profile</span>
                            <ChevronRight size={18} />
                        </Link>
                        <Link to="/track-order" className="action-card">
                            <span className="action-icon">📦</span>
                            <span className="action-text">Track Order</span>
                            <ChevronRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="section-card">
                    <div className="section-header">
                        <h2 className="section-title">{t('dashboard.recentBookings')}</h2>
                        {bookings.length > 0 && (
                            <Link to="/dashboard/bookings" className="section-link">
                                {t('dashboard.viewAll')} <ChevronRight size={16} />
                            </Link>
                        )}
                    </div>

                    {isDataLoading ? (
                        <div className="loading-state-small">
                            <div className="spinner" />
                        </div>
                    ) : bookings.length > 0 ? (
                        <div className="bookings-list">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="booking-card">
                                    <div className="booking-image">
                                        <img
                                            src={booking.service?.images?.[0] || '/placeholder-service.jpg'}
                                            alt={booking.service?.title_en}
                                        />
                                    </div>
                                    <div className="booking-details">
                                        <div className="booking-header">
                                            <h4 className="booking-title">
                                                {lang === 'bn' ? booking.service?.title_bn : booking.service?.title_en}
                                            </h4>
                                            <span className="booking-code">#{booking.booking_code}</span>
                                        </div>
                                        <div className="booking-meta">
                                            <span className="meta-item">
                                                <Calendar size={14} />
                                                {formatDate(booking.booking_date)} at {formatTime(booking.booking_time)}
                                            </span>
                                            <span className="meta-item">
                                                <User size={14} />
                                                {booking.provider?.full_name}
                                            </span>
                                            <span className="meta-item">
                                                <MapPin size={14} />
                                                {booking.address_text?.split(',')[0]}
                                            </span>
                                        </div>
                                        <div className="booking-footer">
                                            <div className="booking-status">
                                                {getStatusBadge(booking.status)}
                                                {getPaymentBadge(booking.payment_status)}
                                            </div>
                                            <span className="booking-amount">৳{booking.total_amount?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-small">
                            <p>No bookings yet. Book your first service!</p>
                            <Link to="/services" className="btn btn-primary btn-sm">Browse Services</Link>
                        </div>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="section-card">
                    <div className="section-header">
                        <h2 className="section-title">Recent Orders</h2>
                        {orders.length > 0 && (
                            <Link to="/dashboard/orders" className="section-link">
                                {t('dashboard.viewAll')} <ChevronRight size={16} />
                            </Link>
                        )}
                    </div>

                    {isDataLoading ? (
                        <div className="loading-state-small">
                            <div className="spinner" />
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="orders-list">
                            {orders.map((order) => (
                                <Link key={order.id} to={`/orders/${order.order_code}`} className="order-row">
                                    <div className="order-info">
                                        <span className="order-code">#{order.order_code}</span>
                                        <span className="order-date">{formatDate(order.created_at)}</span>
                                    </div>
                                    <div className="order-right">
                                        <span className="order-amount">৳{order.total_amount?.toLocaleString()}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-small">
                            <p>No orders yet. Start shopping!</p>
                            <Link to="/products" className="btn btn-primary btn-sm">Browse Products</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

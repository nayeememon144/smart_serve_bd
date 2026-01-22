/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Calendar, MapPin, User, Phone, Clock, CheckCircle, XCircle,
    AlertCircle, Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './ProviderBookings.css';

interface Booking {
    id: string;
    booking_code: string;
    booking_date: string;
    booking_time: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded';
    total_amount: number;
    address_text: string;
    special_instructions: string | null;
    created_at: string;
    service: {
        id: string;
        title_en: string;
        title_bn: string;
        images: string[] | null;
    };
    customer: {
        id: string;
        full_name: string;
        phone: string;
        email: string;
        profile_photo: string | null;
    };
}

type TabType = 'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export default function ProviderBookings() {
    const { i18n } = useTranslation();
    const { user } = useAuthStore();
    const lang = i18n.language as 'en' | 'bn';

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const tabs: { key: TabType; label: string; count: number }[] = [
        { key: 'all', label: 'All Bookings', count: bookings.length },
        { key: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
        { key: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
        { key: 'in_progress', label: 'In Progress', count: bookings.filter(b => b.status === 'in_progress').length },
        { key: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
        { key: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
    ];

    useEffect(() => {
        fetchBookings();
    }, [user?.id]);

    useEffect(() => {
        filterBookings();
    }, [activeTab, searchQuery, bookings]);

    const fetchBookings = async () => {
        if (!user?.id) return;

        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    service:services!bookings_service_id_fkey(id, title_en, title_bn, images),
                    customer:users!bookings_customer_id_fkey(id, full_name, phone, email, profile_photo)
                `)
                .eq('provider_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data as Booking[] || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setIsLoading(false);
        }
    };

    const filterBookings = () => {
        let filtered = [...bookings];

        // Filter by tab
        if (activeTab !== 'all') {
            filtered = filtered.filter(b => b.status === activeTab);
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(b =>
                b.booking_code.toLowerCase().includes(query) ||
                b.customer?.full_name.toLowerCase().includes(query) ||
                b.service?.title_en.toLowerCase().includes(query)
            );
        }

        setFilteredBookings(filtered);
    };

    const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
        setActionLoading(bookingId);
        try {
            const { error } = await (supabase
                .from('bookings') as any)
                .update({ status: newStatus })
                .eq('id', bookingId);

            if (error) throw error;

            toast.success(`Booking ${newStatus === 'confirmed' ? 'accepted' : newStatus}`);
            setBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, status: newStatus as Booking['status'] } : b)
            );
        } catch (error) {
            toast.error('Failed to update booking');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { icon: React.ReactNode; class: string; label: string }> = {
            pending: { icon: <Clock size={14} />, class: 'status-pending', label: 'Pending' },
            confirmed: { icon: <CheckCircle size={14} />, class: 'status-confirmed', label: 'Confirmed' },
            in_progress: { icon: <AlertCircle size={14} />, class: 'status-progress', label: 'In Progress' },
            completed: { icon: <CheckCircle size={14} />, class: 'status-completed', label: 'Completed' },
            cancelled: { icon: <XCircle size={14} />, class: 'status-cancelled', label: 'Cancelled' },
        };
        const s = config[status] || config.pending;
        return (
            <span className={`status-badge ${s.class}`}>
                {s.icon}
                {s.label}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
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

    return (
        <div className="provider-bookings-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Bookings Management</h1>
                    <p>Manage your service bookings</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs-section">
                <div className="tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                            <span className="tab-count">{tab.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Search & Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by booking code, customer, or service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Bookings List */}
            <div className="bookings-container">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Loading bookings...</p>
                    </div>
                ) : filteredBookings.length > 0 ? (
                    <div className="bookings-list">
                        {filteredBookings.map((booking) => (
                            <div key={booking.id} className="booking-card">
                                <div className="booking-header">
                                    <div className="booking-code">
                                        <span className="code">#{booking.booking_code}</span>
                                        {getStatusBadge(booking.status)}
                                    </div>
                                    <span className="booking-amount">৳{booking.total_amount.toLocaleString()}</span>
                                </div>

                                <div className="booking-body">
                                    <div className="service-info">
                                        <div className="service-image">
                                            <img
                                                src={booking.service?.images?.[0] || '/placeholder-service.jpg'}
                                                alt={booking.service?.title_en}
                                            />
                                        </div>
                                        <div className="service-details">
                                            <h4>{lang === 'bn' ? booking.service?.title_bn : booking.service?.title_en}</h4>
                                            <div className="meta-row">
                                                <span className="meta-item">
                                                    <Calendar size={14} />
                                                    {formatDate(booking.booking_date)}
                                                </span>
                                                <span className="meta-item">
                                                    <Clock size={14} />
                                                    {formatTime(booking.booking_time)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="customer-info">
                                        <div className="customer-avatar">
                                            {booking.customer?.profile_photo ? (
                                                <img src={booking.customer.profile_photo} alt={booking.customer.full_name} />
                                            ) : (
                                                booking.customer?.full_name?.charAt(0) || 'C'
                                            )}
                                        </div>
                                        <div className="customer-details">
                                            <span className="customer-name">
                                                <User size={14} />
                                                {booking.customer?.full_name}
                                            </span>
                                            <span className="customer-phone">
                                                <Phone size={14} />
                                                {booking.customer?.phone || 'No phone'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="address-info">
                                        <MapPin size={14} />
                                        <span>{booking.address_text}</span>
                                    </div>

                                    {booking.special_instructions && (
                                        <div className="special-notes">
                                            <strong>Notes:</strong> {booking.special_instructions}
                                        </div>
                                    )}
                                </div>

                                {/* Actions based on status */}
                                <div className="booking-actions">
                                    {booking.status === 'pending' && (
                                        <>
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                disabled={actionLoading === booking.id}
                                            >
                                                <CheckCircle size={16} />
                                                Accept
                                            </button>
                                            <button
                                                className="btn btn-outline-danger"
                                                onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                                disabled={actionLoading === booking.id}
                                            >
                                                <XCircle size={16} />
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {booking.status === 'confirmed' && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleStatusUpdate(booking.id, 'in_progress')}
                                            disabled={actionLoading === booking.id}
                                        >
                                            <AlertCircle size={16} />
                                            Start Service
                                        </button>
                                    )}
                                    {booking.status === 'in_progress' && (
                                        <button
                                            className="btn btn-success"
                                            onClick={() => handleStatusUpdate(booking.id, 'completed')}
                                            disabled={actionLoading === booking.id}
                                        >
                                            <CheckCircle size={16} />
                                            Mark Complete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Calendar size={48} />
                        <h3>No bookings found</h3>
                        <p>
                            {activeTab !== 'all'
                                ? `You don't have any ${activeTab.replace('_', ' ')} bookings.`
                                : 'You haven\'t received any bookings yet.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
    Search, Check, X, Eye, ChevronLeft, ChevronRight, Clock, MapPin,
    Phone, Mail, Calendar, User, CalendarCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './AdminStyles.css';

interface Booking {
    id: string;
    booking_code: string;
    service_id: string;
    customer_id: string;
    provider_id: string;
    booking_date: string;
    booking_time: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
    payment_method: string;
    total_amount: number;
    notes: string | null;
    address: string | null;
    created_at: string;
    service?: {
        title_en: string;
        title_bn: string;
    };
    customer?: {
        full_name: string;
        phone: string;
        email: string | null;
    };
    provider?: {
        full_name: string;
        phone: string;
    };
}



export default function AdminBookings() {
    const { user, isAuthenticated } = useAuthStore();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [paymentFilter, setPaymentFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchBookings();
        }
    }, [user, page, searchQuery, statusFilter, paymentFilter]);

    const fetchBookings = async () => {
        try {
            setIsLoading(true);

            let query = supabase
                .from('bookings')
                .select(`
                    *,
                    service:services(title_en, title_bn),
                    customer:users!bookings_customer_id_fkey(full_name, phone, email),
                    provider:users!bookings_provider_id_fkey(full_name, phone)
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (searchQuery) {
                query = query.or(`booking_code.ilike.%${searchQuery}%`);
            }

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            if (paymentFilter !== 'all') {
                query = query.eq('payment_status', paymentFilter);
            }

            const { data, count, error } = await query;

            if (error) throw error;
            setBookings(data as Booking[]);
            setTotalCount(count || 0);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (bookingId: string, newStatus: Booking['status']) => {
        try {
            const { error } = await (supabase
                .from('bookings') as any)
                .update({ status: newStatus })
                .eq('id', bookingId);

            if (error) throw error;

            toast.success(`Booking ${newStatus}`);
            setBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
            );
            setShowDetailModal(false);
        } catch (error) {
            console.error('Error updating booking:', error);
            toast.error('Failed to update booking status');
        }
    };

    const handlePaymentStatusChange = async (bookingId: string, newStatus: Booking['payment_status']) => {
        try {
            const { error } = await (supabase
                .from('bookings') as any)
                .update({ payment_status: newStatus })
                .eq('id', bookingId);

            if (error) throw error;

            toast.success(`Payment marked as ${newStatus}`);
            setBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, payment_status: newStatus } : b)
            );
        } catch (error) {
            console.error('Error updating payment status:', error);
            toast.error('Failed to update payment status');
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

    const getPaymentBadge = (status: string) => {
        const statusMap: Record<string, { class: string; label: string }> = {
            pending: { class: 'warning', label: 'Pending' },
            paid: { class: 'success', label: 'Paid' },
            refunded: { class: 'info', label: 'Refunded' },
            failed: { class: 'error', label: 'Failed' },
        };
        const s = statusMap[status] || { class: 'default', label: status };
        return <span className={`badge badge-${s.class}`}>{s.label}</span>;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/1234/admin" replace />;
    }

    return (
        <>
            <header className="admin-header">
                <div>
                    <h1>Bookings Management</h1>
                    <p>Manage all service bookings</p>
                </div>
                <div className="header-stats">
                    <span className="stat">Total: {totalCount}</span>
                </div>
            </header>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by booking code..."
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={statusFilter}
                        onChange={e => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                        value={paymentFilter}
                        onChange={e => {
                            setPaymentFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">All Payments</option>
                        <option value="pending">Payment Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Bookings Table */}
            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner" />
                </div>
            ) : bookings.length === 0 ? (
                <div className="empty-state">
                    <CalendarCheck size={48} />
                    <h3>No Bookings Found</h3>
                    <p>No bookings match your search criteria.</p>
                </div>
            ) : (
                <>
                    <div className="data-table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Booking Code</th>
                                    <th>Service</th>
                                    <th>Customer</th>
                                    <th>Provider</th>
                                    <th>Date & Time</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td>
                                            <code className="booking-code">{booking.booking_code}</code>
                                        </td>
                                        <td>
                                            <div className="service-cell-simple">
                                                <strong>{booking.service?.title_en}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="user-cell-simple">
                                                <span>{booking.customer?.full_name}</span>
                                                <small>{booking.customer?.phone}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="user-cell-simple">
                                                <span>{booking.provider?.full_name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="date-cell">
                                                <span>{formatDate(booking.booking_date)}</span>
                                                <small>{booking.booking_time}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="amount">৳{booking.total_amount.toLocaleString()}</span>
                                        </td>
                                        <td>{getStatusBadge(booking.status)}</td>
                                        <td>{getPaymentBadge(booking.payment_status)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-icon btn-sm"
                                                    onClick={() => {
                                                        setSelectedBooking(booking);
                                                        setShowDetailModal(true);
                                                    }}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="btn btn-icon"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="page-info">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                className="btn btn-icon"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Booking Detail Modal */}
            {showDetailModal && selectedBooking && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Booking Details</h2>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="booking-detail-header">
                                <div className="booking-code-large">
                                    <span>Booking Code</span>
                                    <code>{selectedBooking.booking_code}</code>
                                </div>
                                <div className="booking-status-group">
                                    {getStatusBadge(selectedBooking.status)}
                                    {getPaymentBadge(selectedBooking.payment_status)}
                                </div>
                            </div>

                            <div className="detail-grid">
                                <div className="detail-section">
                                    <h3>Service Information</h3>
                                    <div className="detail-row">
                                        <label>Service:</label>
                                        <span>{selectedBooking.service?.title_en}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label><Calendar size={14} /> Date:</label>
                                        <span>{formatDate(selectedBooking.booking_date)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label><Clock size={14} /> Time:</label>
                                        <span>{selectedBooking.booking_time}</span>
                                    </div>
                                    {selectedBooking.address && (
                                        <div className="detail-row">
                                            <label><MapPin size={14} /> Address:</label>
                                            <span>{selectedBooking.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="detail-section">
                                    <h3>Customer</h3>
                                    <div className="detail-row">
                                        <label><User size={14} /> Name:</label>
                                        <span>{selectedBooking.customer?.full_name}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label><Phone size={14} /> Phone:</label>
                                        <span>{selectedBooking.customer?.phone}</span>
                                    </div>
                                    {selectedBooking.customer?.email && (
                                        <div className="detail-row">
                                            <label><Mail size={14} /> Email:</label>
                                            <span>{selectedBooking.customer.email}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="detail-section">
                                    <h3>Provider</h3>
                                    <div className="detail-row">
                                        <label><User size={14} /> Name:</label>
                                        <span>{selectedBooking.provider?.full_name}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label><Phone size={14} /> Phone:</label>
                                        <span>{selectedBooking.provider?.phone}</span>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>Payment</h3>
                                    <div className="detail-row">
                                        <label>Amount:</label>
                                        <span className="amount-large">৳{selectedBooking.total_amount.toLocaleString()}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Method:</label>
                                        <span className="capitalize">{selectedBooking.payment_method}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Status:</label>
                                        {getPaymentBadge(selectedBooking.payment_status)}
                                    </div>
                                </div>
                            </div>

                            {selectedBooking.notes && (
                                <div className="detail-section full-width">
                                    <h3>Notes</h3>
                                    <p className="description-text">{selectedBooking.notes}</p>
                                </div>
                            )}

                            <div className="detail-section full-width">
                                <h3>Timeline</h3>
                                <div className="detail-row">
                                    <label>Created:</label>
                                    <span>{formatDateTime(selectedBooking.created_at)}</span>
                                </div>
                            </div>

                            {/* Status Actions */}
                            <div className="action-section">
                                <h3>Update Status</h3>
                                <div className="status-actions">
                                    {selectedBooking.status === 'pending' && (
                                        <>
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')}
                                            >
                                                <Check size={14} /> Confirm
                                            </button>
                                            <button
                                                className="btn btn-error btn-sm"
                                                onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                                            >
                                                <X size={14} /> Cancel
                                            </button>
                                        </>
                                    )}
                                    {selectedBooking.status === 'confirmed' && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleStatusChange(selectedBooking.id, 'in_progress')}
                                        >
                                            Start Service
                                        </button>
                                    )}
                                    {selectedBooking.status === 'in_progress' && (
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleStatusChange(selectedBooking.id, 'completed')}
                                        >
                                            <Check size={14} /> Complete
                                        </button>
                                    )}
                                </div>

                                {selectedBooking.payment_status === 'pending' && (
                                    <div className="payment-actions">
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handlePaymentStatusChange(selectedBooking.id, 'paid')}
                                        >
                                            Mark as Paid
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowDetailModal(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

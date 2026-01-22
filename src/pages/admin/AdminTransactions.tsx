/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
    Search, ChevronLeft, ChevronRight, Download, CreditCard, Calendar
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './AdminStyles.css';

interface Transaction {
    id: string;
    type: 'booking_payment' | 'order_payment' | 'payout' | 'refund' | 'commission';
    reference_id: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    payment_method: string;
    description: string;
    created_at: string;
    user?: {
        full_name: string;
        email: string;
    };
}



export default function AdminTransactions() {
    const { user, isAuthenticated } = useAuthStore();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [_typeFilter, _setTypeFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<string>('month');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [stats, setStats] = useState({
        totalAmount: 0,
        totalCompleted: 0,
        totalPending: 0,
    });
    const ITEMS_PER_PAGE = 15;

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchTransactions();
        }
    }, [user, page, searchQuery, statusFilter, _typeFilter, dateRange]);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);

            // Calculate date range
            const now = new Date();
            const startDate = new Date();
            if (dateRange === 'week') {
                startDate.setDate(now.getDate() - 7);
            } else if (dateRange === 'month') {
                startDate.setMonth(now.getMonth() - 1);
            } else if (dateRange === 'year') {
                startDate.setFullYear(now.getFullYear() - 1);
            }

            // Fetch from bookings as transactions (since there's no separate transactions table)
            let query = supabase
                .from('bookings')
                .select(`
                    id,
                    booking_code,
                    total_amount,
                    payment_status,
                    payment_method,
                    created_at,
                    customer:users!bookings_customer_id_fkey(full_name, email)
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (dateRange !== 'all') {
                query = query.gte('created_at', startDate.toISOString());
            }

            if (statusFilter !== 'all') {
                query = query.eq('payment_status', statusFilter);
            }

            const { data, count, error } = await query;

            if (error) throw error;

            // Transform bookings into transaction format
            const transformedData: Transaction[] = (data || []).map((booking: any) => ({
                id: booking.id,
                type: 'booking_payment' as const,
                reference_id: booking.booking_code,
                amount: booking.total_amount,
                status: booking.payment_status === 'paid' ? 'completed' : booking.payment_status,
                payment_method: booking.payment_method || 'cash',
                description: `Booking payment`,
                created_at: booking.created_at,
                user: booking.customer,
            }));

            setTransactions(transformedData);
            setTotalCount(count || 0);

            // Calculate stats
            const completed = transformedData.filter(t => t.status === 'completed');
            const pending = transformedData.filter(t => t.status === 'pending');
            setStats({
                totalAmount: transformedData.reduce((sum, t) => sum + (t.amount || 0), 0),
                totalCompleted: completed.length,
                totalPending: pending.length,
            });
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Failed to load transactions');
        } finally {
            setIsLoading(false);
        }
    };



    const formatCurrency = (amount: number) => `৳${(amount || 0).toLocaleString()}`;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { class: string; label: string }> = {
            pending: { class: 'warning', label: 'Pending' },
            completed: { class: 'success', label: 'Completed' },
            paid: { class: 'success', label: 'Paid' },
            failed: { class: 'error', label: 'Failed' },
            cancelled: { class: 'default', label: 'Cancelled' },
            refunded: { class: 'info', label: 'Refunded' },
        };
        const s = statusMap[status] || { class: 'default', label: status };
        return <span className={`badge badge-${s.class}`}>{s.label}</span>;
    };

    const getTypeBadge = (type: string) => {
        const typeMap: Record<string, { class: string; label: string }> = {
            booking_payment: { class: 'primary', label: 'Booking' },
            order_payment: { class: 'info', label: 'Order' },
            payout: { class: 'success', label: 'Payout' },
            refund: { class: 'warning', label: 'Refund' },
            commission: { class: 'default', label: 'Commission' },
        };
        const t = typeMap[type] || { class: 'default', label: type };
        return <span className={`badge badge-${t.class}`}>{t.label}</span>;
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/1234/admin" replace />;
    }

    return (
        <>
            <header className="admin-header">
                <div>
                    <h1>Transactions</h1>
                    <p>View all payment transactions</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline">
                        <Download size={16} /> Export
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Total Amount</span>
                    </div>
                    <div className="stat-value">{formatCurrency(stats.totalAmount)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Completed</span>
                    </div>
                    <div className="stat-value success">{stats.totalCompleted}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Pending</span>
                    </div>
                    <div className="stat-value warning">{stats.totalPending}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by reference..."
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="filter-group">
                    <Calendar size={18} />
                    <select
                        value={dateRange}
                        onChange={e => {
                            setDateRange(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="year">Last Year</option>
                        <option value="all">All Time</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={e => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid/Completed</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="data-table-wrapper">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="empty-state">
                        <CreditCard size={48} />
                        <h3>No Transactions Found</h3>
                        <p>Transactions will appear here when payments are made.</p>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Reference</th>
                                    <th>Type</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(txn => (
                                    <tr key={txn.id}>
                                        <td>
                                            <code className="reference-code">{txn.reference_id}</code>
                                        </td>
                                        <td>{getTypeBadge(txn.type)}</td>
                                        <td>
                                            <div className="user-cell-simple">
                                                <span>{txn.user?.full_name || 'Unknown'}</span>
                                                <small>{txn.user?.email}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="amount">{formatCurrency(txn.amount)}</span>
                                        </td>
                                        <td>
                                            <span className="payment-method">{txn.payment_method}</span>
                                        </td>
                                        <td>{getStatusBadge(txn.status)}</td>
                                        <td>{formatDate(txn.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <span className="page-info">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

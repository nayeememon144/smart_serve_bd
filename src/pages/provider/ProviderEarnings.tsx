/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import {
    Wallet, TrendingUp, Clock, CheckCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import './ProviderEarnings.css';

interface Transaction {
    id: string;
    booking_code: string;
    service_title: string;
    customer_name: string;
    amount: number;
    status: 'pending' | 'paid' | 'refunded';
    date: string;
}

export default function ProviderEarnings() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        totalEarnings: 0,
        thisMonth: 0,
        pendingPayments: 0,
        completedJobs: 0,
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState('all');

    useEffect(() => {
        fetchEarningsData();
    }, [user?.id, dateRange]);

    const fetchEarningsData = async () => {
        if (!user?.id) return;

        try {
            let query = (supabase
                .from('bookings') as any)
                .select(`
                    id,
                    booking_code,
                    total_amount,
                    payment_status,
                    status,
                    created_at,
                    service:services!bookings_service_id_fkey(title_en),
                    customer:users!bookings_customer_id_fkey(full_name)
                `)
                .eq('provider_id', user.id)
                .order('created_at', { ascending: false });

            // Apply date filter
            if (dateRange === 'month') {
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);
                query = query.gte('created_at', startOfMonth.toISOString());
            } else if (dateRange === 'week') {
                const startOfWeek = new Date();
                startOfWeek.setDate(startOfWeek.getDate() - 7);
                query = query.gte('created_at', startOfWeek.toISOString());
            }

            const { data, error } = await query;
            if (error) throw error;

            // Calculate stats
            const bookings = data || [];
            const completedBookings = bookings.filter((b: any) => b.status === 'completed');
            const paidBookings = completedBookings.filter((b: any) => b.payment_status === 'paid');
            const pendingPayments = completedBookings.filter((b: any) => b.payment_status === 'pending');

            const totalEarnings = paidBookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
            const pendingAmount = pendingPayments.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

            // This month stats
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const thisMonthEarnings = paidBookings
                .filter((b: any) => new Date(b.created_at) >= startOfMonth)
                .reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

            setStats({
                totalEarnings,
                thisMonth: thisMonthEarnings,
                pendingPayments: pendingAmount,
                completedJobs: completedBookings.length,
            });

            // Map to transactions
            const txns: Transaction[] = completedBookings.map((b: any) => ({
                id: b.id,
                booking_code: b.booking_code,
                service_title: (b as any).service?.title_en || 'Service',
                customer_name: (b as any).customer?.full_name || 'Customer',
                amount: b.total_amount || 0,
                status: b.payment_status as Transaction['status'],
                date: b.created_at,
            }));

            setTransactions(txns);
        } catch (error) {
            console.error('Error fetching earnings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getPaymentBadge = (status: string) => {
        if (status === 'paid') {
            return <span className="payment-badge paid"><CheckCircle size={12} /> Paid</span>;
        }
        return <span className="payment-badge pending"><Clock size={12} /> Pending</span>;
    };

    return (
        <div className="provider-earnings-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Earnings</h1>
                    <p>Track your income and payments</p>
                </div>
                <div className="header-actions">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="date-filter"
                    >
                        <option value="all">All Time</option>
                        <option value="month">This Month</option>
                        <option value="week">This Week</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="earnings-stats">
                <div className="stat-card primary">
                    <div className="stat-icon">
                        <Wallet size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">৳{stats.totalEarnings.toLocaleString()}</span>
                        <span className="stat-label">Total Earnings</span>
                    </div>
                </div>

                <div className="stat-card success">
                    <div className="stat-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">৳{stats.thisMonth.toLocaleString()}</span>
                        <span className="stat-label">This Month</span>
                    </div>
                </div>

                <div className="stat-card warning">
                    <div className="stat-icon">
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">৳{stats.pendingPayments.toLocaleString()}</span>
                        <span className="stat-label">Pending Payments</span>
                    </div>
                </div>

                <div className="stat-card info">
                    <div className="stat-icon">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.completedJobs}</span>
                        <span className="stat-label">Completed Jobs</span>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="transactions-section">
                <div className="section-header">
                    <h2>Transaction History</h2>
                </div>

                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Loading transactions...</p>
                    </div>
                ) : transactions.length > 0 ? (
                    <div className="transactions-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Booking</th>
                                    <th>Service</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((txn) => (
                                    <tr key={txn.id}>
                                        <td className="booking-code">#{txn.booking_code}</td>
                                        <td>{txn.service_title}</td>
                                        <td>{txn.customer_name}</td>
                                        <td>{formatDate(txn.date)}</td>
                                        <td className="amount">৳{txn.amount.toLocaleString()}</td>
                                        <td>{getPaymentBadge(txn.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <Wallet size={48} />
                        <h3>No transactions yet</h3>
                        <p>Complete bookings to start earning</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
    ArrowUpRight, ArrowDownRight, Download, Filter, Calendar
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import './AdminStyles.css';

interface FinancialStats {
    totalRevenue: number;
    totalCommissions: number;
    bookingRevenue: number;
    productRevenue: number;
    pendingPayouts: number;
    completedPayouts: number;
    revenueGrowth: number;
    commissionGrowth: number;
}

interface Transaction {
    id: string;
    type: 'booking' | 'order' | 'payout' | 'refund';
    reference_code: string;
    description: string;
    amount: number;
    commission: number;
    status: string;
    created_at: string;
    provider_name?: string;
    seller_name?: string;
}



export default function AdminFinancials() {
    const { user, isAuthenticated } = useAuthStore();

    const [stats, setStats] = useState<FinancialStats>({
        totalRevenue: 0,
        totalCommissions: 0,
        bookingRevenue: 0,
        productRevenue: 0,
        pendingPayouts: 0,
        completedPayouts: 0,
        revenueGrowth: 0,
        commissionGrowth: 0,
    });
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState('month');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchFinancialData();
        }
    }, [user, dateRange, typeFilter]);

    const fetchFinancialData = async () => {
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

            // Fetch bookings for revenue
            const { data: bookings } = await (supabase
                .from('bookings') as any)
                .select('total_amount, platform_commission, payment_status, created_at')
                .gte('created_at', startDate.toISOString())
                .eq('payment_status', 'paid');

            // Fetch product orders for revenue
            const { data: orders } = await (supabase
                .from('product_orders') as any)
                .select('total_amount, created_at, payment_status')
                .gte('created_at', startDate.toISOString())
                .eq('payment_status', 'paid');

            // Calculate stats
            const bookingRevenue = bookings?.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0;
            const bookingCommissions = bookings?.reduce((sum: number, b: any) => sum + (b.platform_commission || 0), 0) || 0;
            const productRevenue = orders?.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0) || 0;

            // Mock growth percentages (in real app, compare with previous period)
            const revenueGrowth = 12.5;
            const commissionGrowth = 8.3;

            setStats({
                totalRevenue: bookingRevenue + productRevenue,
                totalCommissions: bookingCommissions,
                bookingRevenue,
                productRevenue,
                pendingPayouts: 0, // Would calculate from payouts table
                completedPayouts: 0,
                revenueGrowth,
                commissionGrowth,
            });

            // Mock transactions data (in real app, fetch from a transactions table)
            const mockTransactions: Transaction[] = [
                {
                    id: '1',
                    type: 'booking',
                    reference_code: 'BK001234',
                    description: 'Home Cleaning Service',
                    amount: 2500,
                    commission: 250,
                    status: 'completed',
                    created_at: new Date().toISOString(),
                    provider_name: 'Clean Home BD',
                },
                {
                    id: '2',
                    type: 'order',
                    reference_code: 'ORD005678',
                    description: 'Electronic Accessories',
                    amount: 4500,
                    commission: 450,
                    status: 'completed',
                    created_at: new Date(Date.now() - 86400000).toISOString(),
                    seller_name: 'Tech Store BD',
                },
                {
                    id: '3',
                    type: 'refund',
                    reference_code: 'REF000001',
                    description: 'Order refund - Customer request',
                    amount: -1200,
                    commission: -120,
                    status: 'completed',
                    created_at: new Date(Date.now() - 172800000).toISOString(),
                },
            ];

            setTransactions(mockTransactions);
        } catch (error) {
            console.error('Error fetching financial data:', error);
        } finally {
            setIsLoading(false);
        }
    };



    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString()}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTypeBadge = (type: string) => {
        const typeMap: Record<string, { class: string; label: string }> = {
            booking: { class: 'primary', label: 'Booking' },
            order: { class: 'info', label: 'Order' },
            payout: { class: 'success', label: 'Payout' },
            refund: { class: 'warning', label: 'Refund' },
        };
        const t = typeMap[type] || { class: 'default', label: type };
        return <span className={`badge badge-${t.class}`}>{t.label}</span>;
    };

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/1234/admin" replace />;
    }

    return (
        <>
            <header className="admin-header">
                <div>
                    <h1>Financial Management</h1>
                    <p>Track revenue, commissions, and payouts</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-outline">
                        <Download size={16} /> Export Report
                    </button>
                </div>
            </header>

            {/* Date Range Filter */}
            <div className="filters-section">
                <div className="filter-group">
                    <Calendar size={18} />
                    <select
                        value={dateRange}
                        onChange={e => setDateRange(e.target.value)}
                    >
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="year">Last Year</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner" />
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="stats-grid financial-stats">
                        <div className="stat-card">
                            <div className="stat-header">
                                <span className="stat-label">Total Revenue</span>
                                <span className={`stat-change ${stats.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
                                    {stats.revenueGrowth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    {Math.abs(stats.revenueGrowth)}%
                                </span>
                            </div>
                            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                            <div className="stat-breakdown">
                                <span>Bookings: {formatCurrency(stats.bookingRevenue)}</span>
                                <span>Products: {formatCurrency(stats.productRevenue)}</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <span className="stat-label">Platform Commissions</span>
                                <span className={`stat-change ${stats.commissionGrowth >= 0 ? 'positive' : 'negative'}`}>
                                    {stats.commissionGrowth >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    {Math.abs(stats.commissionGrowth)}%
                                </span>
                            </div>
                            <div className="stat-value">{formatCurrency(stats.totalCommissions)}</div>
                            <div className="stat-breakdown">
                                <span>Avg. Rate: 10%</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <span className="stat-label">Pending Payouts</span>
                            </div>
                            <div className="stat-value warning">{formatCurrency(stats.pendingPayouts)}</div>
                            <div className="stat-breakdown">
                                <span>To providers & sellers</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-header">
                                <span className="stat-label">Completed Payouts</span>
                            </div>
                            <div className="stat-value success">{formatCurrency(stats.completedPayouts)}</div>
                            <div className="stat-breakdown">
                                <span>This period</span>
                            </div>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="data-section">
                        <div className="section-header">
                            <h2>Recent Transactions</h2>
                            <div className="filter-group">
                                <Filter size={16} />
                                <select
                                    value={typeFilter}
                                    onChange={e => setTypeFilter(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="booking">Bookings</option>
                                    <option value="order">Orders</option>
                                    <option value="payout">Payouts</option>
                                    <option value="refund">Refunds</option>
                                </select>
                            </div>
                        </div>

                        <div className="data-table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Reference</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Commission</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(txn => (
                                        <tr key={txn.id}>
                                            <td>{formatDate(txn.created_at)}</td>
                                            <td>{getTypeBadge(txn.type)}</td>
                                            <td><code className="reference-code">{txn.reference_code}</code></td>
                                            <td>
                                                <div className="txn-description">
                                                    <span>{txn.description}</span>
                                                    {txn.provider_name && <small>{txn.provider_name}</small>}
                                                    {txn.seller_name && <small>{txn.seller_name}</small>}
                                                </div>
                                            </td>
                                            <td className={txn.amount >= 0 ? 'amount-positive' : 'amount-negative'}>
                                                {formatCurrency(txn.amount)}
                                            </td>
                                            <td className={txn.commission >= 0 ? 'commission-positive' : 'commission-negative'}>
                                                {formatCurrency(txn.commission)}
                                            </td>
                                            <td>
                                                <span className={`badge badge-${txn.status === 'completed' ? 'success' : 'warning'}`}>
                                                    {txn.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

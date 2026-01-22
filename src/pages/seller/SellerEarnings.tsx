/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import {
    Wallet, TrendingUp, Clock, CheckCircle, Package
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import './SellerEarnings.css';

// OrderItem interface - data accessed via 'any'\ninterface _OrderItem {\n    id: string;\n    quantity: number;\n    price: number;\n    product: { name_en: string } | null;\n    order: {\n        id: string;\n        order_code: string;\n        status: string;\n        payment_status: string;\n        created_at: string;\n        customer: { full_name: string } | null;\n    } | null;\n}

interface Transaction {
    id: string;
    order_code: string;
    product_name: string;
    customer_name: string;
    amount: number;
    status: 'pending' | 'paid';
    date: string;
}

export default function SellerEarnings() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        totalSales: 0,
        thisMonth: 0,
        pendingPayouts: 0,
        totalOrders: 0,
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
            // Get seller's products
            const { data: products } = await (supabase
                .from('products') as any)
                .select('id')
                .eq('seller_id', user.id);

            const productIds = products?.map((p: any) => p.id) || [];
            if (productIds.length === 0) {
                setIsLoading(false);
                return;
            }

            // Get order items for seller's products
            const query = (supabase
                .from('product_order_items') as any)
                .select(`
                    id,
                    quantity,
                    price,
                    product:products(name_en),
                    order:product_orders(id, order_code, status, payment_status, created_at, customer:users!product_orders_customer_id_fkey(full_name))
                `)
                .in('product_id', productIds);

            const { data, error } = await query;
            if (error) throw error;

            // Calculate stats
            const items = data || [];
            const deliveredItems = items.filter((i: any) => (i as any).order?.status === 'delivered');
            const paidItems = deliveredItems.filter((i: any) => (i as any).order?.payment_status === 'paid');

            const totalSales = paidItems.reduce((sum: number, i: any) => sum + (i.quantity * i.price), 0);
            const pendingPayouts = deliveredItems
                .filter((i: any) => (i as any).order?.payment_status !== 'paid')
                .reduce((sum: number, i: any) => sum + (i.quantity * i.price), 0);

            // This month calculations
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);
            const thisMonthSales = paidItems
                .filter((i: any) => new Date((i as any).order?.created_at) >= startOfMonth)
                .reduce((sum: number, i: any) => sum + (i.quantity * i.price), 0);

            setStats({
                totalSales,
                thisMonth: thisMonthSales,
                pendingPayouts,
                totalOrders: [...new Set(items.map((i: any) => (i as any).order?.id))].length,
            });

            // Map to transactions
            const txns: Transaction[] = deliveredItems.map((i: any) => ({
                id: i.id,
                order_code: (i as any).order?.order_code || '',
                product_name: (i as any).product?.name_en || 'Product',
                customer_name: (i as any).order?.customer?.full_name || 'Customer',
                amount: i.quantity * i.price,
                status: (i as any).order?.payment_status === 'paid' ? 'paid' : 'pending',
                date: (i as any).order?.created_at,
            }));

            setTransactions(txns.slice(0, 20));
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
        <div className="seller-earnings-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Earnings</h1>
                    <p>Track your sales and payouts</p>
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
                        <span className="stat-value">৳{stats.totalSales.toLocaleString()}</span>
                        <span className="stat-label">Total Sales</span>
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
                        <span className="stat-value">৳{stats.pendingPayouts.toLocaleString()}</span>
                        <span className="stat-label">Pending Payouts</span>
                    </div>
                </div>

                <div className="stat-card info">
                    <div className="stat-icon">
                        <Package size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalOrders}</span>
                        <span className="stat-label">Total Orders</span>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="transactions-section">
                <div className="section-header">
                    <h2>Sales History</h2>
                </div>

                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Loading sales data...</p>
                    </div>
                ) : transactions.length > 0 ? (
                    <div className="transactions-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Order</th>
                                    <th>Product</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((txn) => (
                                    <tr key={txn.id}>
                                        <td className="order-code">#{txn.order_code}</td>
                                        <td>{txn.product_name}</td>
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
                        <h3>No sales yet</h3>
                        <p>Complete orders to see your earnings here</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, ShoppingCart, BarChart3, PieChart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import './SellerDashboard.css';

interface AnalyticsData {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    topProducts: { name: string; sales: number; revenue: number }[];
    monthlyOrders: { month: string; orders: number }[];
}

export default function SellerAnalytics() {
    const { user } = useAuthStore();
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        topProducts: [],
        monthlyOrders: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [user, period]);

    const fetchAnalytics = async () => {
        if (!user?.id) return;
        try {
            // Fetch products count
            const { count: productsCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('seller_id', user.id);

            // Fetch orders
            const { data: orders } = await supabase
                .from('orders')
                .select('id, total_amount, created_at, items')
                .order('created_at', { ascending: false });

            // Filter orders containing seller's products
            const sellerOrders = orders?.filter((order: any) => {
                return order.items?.some((item: any) => item.seller_id === user.id);
            }) || [];

            const totalRevenue = sellerOrders.reduce((sum: number, order: any) => {
                const sellerItems = order.items?.filter((item: any) => item.seller_id === user.id) || [];
                return sum + sellerItems.reduce((s: number, i: any) => s + (i.price * i.quantity), 0);
            }, 0);

            setAnalytics({
                totalProducts: productsCount || 0,
                totalOrders: sellerOrders.length,
                totalRevenue,
                avgOrderValue: sellerOrders.length > 0 ? totalRevenue / sellerOrders.length : 0,
                topProducts: [],
                monthlyOrders: []
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => `৳${amount.toLocaleString()}`;

    return (
        <div className="seller-page">
            <header className="page-header">
                <div>
                    <h1>Analytics & Insights</h1>
                    <p>Track your store performance and sales trends</p>
                </div>
                <div className="period-selector">
                    <button
                        className={`btn btn-sm ${period === '7d' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setPeriod('7d')}
                    >
                        7 Days
                    </button>
                    <button
                        className={`btn btn-sm ${period === '30d' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setPeriod('30d')}
                    >
                        30 Days
                    </button>
                    <button
                        className={`btn btn-sm ${period === '90d' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setPeriod('90d')}
                    >
                        90 Days
                    </button>
                </div>
            </header>

            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner" />
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                                <Package size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{analytics.totalProducts}</span>
                                <span className="stat-label">Total Products</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#dcfce7', color: '#22c55e' }}>
                                <ShoppingCart size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{analytics.totalOrders}</span>
                                <span className="stat-label">Total Orders</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                                <DollarSign size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{formatCurrency(analytics.totalRevenue)}</span>
                                <span className="stat-label">Total Revenue</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#f3e8ff', color: '#8b5cf6' }}>
                                <TrendingUp size={24} />
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{formatCurrency(analytics.avgOrderValue)}</span>
                                <span className="stat-label">Avg Order Value</span>
                            </div>
                        </div>
                    </div>

                    {/* Charts Placeholder */}
                    <div className="analytics-charts">
                        <div className="chart-card">
                            <h3><BarChart3 size={20} /> Sales Trend</h3>
                            <div className="chart-placeholder">
                                <BarChart3 size={64} />
                                <p>Sales chart will appear here when you have more data</p>
                            </div>
                        </div>
                        <div className="chart-card">
                            <h3><PieChart size={20} /> Product Performance</h3>
                            <div className="chart-placeholder">
                                <PieChart size={64} />
                                <p>Product breakdown will appear here</p>
                            </div>
                        </div>
                    </div>

                    {/* Tips Section */}
                    <div className="tips-section">
                        <h3>💡 Tips to Improve Sales</h3>
                        <ul>
                            <li>Add high-quality product images to increase clicks</li>
                            <li>Keep your product descriptions detailed and accurate</li>
                            <li>Respond to customer questions promptly</li>
                            <li>Offer competitive pricing and occasional discounts</li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}

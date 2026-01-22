/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Package, DollarSign, Star, ShoppingCart,
    ChevronRight, Plus, Eye, Edit2, Trash2, Bell
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import type { Product, ProductOrder } from '../../types/database';
import toast from 'react-hot-toast';
import './SellerDashboard.css';

export default function SellerDashboard() {
    const { user } = useAuthStore();

    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalSales: 0,
        avgRating: 0,
    });
    const [recentOrders, setRecentOrders] = useState<ProductOrder[]>([]);
    const [myProducts, setMyProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchDashboardData();
    }, [user?.id]);

    const fetchDashboardData = async () => {
        if (!user?.id) return;

        try {
            // Fetch products stats
            const { data: allProducts, count: totalProducts } = await (supabase
                .from('products') as any)
                .select('*', { count: 'exact' })
                .eq('seller_id', user.id);

            const activeProducts = allProducts?.filter((p: any) => p.status === 'active').length || 0;
            const productIds = allProducts?.map((p: any) => p.id) || [];

            // Fetch orders for seller's products
            let ordersData: any[] = [];
            if (productIds.length > 0) {
                const { data } = await (supabase
                    .from('product_order_items') as any)
                    .select('*, order:product_orders(*)')
                    .in('product_id', productIds);
                ordersData = data || [];
            }

            // Calculate stats
            const orders = ordersData || [];
            const pendingOrders = orders.filter(o => (o as any).order?.status === 'pending').length;
            const totalSales = orders.reduce((sum, o) => sum + (o.quantity * o.price), 0);

            // Fetch seller profile for ratings
            const { data: profile } = await (supabase
                .from('seller_profiles') as any)
                .select('avg_rating, total_ratings')
                .eq('user_id', user.id)
                .single();

            setStats({
                totalProducts: totalProducts || 0,
                activeProducts,
                totalOrders: orders.length,
                pendingOrders,
                totalSales,
                avgRating: profile?.avg_rating || 0,
            });

            // Fetch recent orders
            const { data: recentOrdersData } = await (supabase
                .from('product_orders') as any)
                .select('*, items:product_order_items(*), customer:users!product_orders_customer_id_fkey(full_name)')
                .order('created_at', { ascending: false })
                .limit(5);

            if (recentOrdersData) setRecentOrders(recentOrdersData as ProductOrder[]);

            // Fetch my products
            const { data: productsData } = await (supabase
                .from('products') as any)
                .select('*')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false })
                .limit(6);

            if (productsData) setMyProducts(productsData as Product[]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const { error } = await (supabase
                .from('products') as any)
                .delete()
                .eq('id', productId);

            if (error) throw error;

            toast.success('Product deleted');
            setMyProducts(prev => prev.filter(p => p.id !== productId));
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const getOrderStatus = (status: string) => {
        const statusMap: Record<string, { class: string; label: string }> = {
            pending: { class: 'warning', label: 'Pending' },
            confirmed: { class: 'info', label: 'Confirmed' },
            processing: { class: 'primary', label: 'Processing' },
            shipped: { class: 'secondary', label: 'Shipped' },
            delivered: { class: 'success', label: 'Delivered' },
            cancelled: { class: 'error', label: 'Cancelled' },
        };
        const s = statusMap[status] || { class: 'default', label: status };
        return <span className={`badge badge-${s.class}`}>{s.label}</span>;
    };

    return (
        <div className="seller-dashboard-content">
            {/* Page Header */}
            <header className="dashboard-header">
                <div>
                    <h1>Seller Dashboard</h1>
                    <p>Manage your products and orders</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-icon">
                        <Bell size={20} />
                    </button>
                    <Link to="/seller/products/new" className="btn btn-primary">
                        <Plus size={18} />
                        Add Product
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
                            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                <Package size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.totalProducts}</span>
                                <span className="stat-label">Total Products</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                <ShoppingCart size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.totalOrders}</span>
                                <span className="stat-label">Total Orders</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#16a34a' }}>
                                <DollarSign size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">৳{stats.totalSales.toLocaleString()}</span>
                                <span className="stat-label">Total Sales</span>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#f59e0b' }}>
                                <Star size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{stats.avgRating.toFixed(1)}</span>
                                <span className="stat-label">Avg Rating</span>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-grid">
                        {/* Recent Orders */}
                        <div className="section-card">
                            <div className="section-header">
                                <h2>Recent Orders</h2>
                                <Link to="/seller/orders" className="section-link">
                                    View All <ChevronRight size={16} />
                                </Link>
                            </div>

                            {recentOrders.length > 0 ? (
                                <div className="orders-list">
                                    {recentOrders.map((order) => (
                                        <div key={order.id} className="order-item">
                                            <div className="order-info">
                                                <h4>#{order.order_code}</h4>
                                                <p>
                                                    {(order as any).customer?.full_name} •
                                                    {(order as any).items?.length || 0} items
                                                </p>
                                            </div>
                                            <div className="order-meta">
                                                <span className="order-amount">৳{order.total_amount}</span>
                                                {getOrderStatus(order.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-small">
                                    <p>No orders yet</p>
                                </div>
                            )}
                        </div>

                        {/* My Products */}
                        <div className="section-card">
                            <div className="section-header">
                                <h2>My Products</h2>
                                <Link to="/seller/products" className="section-link">
                                    View All <ChevronRight size={16} />
                                </Link>
                            </div>

                            {myProducts.length > 0 ? (
                                <div className="products-grid-mini">
                                    {myProducts.map((product) => (
                                        <div key={product.id} className="product-card-mini">
                                            <div className="product-thumb">
                                                <img src={product.images?.[0] || '/placeholder-product.jpg'} alt={product.name_en} />
                                            </div>
                                            <div className="product-info">
                                                <h4>{product.name_en}</h4>
                                                <div className="product-meta">
                                                    <span className="price">
                                                        ৳{product.sale_price || product.regular_price}
                                                    </span>
                                                    <span className="stock">
                                                        {product.stock_quantity} in stock
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="product-actions">
                                                <Link to={`/products/${product.slug}`} className="btn btn-icon btn-sm">
                                                    <Eye size={14} />
                                                </Link>
                                                <Link to={`/seller/products/${product.id}/edit`} className="btn btn-icon btn-sm">
                                                    <Edit2 size={14} />
                                                </Link>
                                                <button className="btn btn-icon btn-sm" onClick={() => handleDeleteProduct(product.id)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-small">
                                    <p>No products yet</p>
                                    <Link to="/seller/products/new" className="btn btn-primary btn-sm">
                                        <Plus size={14} /> Add First Product
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

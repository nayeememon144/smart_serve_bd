/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import {
    Package, MapPin, User, Phone, CheckCircle, XCircle,
    Truck, Search
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './SellerOrders.css';

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    product: {
        name_en: string;
        images: string[] | null;
    };
}

interface Order {
    id: string;
    order_code: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded';
    total_amount: number;
    shipping_address: string;
    created_at: string;
    customer: {
        full_name: string;
        phone: string;
        email: string;
    };
    items: OrderItem[];
}

type TabType = 'all' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export default function SellerOrders() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const tabs: { key: TabType; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: orders.length },
        { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
        { key: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
        { key: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
        { key: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
        { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    ];

    useEffect(() => {
        fetchOrders();
    }, [user?.id]);

    useEffect(() => {
        filterOrders();
    }, [activeTab, searchQuery, orders]);

    const fetchOrders = async () => {
        if (!user?.id) return;

        try {
            // First get seller's product IDs
            const { data: products } = await (supabase
                .from('products') as any)
                .select('id')
                .eq('seller_id', user.id);

            const productIds = products?.map((p: any) => p.id) || [];
            if (productIds.length === 0) {
                setOrders([]);
                setIsLoading(false);
                return;
            }

            // Get orders that contain seller's products
            const { data: orderItems } = await (supabase
                .from('product_order_items') as any)
                .select('order_id')
                .in('product_id', productIds);

            const orderIds = [...new Set(orderItems?.map((oi: any) => oi.order_id) || [])];
            if (orderIds.length === 0) {
                setOrders([]);
                setIsLoading(false);
                return;
            }

            // Fetch full order details
            const { data, error } = await supabase
                .from('product_orders')
                .select(`
                    *,
                    customer:users!product_orders_customer_id_fkey(full_name, phone, email),
                    items:product_order_items(id, product_id, quantity, price, product:products(name_en, images))
                `)
                .in('id', orderIds)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data as Order[] || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        if (activeTab !== 'all') {
            filtered = filtered.filter(o => o.status === activeTab);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(o =>
                o.order_code.toLowerCase().includes(query) ||
                o.customer?.full_name.toLowerCase().includes(query)
            );
        }

        setFilteredOrders(filtered);
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setActionLoading(orderId);
        try {
            const { error } = await (supabase
                .from('product_orders') as any)
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            toast.success(`Order ${newStatus}`);
            setOrders(prev =>
                prev.map(o => o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o)
            );
        } catch (error) {
            toast.error('Failed to update order');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { class: string; label: string }> = {
            pending: { class: 'status-pending', label: 'Pending' },
            confirmed: { class: 'status-confirmed', label: 'Confirmed' },
            processing: { class: 'status-processing', label: 'Processing' },
            shipped: { class: 'status-shipped', label: 'Shipped' },
            delivered: { class: 'status-delivered', label: 'Delivered' },
            cancelled: { class: 'status-cancelled', label: 'Cancelled' },
        };
        const s = config[status] || config.pending;
        return <span className={`status-badge ${s.class}`}>{s.label}</span>;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getNextAction = (status: string) => {
        const actions: Record<string, { label: string; nextStatus: string; icon: React.ReactNode }> = {
            pending: { label: 'Confirm Order', nextStatus: 'confirmed', icon: <CheckCircle size={16} /> },
            confirmed: { label: 'Start Processing', nextStatus: 'processing', icon: <Package size={16} /> },
            processing: { label: 'Mark as Shipped', nextStatus: 'shipped', icon: <Truck size={16} /> },
            shipped: { label: 'Mark Delivered', nextStatus: 'delivered', icon: <CheckCircle size={16} /> },
        };
        return actions[status];
    };

    return (
        <div className="seller-orders-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>Orders Management</h1>
                    <p>Manage and fulfill customer orders</p>
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

            {/* Search */}
            <div className="filters-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by order code or customer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Orders List */}
            <div className="orders-container">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Loading orders...</p>
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="orders-list">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="order-card">
                                <div className="order-header">
                                    <div className="order-code">
                                        <span className="code">#{order.order_code}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                    <div className="order-amount">
                                        <span className="amount">৳{order.total_amount.toLocaleString()}</span>
                                        <span className="date">{formatDate(order.created_at)}</span>
                                    </div>
                                </div>

                                <div className="order-body">
                                    {/* Customer Info */}
                                    <div className="customer-info">
                                        <User size={16} />
                                        <span>{order.customer?.full_name}</span>
                                        <span className="separator">•</span>
                                        <Phone size={14} />
                                        <span>{order.customer?.phone || 'No phone'}</span>
                                    </div>

                                    {/* Shipping Address */}
                                    <div className="shipping-info">
                                        <MapPin size={16} />
                                        <span>{order.shipping_address || 'No address provided'}</span>
                                    </div>

                                    {/* Order Items */}
                                    <div className="order-items">
                                        <h4>Items ({order.items?.length || 0})</h4>
                                        <div className="items-list">
                                            {order.items?.slice(0, 3).map((item) => (
                                                <div key={item.id} className="item">
                                                    <div className="item-image">
                                                        <img
                                                            src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                                                            alt={item.product?.name_en}
                                                        />
                                                    </div>
                                                    <div className="item-details">
                                                        <span className="item-name">{item.product?.name_en}</span>
                                                        <span className="item-qty">Qty: {item.quantity} × ৳{item.price}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {order.items && order.items.length > 3 && (
                                                <span className="more-items">+{order.items.length - 3} more items</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="order-actions">
                                    {getNextAction(order.status) && (
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => handleStatusUpdate(order.id, getNextAction(order.status)!.nextStatus)}
                                            disabled={actionLoading === order.id}
                                        >
                                            {getNextAction(order.status)!.icon}
                                            {getNextAction(order.status)!.label}
                                        </button>
                                    )}
                                    {order.status === 'pending' && (
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                            disabled={actionLoading === order.id}
                                        >
                                            <XCircle size={16} />
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Package size={48} />
                        <h3>No orders found</h3>
                        <p>{activeTab !== 'all' ? `No ${activeTab} orders` : 'You haven\'t received any orders yet'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

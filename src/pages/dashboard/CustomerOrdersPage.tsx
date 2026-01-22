/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable react-hooks/exhaustive-deps */
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Package, Clock, Truck, Check, MapPin, Phone, Star,
    ChevronRight, MessageSquare
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import ReviewModal from '../../components/ReviewModal';
import './CustomerOrdersPage.css';

interface Order {
    id: string;
    order_code: string;
    status: string;
    payment_status: string;
    payment_method: string;
    subtotal: number;
    shipping_cost: number;
    total_amount: number;
    shipping_address_text: string;
    contact_phone: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

interface OrderItem {
    id: string;
    product_id: string;
    product_name: string;
    product_image: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

const statusSteps = [
    { key: 'pending_payment', label: 'Pending', icon: Clock },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Check },
];

export default function CustomerOrdersPage() {
    useTranslation();
    const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    // Review modal state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewItem, setReviewItem] = useState<{
        productId: string;
        productName: string;
        orderId: string;
    } | null>(null);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const { data, error } = await (supabase
                .from('product_orders') as any)
                .select(`
          *,
          items:product_order_items(*)
        `)
                .eq('customer_id', user?.id as string)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredOrders = () => {
        if (filter === 'all') return orders;
        return orders.filter(o => o.status === filter);
    };

    const getStatusIndex = (status: string) => {
        const index = statusSteps.findIndex(s => s.key === status);
        return index >= 0 ? index : 0;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'success';
            case 'cancelled': return 'error';
            case 'processing':
            case 'shipped': return 'primary';
            default: return 'warning';
        }
    };

    const handleWriteReview = (item: OrderItem, orderId: string) => {
        setReviewItem({
            productId: item.product_id,
            productName: item.product_name,
            orderId,
        });
        setShowReviewModal(true);
    };

    if (authLoading) {
        return (
            <div className="customer-orders-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login?redirect=/dashboard/orders" replace />;
    }

    const filteredOrders = getFilteredOrders();

    return (
        <div className="customer-orders-page">
            <div className="container">
                {/* Header */}
                <header className="page-header">
                    <div>
                        <h1>My Orders</h1>
                        <p>{orders.length} orders total</p>
                    </div>
                    <Link to="/products" className="btn btn-primary">
                        Continue Shopping
                    </Link>
                </header>

                {/* Filters */}
                <div className="order-filters">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All Orders
                    </button>
                    <button
                        className={`filter-btn ${filter === 'processing' ? 'active' : ''}`}
                        onClick={() => setFilter('processing')}
                    >
                        Processing
                    </button>
                    <button
                        className={`filter-btn ${filter === 'shipped' ? 'active' : ''}`}
                        onClick={() => setFilter('shipped')}
                    >
                        Shipped
                    </button>
                    <button
                        className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`}
                        onClick={() => setFilter('delivered')}
                    >
                        Delivered
                    </button>
                </div>

                {/* Orders List */}
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                ) : filteredOrders.length > 0 ? (
                    <div className="orders-list">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className={`order-card ${selectedOrder?.id === order.id ? 'expanded' : ''}`}
                            >
                                <div
                                    className="order-header"
                                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                >
                                    <div className="order-info">
                                        <span className="order-code">#{order.order_code}</span>
                                        <span className="order-date">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="order-summary">
                                        <span className="item-count">{order.items?.length || 0} items</span>
                                        <span className="order-total">৳{order.total_amount.toLocaleString()}</span>
                                    </div>
                                    <span className={`order-status status-${getStatusColor(order.status)}`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                    <ChevronRight
                                        size={20}
                                        className={`expand-icon ${selectedOrder?.id === order.id ? 'rotated' : ''}`}
                                    />
                                </div>

                                {selectedOrder?.id === order.id && (
                                    <div className="order-details">
                                        {/* Status Timeline */}
                                        {order.status !== 'cancelled' && (
                                            <div className="status-timeline">
                                                {statusSteps.map((step, index) => {
                                                    const currentIndex = getStatusIndex(order.status);
                                                    const isCompleted = index <= currentIndex;
                                                    const isCurrent = index === currentIndex;
                                                    const StepIcon = step.icon;

                                                    return (
                                                        <div
                                                            key={step.key}
                                                            className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                                                        >
                                                            <div className="step-icon">
                                                                <StepIcon size={18} />
                                                            </div>
                                                            <span className="step-label">{step.label}</span>
                                                            {index < statusSteps.length - 1 && (
                                                                <div className={`step-line ${isCompleted ? 'active' : ''}`} />
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Order Items */}
                                        <div className="order-items">
                                            <h4>Order Items</h4>
                                            {order.items?.map((item) => (
                                                <div key={item.id} className="order-item">
                                                    <img
                                                        src={item.product_image || '/placeholder-product.jpg'}
                                                        alt={item.product_name}
                                                    />
                                                    <div className="item-details">
                                                        <span className="item-name">{item.product_name}</span>
                                                        <span className="item-qty">Qty: {item.quantity}</span>
                                                    </div>
                                                    <span className="item-price">৳{item.total_price.toLocaleString()}</span>
                                                    {order.status === 'delivered' && (
                                                        <button
                                                            className="btn btn-sm btn-outline review-btn"
                                                            onClick={() => handleWriteReview(item, order.id)}
                                                        >
                                                            <Star size={14} />
                                                            Review
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Meta */}
                                        <div className="order-meta">
                                            <div className="meta-item">
                                                <MapPin size={16} />
                                                <div>
                                                    <strong>Delivery Address</strong>
                                                    <span>{order.shipping_address_text}</span>
                                                </div>
                                            </div>
                                            {order.contact_phone && (
                                                <div className="meta-item">
                                                    <Phone size={16} />
                                                    <div>
                                                        <strong>Contact</strong>
                                                        <span>{order.contact_phone}</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="meta-item">
                                                <MessageSquare size={16} />
                                                <div>
                                                    <strong>Payment</strong>
                                                    <span>{order.payment_method.toUpperCase()} - {order.payment_status}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Summary */}
                                        <div className="order-totals">
                                            <div className="total-row">
                                                <span>Subtotal</span>
                                                <span>৳{order.subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="total-row">
                                                <span>Shipping</span>
                                                <span>{order.shipping_cost === 0 ? 'Free' : `৳${order.shipping_cost}`}</span>
                                            </div>
                                            <div className="total-row grand">
                                                <span>Total</span>
                                                <span>৳{order.total_amount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Package size={48} />
                        <h3>No orders yet</h3>
                        <p>Start shopping to see your orders here</p>
                        <Link to="/products" className="btn btn-primary">
                            Browse Products
                        </Link>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewItem && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    itemType="product"
                    itemId={reviewItem.productId}
                    itemName={reviewItem.productName}
                    orderId={reviewItem.orderId}
                    onSuccess={fetchOrders}
                />
            )}
        </div>
    );
}

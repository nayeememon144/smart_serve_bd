/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Package, Truck, CheckCircle, Clock, MapPin,
    Calendar, ChevronRight, AlertCircle, Home, ShoppingBag
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './OrderTrackingPage.css';

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product?: {
        name_en: string;
        name_bn: string;
        images: string[];
    };
}

interface Order {
    id: string;
    order_code: string;
    customer_id: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
    payment_method: string;
    subtotal: number;
    shipping_cost: number;
    discount_amount: number;
    total_amount: number;
    shipping_address: string;
    shipping_area: string;
    shipping_city: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    items?: OrderItem[];
}

const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Clock },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderTrackingPage() {
    const { i18n } = useTranslation();
    const { orderCode } = useParams<{ orderCode: string }>();
    const currentLang = i18n.language;

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (orderCode) {
            fetchOrder();
        }
    }, [orderCode]);

    const fetchOrder = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data, error: fetchError } = await (supabase
                .from('product_orders') as any)
                .select(`
                    *,
                    items:product_order_items(
                        id,
                        product_id,
                        quantity,
                        unit_price,
                        total_price,
                        product:products(name_en, name_bn, images)
                    )
                `)
                .eq('order_code', orderCode as string)
                .single();

            if (fetchError) throw fetchError;
            if (!data) {
                setError('Order not found');
                return;
            }

            setOrder(data as Order);
        } catch (err) {
            console.error('Error fetching order:', err);
            setError('Failed to load order details');
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentStepIndex = () => {
        if (!order) return 0;
        if (order.status === 'cancelled') return -1;
        return statusSteps.findIndex(s => s.key === order.status);
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { class: string; label: string }> = {
            pending: { class: 'warning', label: 'Pending' },
            confirmed: { class: 'info', label: 'Confirmed' },
            processing: { class: 'primary', label: 'Processing' },
            shipped: { class: 'info', label: 'Shipped' },
            delivered: { class: 'success', label: 'Delivered' },
            cancelled: { class: 'error', label: 'Cancelled' },
        };
        const s = statusMap[status] || { class: 'default', label: status };
        return <span className={`badge badge-${s.class}`}>{s.label}</span>;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="order-tracking-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="order-tracking-page">
                <div className="container">
                    <div className="error-state">
                        <AlertCircle size={48} />
                        <h2>{error || 'Order not found'}</h2>
                        <p>The order you're looking for doesn't exist or you don't have access to it.</p>
                        <Link to="/dashboard" className="btn btn-primary">
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const currentStep = getCurrentStepIndex();

    return (
        <div className="order-tracking-page">
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/dashboard">Dashboard</Link>
                    <ChevronRight size={14} />
                    <span>Order #{order.order_code}</span>
                </div>

                {/* Order Header */}
                <div className="order-header">
                    <div className="order-info">
                        <h1>Order #{order.order_code}</h1>
                        <div className="order-meta">
                            <span><Calendar size={16} /> {formatDate(order.created_at)}</span>
                            {getStatusBadge(order.status)}
                        </div>
                    </div>
                </div>

                {/* Order Status Tracker */}
                {order.status !== 'cancelled' ? (
                    <div className="status-tracker">
                        <div className="tracker-steps">
                            {statusSteps.map((step, index) => {
                                const StepIcon = step.icon;
                                const isCompleted = index <= currentStep;
                                const isCurrent = index === currentStep;

                                return (
                                    <div
                                        key={step.key}
                                        className={`tracker-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                                    >
                                        <div className="step-icon">
                                            <StepIcon size={24} />
                                        </div>
                                        <div className="step-label">{step.label}</div>
                                        {index < statusSteps.length - 1 && (
                                            <div className={`step-line ${index < currentStep ? 'completed' : ''}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="cancelled-notice">
                        <AlertCircle size={24} />
                        <div>
                            <h3>Order Cancelled</h3>
                            <p>This order has been cancelled.</p>
                        </div>
                    </div>
                )}

                <div className="order-content">
                    {/* Order Items */}
                    <div className="order-items-section">
                        <h2>Order Items</h2>
                        <div className="order-items-list">
                            {order.items?.map(item => (
                                <div key={item.id} className="order-item">
                                    <div className="item-image">
                                        <img
                                            src={item.product?.images?.[0] || '/placeholder-product.jpg'}
                                            alt={currentLang === 'bn' ? item.product?.name_bn : item.product?.name_en}
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h4>{currentLang === 'bn' ? item.product?.name_bn : item.product?.name_en}</h4>
                                        <div className="item-meta">
                                            <span>Qty: {item.quantity}</span>
                                            <span>৳{item.unit_price.toLocaleString()} each</span>
                                        </div>
                                    </div>
                                    <div className="item-price">
                                        ৳{item.total_price.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="order-summary">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>৳{order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>৳{order.shipping_cost.toLocaleString()}</span>
                            </div>
                            {order.discount_amount > 0 && (
                                <div className="summary-row discount">
                                    <span>Discount</span>
                                    <span>-৳{order.discount_amount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>Total</span>
                                <span>৳{order.total_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="order-sidebar">
                        <div className="sidebar-card">
                            <h3><MapPin size={18} /> Shipping Address</h3>
                            <p className="address">
                                {order.shipping_address}<br />
                                {order.shipping_area}, {order.shipping_city}
                            </p>
                        </div>

                        <div className="sidebar-card">
                            <h3><ShoppingBag size={18} /> Payment</h3>
                            <div className="payment-info">
                                <div className="payment-row">
                                    <span>Method:</span>
                                    <span className="capitalize">{order.payment_method}</span>
                                </div>
                                <div className="payment-row">
                                    <span>Status:</span>
                                    {getStatusBadge(order.payment_status === 'paid' ? 'delivered' : 'pending')}
                                </div>
                            </div>
                        </div>

                        {order.notes && (
                            <div className="sidebar-card">
                                <h3>Order Notes</h3>
                                <p className="notes">{order.notes}</p>
                            </div>
                        )}

                        <div className="sidebar-actions">
                            <Link to="/contact" className="btn btn-outline btn-block">
                                Need Help?
                            </Link>
                            <Link to="/products" className="btn btn-primary btn-block">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

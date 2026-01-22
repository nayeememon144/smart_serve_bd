/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    ChevronLeft, MapPin, CreditCard, Truck, Shield, Check,
    AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import type { UserAddress } from '../../types/database';
import toast from 'react-hot-toast';
import './CheckoutPage.css';

type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'card';

export default function CheckoutPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { items, getTotal, getItemCount, clearCart } = useCartStore();
    const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping');

    const currentLang = i18n.language as 'en' | 'bn';
    const subtotal = getTotal();
    const shippingCost = subtotal >= 1000 ? 0 : 60;
    const total = subtotal + shippingCost;

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        try {
            const { data, error } = await (supabase
                .from('user_addresses') as any)
                .select('*')
                .eq('user_id', user?.id)
                .order('is_default', { ascending: false });

            if (error) throw error;
            setAddresses(data || []);

            // Auto-select default address
            const defaultAddr = data?.find((a: any) => a.is_default);
            if (defaultAddr) {
                setSelectedAddress(defaultAddr.id);
            } else if (data && data.length > 0) {
                setSelectedAddress((data as any)[0].id);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select a delivery address');
            setStep('shipping');
            return;
        }

        if (items.length === 0) {
            toast.error('Your cart is empty');
            navigate('/cart');
            return;
        }

        setIsSubmitting(true);

        try {
            const address = addresses.find(a => a.id === selectedAddress);
            const addressText = address
                ? `${address.address_line1}, ${address.area}, ${address.city}`
                : '';

            // Create order
            const { data: order, error: orderError } = await (supabase
                .from('product_orders') as any)
                .insert({
                    customer_id: user?.id,
                    shipping_address_id: selectedAddress,
                    shipping_address_text: addressText,
                    contact_phone: user?.phone || '',
                    status: paymentMethod === 'cod' ? 'processing' : 'pending_payment',
                    payment_status: paymentMethod === 'cod' ? 'pending' : 'pending',
                    payment_method: paymentMethod,
                    subtotal,
                    shipping_cost: shippingCost,
                    discount_amount: 0,
                    tax_amount: 0,
                    total_amount: total,
                    notes,
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Create order items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.product.id,
                seller_id: item.product.seller_id,
                product_name: item.product.name_en,
                product_image: item.product.images?.[0] || '',
                quantity: item.quantity,
                unit_price: item.product.sale_price || item.product.regular_price,
                total_price: (item.product.sale_price || item.product.regular_price) * item.quantity,
            }));

            const { error: itemsError } = await (supabase
                .from('product_order_items') as any)
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Clear cart
            clearCart();

            // Navigate to success page
            toast.success('Order placed successfully!');
            navigate(`/order-success/${order.order_code}`);
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="checkout-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login?redirect=/checkout" replace />;
    }

    if (items.length === 0) {
        return <Navigate to="/cart" replace />;
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <header className="checkout-header">
                    <Link to="/cart" className="back-link">
                        <ChevronLeft size={20} />
                        Back to Cart
                    </Link>
                    <h1>{t('checkout.title')}</h1>
                </header>

                {/* Progress Steps */}
                <div className="checkout-steps">
                    <button
                        className={`step ${step === 'shipping' ? 'active' : ''} ${['payment', 'review'].includes(step) ? 'completed' : ''}`}
                        onClick={() => setStep('shipping')}
                    >
                        <span className="step-number">1</span>
                        <span className="step-label">{t('checkout.shipping')}</span>
                    </button>
                    <div className="step-line" />
                    <button
                        className={`step ${step === 'payment' ? 'active' : ''} ${step === 'review' ? 'completed' : ''}`}
                        onClick={() => selectedAddress && setStep('payment')}
                        disabled={!selectedAddress}
                    >
                        <span className="step-number">2</span>
                        <span className="step-label">{t('checkout.payment')}</span>
                    </button>
                    <div className="step-line" />
                    <button
                        className={`step ${step === 'review' ? 'active' : ''}`}
                        onClick={() => selectedAddress && setStep('review')}
                        disabled={!selectedAddress}
                    >
                        <span className="step-number">3</span>
                        <span className="step-label">{t('checkout.review')}</span>
                    </button>
                </div>

                <div className="checkout-layout">
                    {/* Main Content */}
                    <div className="checkout-main">
                        {/* Shipping Step */}
                        {step === 'shipping' && (
                            <div className="checkout-section">
                                <div className="section-header">
                                    <MapPin size={20} />
                                    <h2>Delivery Address</h2>
                                </div>

                                {addresses.length > 0 ? (
                                    <div className="address-list">
                                        {addresses.map((addr) => (
                                            <label
                                                key={addr.id}
                                                className={`address-option ${selectedAddress === addr.id ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={addr.id}
                                                    checked={selectedAddress === addr.id}
                                                    onChange={() => setSelectedAddress(addr.id)}
                                                />
                                                <div className="address-content">
                                                    <div className="address-label">
                                                        {addr.label || 'Address'}
                                                        {addr.is_default && <span className="default-badge">Default</span>}
                                                    </div>
                                                    <div className="address-text">
                                                        {addr.address_line1}
                                                        {addr.address_line2 && `, ${addr.address_line2}`}
                                                    </div>
                                                    <div className="address-area">
                                                        {addr.area}, {addr.city}
                                                        {addr.postal_code && ` - ${addr.postal_code}`}
                                                    </div>
                                                </div>
                                                <Check className="check-icon" size={20} />
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-address">
                                        <AlertCircle size={24} />
                                        <p>No saved addresses. Please add a delivery address.</p>
                                        <Link to="/dashboard/addresses" className="btn btn-outline">
                                            Add Address
                                        </Link>
                                    </div>
                                )}

                                <button
                                    className="btn btn-primary continue-btn"
                                    onClick={() => setStep('payment')}
                                    disabled={!selectedAddress}
                                >
                                    Continue to Payment
                                </button>
                            </div>
                        )}

                        {/* Payment Step */}
                        {step === 'payment' && (
                            <div className="checkout-section">
                                <div className="section-header">
                                    <CreditCard size={20} />
                                    <h2>Payment Method</h2>
                                </div>

                                <div className="payment-options">
                                    <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="cod"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                        />
                                        <div className="payment-content">
                                            <span className="payment-name">Cash on Delivery</span>
                                            <span className="payment-desc">Pay when you receive your order</span>
                                        </div>
                                        <Check className="check-icon" size={20} />
                                    </label>

                                    <label className={`payment-option ${paymentMethod === 'bkash' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="bkash"
                                            checked={paymentMethod === 'bkash'}
                                            onChange={() => setPaymentMethod('bkash')}
                                        />
                                        <div className="payment-content">
                                            <span className="payment-name">bKash</span>
                                            <span className="payment-desc">Pay with bKash mobile wallet</span>
                                        </div>
                                        <Check className="check-icon" size={20} />
                                    </label>

                                    <label className={`payment-option ${paymentMethod === 'nagad' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="nagad"
                                            checked={paymentMethod === 'nagad'}
                                            onChange={() => setPaymentMethod('nagad')}
                                        />
                                        <div className="payment-content">
                                            <span className="payment-name">Nagad</span>
                                            <span className="payment-desc">Pay with Nagad mobile wallet</span>
                                        </div>
                                        <Check className="check-icon" size={20} />
                                    </label>

                                    <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                        />
                                        <div className="payment-content">
                                            <span className="payment-name">Credit/Debit Card</span>
                                            <span className="payment-desc">Visa, Mastercard, AMEX</span>
                                        </div>
                                        <Check className="check-icon" size={20} />
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Order Notes (Optional)</label>
                                    <textarea
                                        className="form-input"
                                        rows={3}
                                        placeholder="Any special instructions for your order..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <div className="step-actions">
                                    <button className="btn btn-outline" onClick={() => setStep('shipping')}>
                                        Back
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setStep('review')}
                                    >
                                        Review Order
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Review Step */}
                        {step === 'review' && (
                            <div className="checkout-section">
                                <div className="section-header">
                                    <Shield size={20} />
                                    <h2>Review Your Order</h2>
                                </div>

                                <div className="review-section">
                                    <h3>Delivery Address</h3>
                                    {addresses.find(a => a.id === selectedAddress) && (
                                        <div className="review-content">
                                            {(() => {
                                                const addr = addresses.find(a => a.id === selectedAddress)!;
                                                return (
                                                    <>
                                                        <p>{addr.address_line1}</p>
                                                        <p>{addr.area}, {addr.city}</p>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>

                                <div className="review-section">
                                    <h3>Payment Method</h3>
                                    <div className="review-content">
                                        <p>
                                            {paymentMethod === 'cod' && 'Cash on Delivery'}
                                            {paymentMethod === 'bkash' && 'bKash'}
                                            {paymentMethod === 'nagad' && 'Nagad'}
                                            {paymentMethod === 'card' && 'Credit/Debit Card'}
                                        </p>
                                    </div>
                                </div>

                                <div className="review-section">
                                    <h3>Order Items ({getItemCount()})</h3>
                                    <div className="review-items">
                                        {items.map((item) => (
                                            <div key={item.id} className="review-item">
                                                <img
                                                    src={item.product.images?.[0] || '/placeholder-product.jpg'}
                                                    alt={item.product.name_en}
                                                />
                                                <div className="item-info">
                                                    <span className="name">
                                                        {currentLang === 'en' ? item.product.name_en : item.product.name_bn}
                                                    </span>
                                                    <span className="qty">Qty: {item.quantity}</span>
                                                </div>
                                                <span className="price">
                                                    ৳{((item.product.sale_price || item.product.regular_price) * item.quantity).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="step-actions">
                                    <button className="btn btn-outline" onClick={() => setStep('payment')}>
                                        Back
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handlePlaceOrder}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Placing Order...' : 'Place Order'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="checkout-sidebar">
                        <div className="order-summary">
                            <h2>Order Summary</h2>

                            <div className="summary-items">
                                {items.slice(0, 3).map((item) => (
                                    <div key={item.id} className="summary-item">
                                        <img
                                            src={item.product.images?.[0] || '/placeholder-product.jpg'}
                                            alt={item.product.name_en}
                                        />
                                        <div className="item-details">
                                            <span className="name">
                                                {currentLang === 'en' ? item.product.name_en : item.product.name_bn}
                                            </span>
                                            <span className="qty">x{item.quantity}</span>
                                        </div>
                                        <span className="price">
                                            ৳{((item.product.sale_price || item.product.regular_price) * item.quantity).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                {items.length > 3 && (
                                    <div className="more-items">
                                        + {items.length - 3} more items
                                    </div>
                                )}
                            </div>

                            <div className="summary-totals">
                                <div className="total-row">
                                    <span>Subtotal</span>
                                    <span>৳{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="total-row">
                                    <span>Shipping</span>
                                    <span className={shippingCost === 0 ? 'free' : ''}>
                                        {shippingCost === 0 ? 'Free' : `৳${shippingCost}`}
                                    </span>
                                </div>
                                <div className="total-row grand">
                                    <span>Total</span>
                                    <span>৳{total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="security-badges">
                                <div className="badge">
                                    <Shield size={16} />
                                    <span>Secure Checkout</span>
                                </div>
                                <div className="badge">
                                    <Truck size={16} />
                                    <span>Fast Delivery</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

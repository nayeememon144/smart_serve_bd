import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import './CartPage.css';

export default function CartPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { items, updateQuantity, removeItem, getTotal, getItemCount, clearCart } = useCartStore();
    const { isAuthenticated } = useAuthStore();

    const currentLang = i18n.language as 'en' | 'bn';
    const total = getTotal();
    const itemCount = getItemCount();
    const shippingCost = total >= 1000 ? 0 : 60;
    const grandTotal = total + shippingCost;

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login?redirect=/checkout');
            return;
        }
        navigate('/checkout');
    };

    if (items.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <ShoppingBag size={64} />
                        <h2>{t('cart.emptyTitle')}</h2>
                        <p>{t('cart.emptyMessage')}</p>
                        <Link to="/products" className="btn btn-primary">
                            {t('cart.continueShopping')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <header className="cart-header">
                    <h1>{t('cart.title')}</h1>
                    <span className="item-count">{itemCount} {t('cart.items')}</span>
                </header>

                <div className="cart-layout">
                    {/* Cart Items */}
                    <div className="cart-items">
                        {items.map((item) => {
                            const product = item.product;
                            const productName = currentLang === 'en' ? product.name_en : product.name_bn;
                            const price = product.sale_price || product.regular_price;

                            return (
                                <div key={item.id} className="cart-item">
                                    <div className="item-image">
                                        <img
                                            src={product.images?.[0] || '/placeholder-product.jpg'}
                                            alt={productName}
                                        />
                                    </div>

                                    <div className="item-details">
                                        <Link to={`/products/${product.slug}`} className="item-name">
                                            {productName}
                                        </Link>
                                        <div className="item-meta">
                                            <span className="unit-price">৳{price.toLocaleString()}</span>
                                            {product.sale_price && (
                                                <span className="original-price">৳{product.regular_price.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="item-quantity">
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(product.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => updateQuantity(product.id, item.quantity + 1)}
                                            disabled={item.quantity >= product.stock_quantity}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <div className="item-total">
                                        ৳{(price * item.quantity).toLocaleString()}
                                    </div>

                                    <button
                                        className="remove-btn"
                                        onClick={() => removeItem(product.id)}
                                        title="Remove"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            );
                        })}

                        <div className="cart-actions">
                            <button className="btn btn-outline" onClick={clearCart}>
                                {t('cart.clearCart')}
                            </button>
                            <Link to="/products" className="btn btn-outline">
                                {t('cart.continueShopping')}
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <h2>{t('cart.orderSummary')}</h2>

                        <div className="summary-rows">
                            <div className="summary-row">
                                <span>{t('cart.subtotal')}</span>
                                <span>৳{total.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>{t('cart.shipping')}</span>
                                <span className={shippingCost === 0 ? 'free' : ''}>
                                    {shippingCost === 0 ? t('cart.free') : `৳${shippingCost}`}
                                </span>
                            </div>
                            {shippingCost > 0 && (
                                <div className="free-shipping-hint">
                                    {t('cart.freeShippingHint', { amount: 1000 - total })}
                                </div>
                            )}
                            <div className="summary-row total">
                                <span>{t('cart.total')}</span>
                                <span>৳{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary checkout-btn"
                            onClick={handleCheckout}
                        >
                            {t('cart.proceedToCheckout')}
                            <ArrowRight size={18} />
                        </button>

                        <div className="payment-methods">
                            <span>We Accept:</span>
                            <div className="methods">
                                <img src="/icons/bkash.svg" alt="bKash" />
                                <img src="/icons/nagad.svg" alt="Nagad" />
                                <img src="/icons/visa.svg" alt="Visa" />
                                <img src="/icons/mastercard.svg" alt="Mastercard" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

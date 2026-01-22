import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import './OrderSuccessPage.css';

export default function OrderSuccessPage() {
    const { orderCode } = useParams();

    return (
        <div className="order-success-page">
            <div className="container">
                <div className="success-card">
                    <div className="success-icon">
                        <CheckCircle size={64} />
                    </div>

                    <h1>Order Placed Successfully!</h1>
                    <p className="success-message">
                        Thank you for your order. We've received your order and will begin processing it soon.
                    </p>

                    {orderCode && (
                        <div className="order-info">
                            <span className="label">Order Number:</span>
                            <span className="order-code">{orderCode}</span>
                        </div>
                    )}

                    <div className="order-details">
                        <p>
                            You will receive an email confirmation shortly with the order details.
                        </p>
                        <p>
                            You can track your order status from your dashboard.
                        </p>
                    </div>

                    <div className="success-actions">
                        <Link to="/dashboard/orders" className="btn btn-primary">
                            <Package size={18} />
                            View My Orders
                        </Link>
                        <Link to="/products" className="btn btn-outline">
                            Continue Shopping
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="contact-info">
                        <p>
                            Need help? <Link to="/contact">Contact our support team</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

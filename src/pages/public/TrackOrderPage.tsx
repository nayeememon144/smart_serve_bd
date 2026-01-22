import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Package, ChevronRight, Truck, ShoppingBag } from 'lucide-react';
import './TrackOrderPage.css';

export default function TrackOrderPage() {
    const navigate = useNavigate();
    const [orderCode, setOrderCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderCode.trim()) {
            setError('Please enter an order code');
            return;
        }
        setError('');
        navigate(`/orders/${orderCode.trim().toUpperCase()}`);
    };

    return (
        <div className="track-order-page">
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <ChevronRight size={14} />
                    <span>Track Order</span>
                </div>

                {/* Hero Section */}
                <div className="track-hero">
                    <div className="hero-icon">
                        <Truck size={48} />
                    </div>
                    <h1>Track Your Order</h1>
                    <p>Enter your order code to see the real-time status of your order</p>
                </div>

                {/* Search Form */}
                <form className="track-form" onSubmit={handleSubmit}>
                    <div className="search-input-wrapper">
                        <Search size={20} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Enter your order code (e.g., ORD-ABC123)"
                            value={orderCode}
                            onChange={(e) => {
                                setOrderCode(e.target.value.toUpperCase());
                                setError('');
                            }}
                            className={error ? 'error' : ''}
                        />
                    </div>
                    {error && <span className="error-message">{error}</span>}
                    <button type="submit" className="btn btn-primary btn-lg">
                        <Package size={20} />
                        Track Order
                    </button>
                </form>

                {/* Help Section */}
                <div className="track-help">
                    <h3>Where can I find my order code?</h3>
                    <ul>
                        <li>
                            <ShoppingBag size={18} />
                            <span>Check your order confirmation email</span>
                        </li>
                        <li>
                            <Package size={18} />
                            <span>Visit your <Link to="/dashboard">Dashboard</Link> to see all orders</span>
                        </li>
                    </ul>
                </div>

                {/* Features */}
                <div className="track-features">
                    <div className="feature-card">
                        <div className="feature-icon">📦</div>
                        <h4>Real-time Updates</h4>
                        <p>Get instant updates on your order status</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🚚</div>
                        <h4>Delivery Tracking</h4>
                        <p>Track your package from warehouse to doorstep</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📱</div>
                        <h4>Easy Access</h4>
                        <p>Track anytime, anywhere on any device</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

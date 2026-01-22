/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import './ProviderDashboard.css';

interface Review {
    id: string;
    rating: number;
    review_text: string;
    created_at: string;
    status: string;
    service: { title_en: string } | null;
    customer: { full_name: string } | null;
}

export default function ProviderReviews() {
    const { user } = useAuthStore();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');

     
    useEffect(() => {
        fetchReviews();
    }, [user]);

    const fetchReviews = async () => {
        if (!user?.id) return;
        try {
            // Get provider's services first
            const { data: services } = await supabase
                .from('services')
                .select('id')
                .eq('provider_id', user.id);

            if (services && services.length > 0) {
                const serviceIds = (services as { id: string }[]).map(s => s.id);
                const { data: reviewsData, error } = await supabase
                    .from('service_reviews')
                    .select(`
                        id, rating, review_text, created_at, status,
                        service:services(title_en),
                        customer:users!service_reviews_customer_id_fkey(full_name)
                    `)
                    .in('service_id', serviceIds)
                    .order('created_at', { ascending: false });

                if (!error && reviewsData) {
                    setReviews(reviewsData as any);
                }
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredReviews = reviews.filter(r => {
        if (filter === 'positive') return r.rating >= 4;
        if (filter === 'negative') return r.rating <= 2;
        return true;
    });

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0';

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    return (
        <div className="provider-dashboard-content">
            <header className="dashboard-header">
                <div>
                    <h1>Service Reviews</h1>
                    <p>See what customers are saying about your services</p>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                        <Star size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{avgRating}</span>
                        <span className="stat-label">Average Rating</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                        <MessageSquare size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{reviews.length}</span>
                        <span className="stat-label">Total Reviews</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dcfce7', color: '#22c55e' }}>
                        <ThumbsUp size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{reviews.filter(r => r.rating >= 4).length}</span>
                        <span className="stat-label">Positive Reviews</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="filter-group">
                    <Filter size={16} />
                    <select value={filter} onChange={e => setFilter(e.target.value as any)}>
                        <option value="all">All Reviews</option>
                        <option value="positive">Positive (4-5 ★)</option>
                        <option value="negative">Negative (1-2 ★)</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            <div className="dashboard-content">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="empty-state">
                        <Star size={48} />
                        <h3>No reviews yet</h3>
                        <p>Reviews will appear here when customers rate your services</p>
                    </div>
                ) : (
                    <div className="reviews-list">
                        {filteredReviews.map(review => (
                            <div key={review.id} className="review-card">
                                <div className="review-header">
                                    <div className="reviewer-info">
                                        <div className="avatar">
                                            {(review.customer as any)?.full_name?.charAt(0) || 'C'}
                                        </div>
                                        <div>
                                            <span className="reviewer-name">
                                                {(review.customer as any)?.full_name || 'Customer'}
                                            </span>
                                            <span className="review-date">{formatDate(review.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="rating-stars">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star
                                                key={star}
                                                size={16}
                                                fill={star <= review.rating ? '#f59e0b' : 'none'}
                                                color={star <= review.rating ? '#f59e0b' : '#d1d5db'}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="service-name">
                                    Service: {(review.service as any)?.title_en || 'Unknown Service'}
                                </p>
                                {review.review_text && (
                                    <p className="review-text">"{review.review_text}"</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

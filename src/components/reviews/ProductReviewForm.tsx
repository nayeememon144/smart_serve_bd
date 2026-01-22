/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './ProductReview.css';

interface ProductReviewFormProps {
    productId: string;
    onReviewSubmitted: () => void;
    onClose: () => void;
}

export default function ProductReviewForm({ productId, onReviewSubmitted, onClose }: ProductReviewFormProps) {
    const { user, isAuthenticated } = useAuthStore();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isAuthenticated) {
            toast.error('Please login to submit a review');
            return;
        }

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('product_reviews')
                .insert({
                    product_id: productId,
                    customer_id: user?.id,
                    rating,
                    review_text: reviewText || null,
                } as any);

            if (error) throw error;

            // Update product average rating
            const { data: reviews } = await (supabase
                .from('product_reviews') as any)
                .select('rating')
                .eq('product_id', productId);

            if (reviews && reviews.length > 0) {
                const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;
                await (supabase
                    .from('products') as any)
                    .update({
                        avg_rating: avgRating,
                        total_ratings: reviews.length
                    })
                    .eq('id', productId);
            }

            toast.success('Review submitted successfully!');
            onReviewSubmitted();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="review-modal-overlay" onClick={onClose}>
            <div className="review-modal" onClick={e => e.stopPropagation()}>
                <div className="review-modal-header">
                    <h3>Write a Review</h3>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="review-form">
                    <div className="rating-selector">
                        <label>Your Rating</label>
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                >
                                    <Star
                                        size={28}
                                        fill={star <= (hoverRating || rating) ? '#f59e0b' : 'none'}
                                        color={star <= (hoverRating || rating) ? '#f59e0b' : '#d1d5db'}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <span className="rating-label">
                                {rating === 1 && 'Poor'}
                                {rating === 2 && 'Fair'}
                                {rating === 3 && 'Good'}
                                {rating === 4 && 'Very Good'}
                                {rating === 5 && 'Excellent'}
                            </span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="review">Your Review (Optional)</label>
                        <textarea
                            id="review"
                            rows={4}
                            placeholder="Share your experience with this product..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            <Send size={16} />
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

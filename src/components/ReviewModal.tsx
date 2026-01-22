/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import './ReviewModal.css';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemType: 'service' | 'product';
    itemId: string;
    itemName: string;
    bookingId?: string;
    orderId?: string;
    onSuccess?: () => void;
}

export default function ReviewModal({
    isOpen,
    onClose,
    itemType,
    itemId,
    itemName,
    bookingId,
    orderId,
    onSuccess,
}: ReviewModalProps) {
    const { user } = useAuthStore();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please write a review');
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await (supabase.from('reviews') as any).insert({
                user_id: user?.id,
                item_type: itemType,
                item_id: itemId,
                booking_id: bookingId || null,
                order_id: orderId || null,
                rating,
                comment: comment.trim(),
                status: 'pending', // Will be moderated before appearing
            });

            if (error) throw error;

            toast.success('Review submitted successfully!');
            onSuccess?.();
            onClose();
            setRating(0);
            setComment('');
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const displayRating = hoverRating || rating;

    const getRatingText = (r: number) => {
        switch (r) {
            case 1: return 'Poor';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Very Good';
            case 5: return 'Excellent';
            default: return 'Select rating';
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content review-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Write a Review</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="review-item-info">
                            <span>{itemType === 'service' ? 'Service:' : 'Product:'}</span>
                            <strong>{itemName}</strong>
                        </div>

                        {/* Star Rating */}
                        <div className="rating-section">
                            <label>Your Rating</label>
                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-btn ${star <= displayRating ? 'active' : ''}`}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            size={32}
                                            fill={star <= displayRating ? '#f59e0b' : 'none'}
                                            color="#f59e0b"
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="rating-text">{getRatingText(displayRating)}</span>
                        </div>

                        {/* Comment */}
                        <div className="form-group">
                            <label className="form-label">Your Review</label>
                            <textarea
                                className="form-input"
                                rows={4}
                                placeholder="Share your experience with this service/product. What did you like? What could be improved?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                            />
                            <span className="char-count">{comment.length}/500</span>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-outline" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting || rating === 0}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

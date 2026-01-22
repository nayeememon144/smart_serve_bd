/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
    Search, Star, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './AdminStyles.css';

interface Review {
    id: string;
    rating: number;
    comment: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    item_type: 'service' | 'product';
    item_id: string;
    user?: {
        full_name: string;
        email: string;
    };
}



export default function AdminReviews() {
    const { user, isAuthenticated } = useAuthStore();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchReviews();
        }
    }, [user, page, searchQuery, statusFilter, typeFilter]);

    const fetchReviews = async () => {
        try {
            setIsLoading(true);

            let query = (supabase
                .from('reviews') as any)
                .select(`
                    *,
                    user:users(full_name, email)
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            if (typeFilter !== 'all') {
                query = query.eq('item_type', typeFilter);
            }

            const { data, count, error } = await query;

            if (error) throw error;
            setReviews(data as Review[]);
            setTotalCount(count || 0);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (reviewId: string, newStatus: Review['status']) => {
        try {
            const { error } = await (supabase
                .from('reviews') as any)
                .update({ status: newStatus })
                .eq('id', reviewId);

            if (error) throw error;

            toast.success(`Review ${newStatus}`);
            setReviews(prev =>
                prev.map(r => r.id === reviewId ? { ...r, status: newStatus } : r)
            );
        } catch (error) {
            console.error('Error updating review:', error);
            toast.error('Failed to update review');
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            const { error } = await (supabase
                .from('reviews') as any)
                .delete()
                .eq('id', reviewId);

            if (error) throw error;

            toast.success('Review deleted');
            setReviews(prev => prev.filter(r => r.id !== reviewId));
            setTotalCount(prev => prev - 1);
        } catch (error) {
            console.error('Error deleting review:', error);
            toast.error('Failed to delete review');
        }
    };



    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={14}
                className={i < rating ? 'star-filled' : 'star-empty'}
                fill={i < rating ? '#f59e0b' : 'none'}
                color={i < rating ? '#f59e0b' : '#d1d5db'}
            />
        ));
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { class: string; label: string }> = {
            pending: { class: 'warning', label: 'Pending' },
            approved: { class: 'success', label: 'Approved' },
            rejected: { class: 'error', label: 'Rejected' },
        };
        const s = statusMap[status] || { class: 'default', label: status };
        return <span className={`badge badge-${s.class}`}>{s.label}</span>;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/1234/admin" replace />;
    }

    return (
        <>
            <header className="admin-header">
                <div>
                    <h1>Reviews Management</h1>
                    <p>Manage customer reviews and ratings</p>
                </div>
                <div className="header-stats">
                    <span className="stat">Total: {totalCount}</span>
                </div>
            </header>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search reviews..."
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={statusFilter}
                        onChange={e => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={e => {
                            setTypeFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">All Types</option>
                        <option value="service">Services</option>
                        <option value="product">Products</option>
                    </select>
                </div>
            </div>

            {/* Reviews Table */}
            <div className="data-table-wrapper">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="empty-state">
                        <Star size={48} />
                        <h3>No Reviews Found</h3>
                        <p>Reviews will appear here when customers submit them.</p>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Rating</th>
                                    <th>Comment</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map(review => (
                                    <tr key={review.id}>
                                        <td>
                                            <div className="user-cell-simple">
                                                <span>{review.user?.full_name || 'Anonymous'}</span>
                                                <small>{review.user?.email}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="rating-stars">
                                                {renderStars(review.rating)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="comment-cell">
                                                {review.comment?.substring(0, 100)}
                                                {review.comment?.length > 100 && '...'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-default">
                                                {review.item_type}
                                            </span>
                                        </td>
                                        <td>{formatDate(review.created_at)}</td>
                                        <td>{getStatusBadge(review.status)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                {review.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleStatusChange(review.id, 'approved')}
                                                            title="Approve"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-warning"
                                                            onClick={() => handleStatusChange(review.id, 'rejected')}
                                                            title="Reject"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-error"
                                                    onClick={() => handleDelete(review.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    <ChevronLeft size={16} /> Previous
                                </button>
                                <span className="page-info">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

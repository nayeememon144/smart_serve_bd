/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
    Search, Check, X, Eye, ChevronLeft, ChevronRight,
    Star, AlertCircle, Plus, Edit2, Briefcase
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './AdminStyles.css';

interface Service {
    id: string;
    title_en: string;
    title_bn: string;
    slug: string;
    description_en: string;
    category_id: string;
    provider_id: string;
    status: 'draft' | 'pending' | 'active' | 'suspended' | 'rejected';
    price_type: 'fixed' | 'hourly' | 'starting_from' | 'quote';
    base_price: number;
    price_display: number;
    images: string[];
    avg_rating: number;
    total_ratings: number;
    total_bookings: number;
    is_featured: boolean;
    created_at: string;
    category?: {
        name_en: string;
    };
    provider?: {
        full_name: string;
        email: string;
    };
}


export default function AdminServices() {
    const { user, isAuthenticated } = useAuthStore();

    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [categories, setCategories] = useState<Array<{ id: string; name_en: string }>>([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchServices();
        }
    }, [user, page, searchQuery, statusFilter, categoryFilter]);

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('id, name_en')
            .order('name_en');
        if (data) setCategories(data);
    };

    const fetchServices = async () => {
        try {
            setIsLoading(true);

            let query = supabase
                .from('services')
                .select(`
                    *,
                    category:categories!category_id(name_en)
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (searchQuery) {
                query = query.or(`title_en.ilike.%${searchQuery}%,title_bn.ilike.%${searchQuery}%`);
            }

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            if (categoryFilter !== 'all') {
                query = query.eq('category_id', categoryFilter);
            }

            const { data, count, error } = await query;

            if (error) throw error;
            setServices(data as Service[]);
            setTotalCount(count || 0);
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Failed to load services');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (serviceId: string, newStatus: Service['status']) => {
        try {
            const { error } = await (supabase
                .from('services') as any)
                .update({ status: newStatus })
                .eq('id', serviceId);

            if (error) throw error;

            toast.success(`Service ${newStatus === 'active' ? 'approved' : newStatus}`);
            setServices(prev =>
                prev.map(s => s.id === serviceId ? { ...s, status: newStatus } : s)
            );
            setShowDetailModal(false);
        } catch (error) {
            console.error('Error updating service:', error);
            toast.error('Failed to update service status');
        }
    };

    const handleToggleFeatured = async (serviceId: string, isFeatured: boolean) => {
        try {
            const { error } = await (supabase
                .from('services') as any)
                .update({ is_featured: !isFeatured })
                .eq('id', serviceId);

            if (error) throw error;

            toast.success(isFeatured ? 'Removed from featured' : 'Added to featured');
            setServices(prev =>
                prev.map(s => s.id === serviceId ? { ...s, is_featured: !isFeatured } : s)
            );
        } catch (error) {
            toast.error('Failed to update featured status');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { class: string; label: string }> = {
            draft: { class: 'muted', label: 'Draft' },
            pending: { class: 'warning', label: 'Pending Review' },
            active: { class: 'success', label: 'Active' },
            suspended: { class: 'error', label: 'Suspended' },
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
                    <h1>Services Management</h1>
                    <p>Manage and moderate service listings</p>
                </div>
                <div className="header-actions">
                    <Link to="/1234/admin/services/new" className="btn btn-primary">
                        <Plus size={18} /> Add Service
                    </Link>
                </div>
            </header>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search services..."
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
                        <option value="pending">Pending Review</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="suspended">Suspended</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <select
                        value={categoryFilter}
                        onChange={e => {
                            setCategoryFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Services Table */}
            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner" />
                </div>
            ) : services.length === 0 ? (
                <div className="empty-state">
                    <Briefcase size={48} />
                    <h3>No Services Found</h3>
                    <p>No services match your search criteria.</p>
                </div>
            ) : (
                <>
                    <div className="data-table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th>Provider</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Rating</th>
                                    <th>Status</th>
                                    <th>Featured</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map(service => (
                                    <tr key={service.id}>
                                        <td>
                                            <div className="service-cell">
                                                <div className="service-image">
                                                    <img
                                                        src={service.images?.[0] || '/placeholder-service.jpg'}
                                                        alt={service.title_en}
                                                    />
                                                </div>
                                                <div className="service-info">
                                                    <strong>{service.title_en}</strong>
                                                    <small>{formatDate(service.created_at)}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="provider-cell">
                                                <span>{service.provider?.full_name}</span>
                                                <small>{service.provider?.email}</small>
                                            </div>
                                        </td>
                                        <td>{service.category?.name_en || '-'}</td>
                                        <td>
                                            <span className="price">
                                                ৳{(service.price_display || service.base_price || 0).toLocaleString()}
                                            </span>
                                            <small className="price-type">{service.price_type || 'fixed'}</small>
                                        </td>
                                        <td>
                                            <div className="rating-cell">
                                                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                                <span>{(service.avg_rating || 0).toFixed(1)}</span>
                                                <small>({service.total_ratings || 0})</small>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(service.status)}</td>
                                        <td>
                                            <button
                                                className={`featured-toggle ${service.is_featured ? 'active' : ''}`}
                                                onClick={() => handleToggleFeatured(service.id, service.is_featured)}
                                                title={service.is_featured ? 'Remove from featured' : 'Add to featured'}
                                            >
                                                <Star size={16} fill={service.is_featured ? '#f59e0b' : 'none'} />
                                            </button>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-icon btn-sm"
                                                    onClick={() => {
                                                        setSelectedService(service);
                                                        setShowDetailModal(true);
                                                    }}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <Link
                                                    to={`/1234/admin/services/${service.id}/edit`}
                                                    className="btn btn-icon btn-sm"
                                                    title="Edit Service"
                                                >
                                                    <Edit2 size={16} />
                                                </Link>
                                                {service.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="btn btn-icon btn-sm btn-success"
                                                            onClick={() => handleStatusChange(service.id, 'active')}
                                                            title="Approve"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            className="btn btn-icon btn-sm btn-error"
                                                            onClick={() => handleStatusChange(service.id, 'rejected')}
                                                            title="Reject"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {service.status === 'active' && (
                                                    <button
                                                        className="btn btn-icon btn-sm btn-warning"
                                                        onClick={() => handleStatusChange(service.id, 'suspended')}
                                                        title="Suspend"
                                                    >
                                                        <AlertCircle size={16} />
                                                    </button>
                                                )}
                                                {service.status === 'suspended' && (
                                                    <button
                                                        className="btn btn-icon btn-sm btn-success"
                                                        onClick={() => handleStatusChange(service.id, 'active')}
                                                        title="Reactivate"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                className="btn btn-icon"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="page-info">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                className="btn btn-icon"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Service Detail Modal */}
            {showDetailModal && selectedService && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Service Details</h2>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Service Images */}
                            {selectedService.images && selectedService.images.length > 0 && (
                                <div className="service-images-grid">
                                    {selectedService.images.map((img, idx) => (
                                        <img key={idx} src={img} alt={`Service ${idx + 1}`} />
                                    ))}
                                </div>
                            )}

                            <div className="detail-grid">
                                <div className="detail-section">
                                    <h3>Basic Information</h3>
                                    <div className="detail-row">
                                        <label>Title (EN):</label>
                                        <span>{selectedService.title_en}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Title (BN):</label>
                                        <span>{selectedService.title_bn}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Category:</label>
                                        <span>{selectedService.category?.name_en}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Status:</label>
                                        {getStatusBadge(selectedService.status)}
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>Provider</h3>
                                    <div className="detail-row">
                                        <label>Name:</label>
                                        <span>{selectedService.provider?.full_name}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Email:</label>
                                        <span>{selectedService.provider?.email}</span>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>Pricing</h3>
                                    <div className="detail-row">
                                        <label>Price Type:</label>
                                        <span className="capitalize">{selectedService.price_type || 'fixed'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Price:</label>
                                        <span>৳{(selectedService.price_display || selectedService.base_price || 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <h3>Statistics</h3>
                                    <div className="detail-row">
                                        <label>Rating:</label>
                                        <span>
                                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                            {(selectedService.avg_rating || 0).toFixed(1)} ({selectedService.total_ratings || 0} reviews)
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Total Bookings:</label>
                                        <span>{selectedService.total_bookings || 0}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Featured:</label>
                                        <span>{selectedService.is_featured ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <label>Created:</label>
                                        <span>{formatDate(selectedService.created_at)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section full-width">
                                <h3>Description</h3>
                                <p className="description-text">{selectedService.description_en}</p>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowDetailModal(false)}>
                                Close
                            </button>
                            {selectedService.status === 'pending' && (
                                <>
                                    <button
                                        className="btn btn-error"
                                        onClick={() => handleStatusChange(selectedService.id, 'rejected')}
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => handleStatusChange(selectedService.id, 'active')}
                                    >
                                        <Check size={16} /> Approve
                                    </button>
                                </>
                            )}
                            {selectedService.status === 'active' && (
                                <button
                                    className="btn btn-warning"
                                    onClick={() => handleStatusChange(selectedService.id, 'suspended')}
                                >
                                    <AlertCircle size={16} /> Suspend Service
                                </button>
                            )}
                            {(selectedService.status === 'suspended' || selectedService.status === 'rejected') && (
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleStatusChange(selectedService.id, 'active')}
                                >
                                    <Check size={16} /> Reactivate
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

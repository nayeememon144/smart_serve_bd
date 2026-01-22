/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Edit2, Trash2, Eye, Star, MoreVertical,
    Pause, Play, Search, Grid, List
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './ProviderServices.css';

interface Service {
    id: string;
    title_en: string;
    title_bn: string;
    slug: string;
    images: string[] | null;
    price_display: number;
    price_basic: number | null;
    price_standard: number | null;
    price_premium: number | null;
    status: 'active' | 'paused' | 'pending' | 'rejected';
    avg_rating: number;
    total_bookings: number;
    created_at: string;
    category?: {
        name_en: string;
    };
}

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'active' | 'paused' | 'pending';

export default function ProviderServices() {
    const { user } = useAuthStore();
    const [services, setServices] = useState<Service[]>([]);
    const [filteredServices, setFilteredServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    useEffect(() => {
        fetchServices();
    }, [user?.id]);

    useEffect(() => {
        filterServices();
    }, [statusFilter, searchQuery, services]);

    const fetchServices = async () => {
        if (!user?.id) return;

        try {
            const { data, error } = await (supabase
                .from('services') as any)
                .select('*, category:categories(name_en)')
                .eq('provider_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setServices(data as Service[] || []);
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Failed to load services');
        } finally {
            setIsLoading(false);
        }
    };

    const filterServices = () => {
        let filtered = [...services];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(s => s.status === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(s =>
                s.title_en.toLowerCase().includes(query) ||
                s.title_bn?.toLowerCase().includes(query)
            );
        }

        setFilteredServices(filtered);
    };

    const handleStatusToggle = async (serviceId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'paused' : 'active';
        try {
            const { error } = await (supabase
                .from('services') as any)
                .update({ status: newStatus })
                .eq('id', serviceId);

            if (error) throw error;

            toast.success(`Service ${newStatus === 'active' ? 'activated' : 'paused'}`);
            setServices(prev =>
                prev.map(s => s.id === serviceId ? { ...s, status: newStatus as Service['status'] } : s)
            );
        } catch (error) {
            toast.error('Failed to update service status');
        }
        setActiveMenu(null);
    };

    const handleDelete = async (serviceId: string) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        try {
            const { error } = await (supabase
                .from('services') as any)
                .delete()
                .eq('id', serviceId);

            if (error) throw error;

            toast.success('Service deleted');
            setServices(prev => prev.filter(s => s.id !== serviceId));
        } catch (error) {
            toast.error('Failed to delete service');
        }
        setActiveMenu(null);
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { class: string; label: string }> = {
            active: { class: 'status-active', label: 'Active' },
            paused: { class: 'status-paused', label: 'Paused' },
            pending: { class: 'status-pending', label: 'Pending Approval' },
            rejected: { class: 'status-rejected', label: 'Rejected' },
        };
        const s = config[status] || config.pending;
        return <span className={`status-badge ${s.class}`}>{s.label}</span>;
    };

    const stats = {
        total: services.length,
        active: services.filter(s => s.status === 'active').length,
        paused: services.filter(s => s.status === 'paused').length,
        pending: services.filter(s => s.status === 'pending').length,
    };

    return (
        <div className="provider-services-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>My Services</h1>
                    <p>Manage your service offerings</p>
                </div>
                <Link to="/provider/services/new" className="btn btn-primary">
                    <Plus size={18} />
                    Add New Service
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="stats-row">
                <div className="mini-stat">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total Services</span>
                </div>
                <div className="mini-stat">
                    <span className="stat-value text-success">{stats.active}</span>
                    <span className="stat-label">Active</span>
                </div>
                <div className="mini-stat">
                    <span className="stat-value text-warning">{stats.paused}</span>
                    <span className="stat-label">Paused</span>
                </div>
                <div className="mini-stat">
                    <span className="stat-value text-info">{stats.pending}</span>
                    <span className="stat-label">Pending</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-actions">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                        className="status-filter"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="pending">Pending</option>
                    </select>

                    <div className="view-toggle">
                        <button
                            className={viewMode === 'grid' ? 'active' : ''}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            className={viewMode === 'list' ? 'active' : ''}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Services Grid/List */}
            <div className="services-container">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Loading services...</p>
                    </div>
                ) : filteredServices.length > 0 ? (
                    <div className={`services-${viewMode}`}>
                        {filteredServices.map((service) => (
                            <div key={service.id} className="service-card">
                                <div className="service-image">
                                    <img
                                        src={service.images?.[0] || '/placeholder-service.jpg'}
                                        alt={service.title_en}
                                    />
                                    {getStatusBadge(service.status)}
                                </div>

                                <div className="service-content">
                                    <h3 className="service-title">{service.title_en}</h3>
                                    {service.category && (
                                        <span className="service-category">{service.category.name_en}</span>
                                    )}

                                    <div className="service-meta">
                                        <span className="price">৳{service.price_display.toLocaleString()}</span>
                                        <span className="rating">
                                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                            {service.avg_rating.toFixed(1)}
                                        </span>
                                        <span className="bookings">{service.total_bookings} bookings</span>
                                    </div>
                                </div>

                                <div className="service-actions">
                                    <Link to={`/service/${service.slug}`} className="action-btn" title="View">
                                        <Eye size={16} />
                                    </Link>
                                    <Link to={`/provider/services/${service.id}/edit`} className="action-btn" title="Edit">
                                        <Edit2 size={16} />
                                    </Link>
                                    <div className="action-menu">
                                        <button
                                            className="action-btn"
                                            onClick={() => setActiveMenu(activeMenu === service.id ? null : service.id)}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        {activeMenu === service.id && (
                                            <div className="dropdown-menu">
                                                <button onClick={() => handleStatusToggle(service.id, service.status)}>
                                                    {service.status === 'active' ? (
                                                        <><Pause size={14} /> Pause</>
                                                    ) : (
                                                        <><Play size={14} /> Activate</>
                                                    )}
                                                </button>
                                                <button className="danger" onClick={() => handleDelete(service.id)}>
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Plus size={48} />
                        <h3>No services yet</h3>
                        <p>Add your first service to start receiving bookings</p>
                        <Link to="/provider/services/new" className="btn btn-primary">
                            <Plus size={18} />
                            Add Service
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

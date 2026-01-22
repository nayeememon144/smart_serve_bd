/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    MessageSquare, Clock, DollarSign, X,
    Send, Eye, Calendar, MapPin, User, FileText, Bell
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './ProviderDashboard.css';

interface Quote {
    id: string;
    service_id: string;
    customer_id: string;
    description: string;
    preferred_date: string;
    preferred_time: string | null;
    budget_min: number | null;
    budget_max: number | null;
    images: string[] | null;
    status: 'pending' | 'responded' | 'accepted' | 'declined' | 'expired';
    created_at: string;
    address_id: string | null;
    service?: {
        title_en: string;
        title_bn: string;
    };
    customer?: {
        full_name: string;
        phone: string;
        email: string | null;
    };
    address?: {
        full_address: string;
        area: string;
        city: string;
    };
    response?: QuoteResponse;
}

interface QuoteResponse {
    id: string;
    quote_id: string;
    provider_id: string;
    proposed_price: number;
    estimated_duration: string | null;
    message: string | null;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
}

export default function ProviderQuotes() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'responded' | 'accepted'>('all');
    const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [responseData, setResponseData] = useState({
        proposed_price: '',
        estimated_duration: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'provider') return;
        fetchQuotes();
    }, [user, filter]);

    const fetchQuotes = async () => {
        try {
            setIsLoading(true);

            // First get the provider's services
            const { data: services } = await (supabase
                .from('services') as any)
                .select('id')
                .eq('provider_id', user!.id);

            if (!services || services.length === 0) {
                setQuotes([]);
                return;
            }

            const serviceIds = services.map((s: any) => s.id);

            // Now get quotes for those services
            let query = (supabase
                .from('quotes') as any)
                .select(`
                    *,
                    service:services(title_en, title_bn),
                    customer:users!quotes_customer_id_fkey(full_name, phone, email),
                    address:user_addresses(full_address, area, city)
                `)
                .in('service_id', serviceIds)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Fetch responses for these quotes
            if (data && data.length > 0) {
                const quoteIds = data.map((q: any) => q.id);
                const { data: responses } = await (supabase
                    .from('quote_responses') as any)
                    .select('*')
                    .in('quote_id', quoteIds)
                    .eq('provider_id', user!.id);

                const quotesWithResponses = data.map((quote: any) => ({
                    ...quote,
                    response: responses?.find((r: any) => r.quote_id === quote.id)
                }));

                setQuotes(quotesWithResponses as Quote[]);
            } else {
                setQuotes([]);
            }
        } catch (error) {
            console.error('Error fetching quotes:', error);
            toast.error('Failed to load quotes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendResponse = async () => {
        if (!selectedQuote || !responseData.proposed_price) {
            toast.error('Please enter a proposed price');
            return;
        }

        try {
            setSubmitting(true);

            // Check if response already exists
            const { data: existingResponse } = await (supabase
                .from('quote_responses') as any)
                .select('id')
                .eq('quote_id', selectedQuote.id)
                .eq('provider_id', user!.id)
                .single();

            if (existingResponse) {
                // Update existing response
                const { error } = await (supabase
                    .from('quote_responses') as any)
                    .update({
                        proposed_price: parseFloat(responseData.proposed_price),
                        estimated_duration: responseData.estimated_duration || null,
                        message: responseData.message || null,
                    })
                    .eq('id', existingResponse.id);

                if (error) throw error;
            } else {
                // Create new response
                const { error } = await (supabase
                    .from('quote_responses') as any)
                    .insert({
                        quote_id: selectedQuote.id,
                        provider_id: user!.id,
                        proposed_price: parseFloat(responseData.proposed_price),
                        estimated_duration: responseData.estimated_duration || null,
                        message: responseData.message || null,
                        status: 'pending'
                    });

                if (error) throw error;

                // Update quote status
                await (supabase
                    .from('quotes') as any)
                    .update({ status: 'responded' })
                    .eq('id', selectedQuote.id);
            }

            toast.success('Quote response sent successfully!');
            setShowResponseModal(false);
            setSelectedQuote(null);
            setResponseData({ proposed_price: '', estimated_duration: '', message: '' });
            fetchQuotes();
        } catch (error) {
            console.error('Error sending response:', error);
            toast.error('Failed to send response');
        } finally {
            setSubmitting(false);
        }
    };



    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { class: string; label: string }> = {
            pending: { class: 'warning', label: 'Pending' },
            responded: { class: 'info', label: 'Responded' },
            accepted: { class: 'success', label: 'Accepted' },
            declined: { class: 'error', label: 'Declined' },
            expired: { class: 'muted', label: 'Expired' },
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

    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return 'Just now';
    };

    if (authLoading) {
        return (
            <div className="loading-state" style={{ minHeight: '100vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'provider') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="provider-dashboard-content">
            {/* Page Header */}
            <header className="dashboard-header">
                <div>
                    <h1>Quote Requests</h1>
                    <p>Manage and respond to customer quote requests</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-icon">
                        <Bell size={20} />
                    </button>
                </div>
            </header>

            {/* Filters */}
            <div className="dashboard-content">
                <div className="filters-bar" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div className="filter-tabs">
                        {(['all', 'pending', 'responded', 'accepted'] as const).map(tab => (
                            <button
                                key={tab}
                                className={`filter-tab ${filter === tab ? 'active' : ''}`}
                                onClick={() => setFilter(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                ) : quotes.length === 0 ? (
                    <div className="empty-state">
                        <MessageSquare size={48} />
                        <h3>No Quote Requests</h3>
                        <p>You haven't received any quote requests yet.</p>
                    </div>
                ) : (
                    <div className="quotes-list">
                        {quotes.map(quote => (
                            <div key={quote.id} className="quote-card">
                                <div className="quote-header">
                                    <div className="quote-service">
                                        <h4>{quote.service?.title_en}</h4>
                                        <span className="quote-time">{formatTimeAgo(quote.created_at)}</span>
                                    </div>
                                    {getStatusBadge(quote.status)}
                                </div>

                                <div className="quote-body">
                                    <div className="quote-customer">
                                        <User size={16} />
                                        <span>{quote.customer?.full_name}</span>
                                        <span className="divider">•</span>
                                        <span>{quote.customer?.phone}</span>
                                    </div>

                                    <p className="quote-description">{quote.description}</p>

                                    <div className="quote-meta">
                                        {quote.preferred_date && (
                                            <div className="meta-item">
                                                <Calendar size={14} />
                                                <span>{formatDate(quote.preferred_date)}</span>
                                                {quote.preferred_time && <span> at {quote.preferred_time}</span>}
                                            </div>
                                        )}
                                        {quote.address && (
                                            <div className="meta-item">
                                                <MapPin size={14} />
                                                <span>{quote.address.area}, {quote.address.city}</span>
                                            </div>
                                        )}
                                        {(quote.budget_min || quote.budget_max) && (
                                            <div className="meta-item">
                                                <DollarSign size={14} />
                                                <span>
                                                    Budget: ৳{quote.budget_min?.toLocaleString() || '0'}
                                                    {quote.budget_max && ` - ৳${quote.budget_max.toLocaleString()}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {quote.images && quote.images.length > 0 && (
                                        <div className="quote-images">
                                            {quote.images.slice(0, 3).map((img, idx) => (
                                                <img key={idx} src={img} alt={`Attachment ${idx + 1}`} />
                                            ))}
                                            {quote.images.length > 3 && (
                                                <span className="more-images">+{quote.images.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    {quote.response && (
                                        <div className="quote-response-preview">
                                            <strong>Your Response:</strong>
                                            <span>৳{quote.response.proposed_price.toLocaleString()}</span>
                                            <span className={`response-status ${quote.response.status}`}>
                                                {quote.response.status}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="quote-actions">
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={() => setSelectedQuote(quote)}
                                    >
                                        <Eye size={14} /> View Details
                                    </button>
                                    {quote.status === 'pending' && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => {
                                                setSelectedQuote(quote);
                                                setShowResponseModal(true);
                                            }}
                                        >
                                            <Send size={14} /> Send Quote
                                        </button>
                                    )}
                                    {quote.status === 'responded' && quote.response?.status === 'pending' && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => {
                                                setSelectedQuote(quote);
                                                setResponseData({
                                                    proposed_price: quote.response!.proposed_price.toString(),
                                                    estimated_duration: quote.response!.estimated_duration || '',
                                                    message: quote.response!.message || ''
                                                });
                                                setShowResponseModal(true);
                                            }}
                                        >
                                            <FileText size={14} /> Edit Response
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quote Detail Modal */}
            {selectedQuote && !showResponseModal && (
                <div className="modal-overlay" onClick={() => setSelectedQuote(null)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Quote Request Details</h2>
                            <button className="close-btn" onClick={() => setSelectedQuote(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="quote-detail-section">
                                <h3>Service</h3>
                                <p>{selectedQuote.service?.title_en}</p>
                            </div>

                            <div className="quote-detail-section">
                                <h3>Customer</h3>
                                <p><strong>{selectedQuote.customer?.full_name}</strong></p>
                                <p>{selectedQuote.customer?.phone}</p>
                                {selectedQuote.customer?.email && <p>{selectedQuote.customer.email}</p>}
                            </div>

                            <div className="quote-detail-section">
                                <h3>Description</h3>
                                <p>{selectedQuote.description}</p>
                            </div>

                            {selectedQuote.address && (
                                <div className="quote-detail-section">
                                    <h3>Location</h3>
                                    <p>{selectedQuote.address.full_address}</p>
                                    <p>{selectedQuote.address.area}, {selectedQuote.address.city}</p>
                                </div>
                            )}

                            <div className="quote-detail-row">
                                <div className="quote-detail-section">
                                    <h3>Preferred Date</h3>
                                    <p>{formatDate(selectedQuote.preferred_date)}</p>
                                    {selectedQuote.preferred_time && <p>{selectedQuote.preferred_time}</p>}
                                </div>
                                <div className="quote-detail-section">
                                    <h3>Budget Range</h3>
                                    <p>
                                        ৳{selectedQuote.budget_min?.toLocaleString() || '0'}
                                        {selectedQuote.budget_max && ` - ৳${selectedQuote.budget_max.toLocaleString()}`}
                                    </p>
                                </div>
                            </div>

                            {selectedQuote.images && selectedQuote.images.length > 0 && (
                                <div className="quote-detail-section">
                                    <h3>Attachments</h3>
                                    <div className="quote-images-grid">
                                        {selectedQuote.images.map((img, idx) => (
                                            <img key={idx} src={img} alt={`Attachment ${idx + 1}`} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedQuote.response && (
                                <div className="quote-detail-section response-section">
                                    <h3>Your Response</h3>
                                    <div className="response-details">
                                        <p><strong>Proposed Price:</strong> ৳{selectedQuote.response.proposed_price.toLocaleString()}</p>
                                        {selectedQuote.response.estimated_duration && (
                                            <p><strong>Estimated Duration:</strong> {selectedQuote.response.estimated_duration}</p>
                                        )}
                                        {selectedQuote.response.message && (
                                            <p><strong>Message:</strong> {selectedQuote.response.message}</p>
                                        )}
                                        <p><strong>Status:</strong> {getStatusBadge(selectedQuote.response.status)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setSelectedQuote(null)}>
                                Close
                            </button>
                            {selectedQuote.status === 'pending' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowResponseModal(true)}
                                >
                                    <Send size={16} /> Send Quote Response
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )
            }

            {/* Response Modal */}
            {
                showResponseModal && selectedQuote && (
                    <div className="modal-overlay" onClick={() => setShowResponseModal(false)}>
                        <div className="modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Send Quote Response</h2>
                                <button className="close-btn" onClick={() => setShowResponseModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label required">
                                        <DollarSign size={16} />
                                        Proposed Price (৳)
                                    </label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Enter your price"
                                        value={responseData.proposed_price}
                                        onChange={e => setResponseData(prev => ({
                                            ...prev,
                                            proposed_price: e.target.value
                                        }))}
                                    />
                                    {selectedQuote.budget_min && (
                                        <small className="form-hint">
                                            Customer budget: ৳{selectedQuote.budget_min.toLocaleString()}
                                            {selectedQuote.budget_max && ` - ৳${selectedQuote.budget_max.toLocaleString()}`}
                                        </small>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <Clock size={16} />
                                        Estimated Duration
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., 2-3 hours, 1 day"
                                        value={responseData.estimated_duration}
                                        onChange={e => setResponseData(prev => ({
                                            ...prev,
                                            estimated_duration: e.target.value
                                        }))}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <MessageSquare size={16} />
                                        Message to Customer
                                    </label>
                                    <textarea
                                        className="form-input"
                                        rows={4}
                                        placeholder="Add any additional information or notes..."
                                        value={responseData.message}
                                        onChange={e => setResponseData(prev => ({
                                            ...prev,
                                            message: e.target.value
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setShowResponseModal(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSendResponse}
                                    disabled={submitting || !responseData.proposed_price}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="spinner-small" /> Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} /> Send Response
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

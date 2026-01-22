import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './ServiceDetailPage.css';

interface ServiceWithDetails {
    id: string;
    title_en: string;
    title_bn: string;
    description_en: string | null;
    description_bn: string | null;
    slug: string;
    images: string[] | null;
    price_display: number;
    price_basic: number | null;
    price_standard: number | null;
    price_premium: number | null;
    duration_minutes: number | null;
    what_included: string | null;
    avg_rating: number;
    total_ratings: number;
    total_bookings: number;
    provider_id: string;
    provider?: {
        id: string;
        full_name: string;
        profile_photo: string | null;
    };
    category?: {
        name_en: string;
        name_bn: string;
        slug: string;
    };
}

interface RelatedService {
    id: string;
    title_en: string;
    title_bn: string;
    slug: string;
    images: string[] | null;
    price_display: number;
}

export default function ServiceDetailPage() {
    const { slug } = useParams();
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const lang = i18n.language as 'en' | 'bn';

    const [service, setService] = useState<ServiceWithDetails | null>(null);
    const [relatedServices, setRelatedServices] = useState<RelatedService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'seller' | 'review'>('overview');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const fetchServiceDetails = async () => {
            if (!slug) return;

            try {
                const { data: serviceData, error } = await supabase
                    .from('services')
                    .select(`
                        *,
                        provider:users!services_provider_id_fkey(id, full_name, profile_photo),
                        category:categories!services_category_id_fkey(name_en, name_bn, slug)
                    `)
                    .eq('slug', slug)
                    .eq('status', 'active')
                    .single();

                if (error || !serviceData) {
                    console.error('Error fetching service:', error);
                    return;
                }

                setService(serviceData as ServiceWithDetails);

                // Fetch related services
                if ((serviceData as ServiceWithDetails).category) {
                    const { data: relatedData } = await supabase
                        .from('services')
                        .select('id, title_en, title_bn, slug, images, price_display')
                        .eq('status', 'active')
                        .neq('id', (serviceData as ServiceWithDetails).id)
                        .limit(4);

                    if (relatedData) setRelatedServices(relatedData as RelatedService[]);
                }

            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchServiceDetails();
    }, [slug]);

    const handleBookNow = () => {
        if (!isAuthenticated) {
            toast.error('Please login to book a service');
            navigate('/login', { state: { from: `/book/${slug}` } });
            return;
        }
        navigate(`/book/${slug}`);
    };

    const nextImage = () => {
        if (service?.images && currentImageIndex < service.images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const prevImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-state" style={{ minHeight: '60vh' }}>
                <div className="spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="error-page">
                <h1>Service Not Found</h1>
                <p>The service you're looking for doesn't exist or has been removed.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button onClick={() => window.history.back()} className="btn btn-outline">Go Back</button>
                    <Link to="/services" className="btn btn-primary">Browse Services</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="service-detail-page">
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <ChevronRight size={14} />
                    <Link to="/services">Service List</Link>
                </div>

                {/* Page Title */}
                <h1 className="page-title">
                    {lang === 'bn' ? service.title_bn : service.title_en}
                </h1>

                {/* Main Layout */}
                <div className="service-detail-layout">
                    {/* Left Column - Image Gallery */}
                    <div className="service-gallery">
                        <div className="main-image">
                            <img
                                src={service.images?.[currentImageIndex] || '/placeholder-service.jpg'}
                                alt={service.title_en}
                            />
                            {service.images && service.images.length > 1 && (
                                <>
                                    <button className="nav-btn prev" onClick={prevImage} disabled={currentImageIndex === 0}>
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button className="nav-btn next" onClick={nextImage} disabled={currentImageIndex === service.images.length - 1}>
                                        <ChevronRightIcon size={24} />
                                    </button>
                                </>
                            )}
                        </div>
                        {service.images && service.images.length > 1 && (
                            <div className="image-dots">
                                {service.images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        className={`dot ${idx === currentImageIndex ? 'active' : ''}`}
                                        onClick={() => setCurrentImageIndex(idx)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Provider Info */}
                        {service.provider && (
                            <div className="provider-section">
                                <div className="provider-avatar">
                                    {service.provider.profile_photo ? (
                                        <img src={service.provider.profile_photo} alt="" />
                                    ) : (
                                        <span>{service.provider.full_name?.charAt(0)}</span>
                                    )}
                                </div>
                                <span className="provider-name">{service.provider.full_name}</span>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="detail-tabs">
                            <button
                                className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                                onClick={() => setActiveTab('overview')}
                            >
                                Overview
                            </button>
                            <button
                                className={`tab ${activeTab === 'seller' ? 'active' : ''}`}
                                onClick={() => setActiveTab('seller')}
                            >
                                About Seller
                            </button>
                            <button
                                className={`tab ${activeTab === 'review' ? 'active' : ''}`}
                                onClick={() => setActiveTab('review')}
                            >
                                Review
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {activeTab === 'overview' && (
                                <div className="overview-content">
                                    <p className="description">
                                        {lang === 'bn' ? service.description_bn : service.description_en}
                                    </p>

                                    {service.what_included && (
                                        <div className="what-you-get">
                                            <h3>What you will get:</h3>
                                            <ul>
                                                {service.what_included.split('\n').map((item, idx) => (
                                                    <li key={idx}>
                                                        <span className="bullet">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'seller' && (
                                <div className="seller-content">
                                    {/* Seller Header */}
                                    <div className="seller-header">
                                        <div className="seller-avatar-large">
                                            {service.provider?.profile_photo ? (
                                                <img src={service.provider.profile_photo} alt="" />
                                            ) : (
                                                <span>{service.provider?.full_name?.charAt(0) || 'P'}</span>
                                            )}
                                        </div>
                                        <div className="seller-basic-info">
                                            <h3 className="seller-name">
                                                {service.provider?.full_name || 'POSHORA'}
                                            </h3>
                                            <span className="order-badge">
                                                <span className="order-text">Order Completed</span>
                                                <span className="order-count">({service.total_bookings || 697})</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats Card */}
                                    <div className="seller-stats-card">
                                        <div className="stats-grid">
                                            <div className="stat-item">
                                                <span className="stat-label">From</span>
                                                <span className="stat-value">Bangladesh</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-label">Order Completion Rate</span>
                                                <span className="stat-value highlight">100%</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-label">Seller Since</span>
                                                <span className="stat-value">2021</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-label">Order Completed</span>
                                                <span className="stat-value">{service.total_bookings || 697}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seller Bio */}
                                    <div className="seller-bio">
                                        <p>
                                            {service.provider?.full_name || 'POSHORA'} is a virtual marketplace for service providers
                                            offering one-stop solutions for various services you require at households and offices
                                            every now and then. We offer you an array of essential day-to-day services to avail
                                            from experienced technicians, skilled workers, and craftspeople. Also, you will find
                                            dynamic independent freelancers and consultants offering their professional services
                                            to meet your work demand.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'review' && (
                                <div className="review-content">
                                    <p className="no-reviews">No reviews yet. Be the first to review!</p>
                                </div>
                            )}
                        </div>

                        {/* Related Services */}
                        {relatedServices.length > 0 && (
                            <div className="related-services">
                                <div className="section-header">
                                    <h3>Another Service of this Seller</h3>
                                    <Link to="/services" className="explore-link">Explore All →</Link>
                                </div>
                                <div className="related-grid">
                                    {relatedServices.map(rs => (
                                        <Link key={rs.id} to={`/service/${rs.slug}`} className="related-card">
                                            <img src={rs.images?.[0] || '/placeholder-service.jpg'} alt={rs.title_en} />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Package Sidebar */}
                    <div className="package-sidebar">
                        <div className="package-card">
                            <div className="package-header">
                                <h3>Package</h3>
                                <span className="package-price">৳{service.price_display.toLocaleString()}</span>
                            </div>

                            <div className="package-options">
                                <h4>Available Service Packages</h4>
                                <label className="package-option">
                                    <input type="radio" name="package" defaultChecked />
                                    <span>{lang === 'bn' ? service.title_bn : service.title_en}</span>
                                </label>
                            </div>

                            <button className="btn btn-primary btn-book" onClick={handleBookNow}>
                                Book Appointment
                            </button>
                        </div>

                        <div className="completed-orders">
                            <CheckCircle size={20} className="check-icon" />
                            <span>{service.total_bookings || 897} Order Completed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

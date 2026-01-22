 
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Search, ChevronRight, Grid3X3, MapPin,
    Home, Wrench, Briefcase, Thermometer, Monitor,
    Car, Scissors, Paintbrush, Sparkles, Settings, Package,
    Zap, ShowerHead, Hammer, Building, HeartPulse
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LoadingSpinner, ErrorMessage } from '../../components/common';
import './ServicesPage.css';

// Map category slugs to icons
const getCategoryIcon = (slug: string): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
        'home-services': <Home size={32} />,
        'electrical-services': <Zap size={32} />,
        'office-services': <Briefcase size={32} />,
        'ac-repair-services': <Thermometer size={32} />,
        'computer-repair-services': <Monitor size={32} />,
        'plumbing-services': <ShowerHead size={32} />,
        'ac-appliances': <Thermometer size={32} />,
        'cleaning-services': <Sparkles size={32} />,
        'home-appliance-repair': <Settings size={32} />,
        'renovation-interior': <Paintbrush size={32} />,
        'car-services': <Car size={32} />,
        'personal-care-services': <Scissors size={32} />,
        'general-services': <Wrench size={32} />,
        'electronics-gadgets': <Monitor size={32} />,
        'home-appliances-products': <Package size={32} />,
        'tools-equipment': <Hammer size={32} />,
        'books-stationery': <Building size={32} />,
        'fashion-accessories': <HeartPulse size={32} />,
        'groceries-essentials': <Package size={32} />,
        'health-beauty': <HeartPulse size={32} />,
        'sports-fitness': <HeartPulse size={32} />,
    };
    return iconMap[slug] || <Grid3X3 size={32} />;
};

interface Category {
    id: string;
    name_en: string;
    name_bn: string;
    slug: string;
    description_en: string | null;
    description_bn: string | null;
    icon_url: string | null;
    image: string | null;
    parent_id: string | null;
    display_order: number;
    service_count: number;
    status: string;
}

interface Service {
    id: string;
    title_en: string;
    title_bn: string;
    description_en: string | null;
    description_bn: string | null;
    slug: string;
    images: string[] | null;
    price_display: number;
    avg_rating: number;
    total_ratings: number;
    total_bookings: number;
    provider?: {
        id: string;
        full_name: string;
        profile_photo: string | null;
    };
}

export default function ServicesPage() {
    const { t, i18n } = useTranslation();
    const { categorySlug } = useParams<{ categorySlug?: string }>();
    const navigate = useNavigate();
    const lang = i18n.language as 'en' | 'bn';

    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<Category[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [sortBy, setSortBy] = useState('');

    useEffect(() => {
        if (categorySlug) {
            fetchCategoryDetails();
        } else {
            // Reset currentCategory when navigating back to all services
            setCurrentCategory(null);
            setSubCategories([]);
            setServices([]);
            fetchCategories();
        }
    }, [categorySlug]);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const { data: categoriesData, error: fetchError } = await supabase
                .from('categories')
                .select('*')
                .eq('status', 'active')
                .is('parent_id', null)
                .order('display_order');

            if (fetchError) throw fetchError;

            if (categoriesData) {
                const categoriesWithCounts: Category[] = await Promise.all(
                    (categoriesData as Category[]).map(async (cat) => {
                        const { count } = await supabase
                            .from('services')
                            .select('*', { count: 'exact', head: true })
                            .eq('category_id', cat.id)
                            .eq('status', 'active');

                        return { ...cat, service_count: count || 0 };
                    })
                );
                setCategories(categoriesWithCounts);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to load categories. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategoryDetails = async () => {
        try {
            setIsLoading(true);

            if (!categorySlug) return;

            const { data: categoryData } = await supabase
                .from('categories')
                .select('*')
                .eq('slug', categorySlug)
                .single();

            if (categoryData) {
                setCurrentCategory(categoryData as Category);

                // Fetch sub-categories
                const { data: subCats } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('parent_id', (categoryData as Category).id)
                    .eq('status', 'active')
                    .order('display_order');

                if (subCats && subCats.length > 0) {
                    const subCatsWithCounts: Category[] = await Promise.all(
                        (subCats as Category[]).map(async (cat) => {
                            const { count } = await supabase
                                .from('services')
                                .select('*', { count: 'exact', head: true })
                                .eq('category_id', cat.id)
                                .eq('status', 'active');

                            return { ...cat, service_count: count || 0 };
                        })
                    );
                    setSubCategories(subCatsWithCounts);
                }

                // Fetch services in this category with provider info
                const { data: servicesData } = await supabase
                    .from('services')
                    .select('*, provider:users!services_provider_id_fkey(id, full_name, profile_photo)')
                    .eq('category_id', (categoryData as Category).id)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false });

                if (servicesData) setServices(servicesData as Service[]);
            }
        } catch (error) {
            console.error('Error fetching category details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter and sort
    const filteredCategories = categories.filter(cat => {
        const name = lang === 'bn' ? cat.name_bn : cat.name_en;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const filteredSubCategories = subCategories.filter(cat => {
        const name = lang === 'bn' ? cat.name_bn : cat.name_en;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    let filteredServices = services.filter(service => {
        const title = lang === 'bn' ? service.title_bn : service.title_en;
        const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRating = !ratingFilter || service.avg_rating >= parseInt(ratingFilter);
        return matchesSearch && matchesRating;
    });

    // Sort services
    if (sortBy === 'price_low') {
        filteredServices = [...filteredServices].sort((a, b) => a.price_display - b.price_display);
    } else if (sortBy === 'price_high') {
        filteredServices = [...filteredServices].sort((a, b) => b.price_display - a.price_display);
    } else if (sortBy === 'rating') {
        filteredServices = [...filteredServices].sort((a, b) => b.avg_rating - a.avg_rating);
    }

    const renderCategoryCard = (category: Category) => (
        <Link
            key={category.id}
            to={`/services/${category.slug}`}
            className="category-card"
        >
            <div className="category-icon">
                {getCategoryIcon(category.slug)}
            </div>
            <h3 className="category-name">
                {lang === 'bn' ? category.name_bn : category.name_en}
            </h3>
            <span className="category-count">
                {category.service_count || 0} services
            </span>
        </Link>
    );

    const renderServiceCard = (service: Service) => (
        <div key={service.id} className="service-listing-card">
            <div className="service-card-image">
                <img
                    src={service.images?.[0] || '/placeholder-service.jpg'}
                    alt={lang === 'bn' ? service.title_bn : service.title_en}
                />
                <span className="location-badge">
                    <MapPin size={12} />
                    Dhaka, Bangladesh
                </span>
            </div>
            <div className="service-card-body">
                {service.provider && (
                    <div className="provider-info">
                        <div className="provider-avatar">
                            {service.provider.profile_photo ? (
                                <img src={service.provider.profile_photo} alt="" />
                            ) : (
                                <span>{service.provider.full_name?.charAt(0) || 'P'}</span>
                            )}
                        </div>
                        <span className="provider-name">{service.provider.full_name}</span>
                    </div>
                )}
                <Link to={`/service/${service.slug}`} className="service-card-title">
                    {lang === 'bn' ? service.title_bn : service.title_en}
                </Link>
                <p className="service-card-desc">
                    {(lang === 'bn' ? service.description_bn : service.description_en)?.substring(0, 100)}...
                </p>
                <div className="service-card-footer">
                    <div className="service-price">
                        <span className="price-label">Starting at</span>
                        <span className="price-value">৳{service.price_display.toLocaleString()}</span>
                    </div>
                    <div className="service-card-actions">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/book/${service.slug}`)}
                        >
                            Book Now
                        </button>
                        <Link
                            to={`/service/${service.slug}`}
                            className="btn btn-outline btn-sm"
                        >
                            View Details
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="services-page">
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    {currentCategory ? (
                        <>
                            <ChevronRight size={14} />
                            <Link to="/services">{t('services.title')}</Link>
                            <ChevronRight size={14} />
                            <span>{lang === 'bn' ? currentCategory.name_bn : currentCategory.name_en}</span>
                        </>
                    ) : (
                        <>
                            <ChevronRight size={14} />
                            <span>{t('services.allCategories')}</span>
                        </>
                    )}
                </div>

                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">
                        {currentCategory ? (
                            lang === 'bn' ? currentCategory.name_bn : currentCategory.name_en
                        ) : (
                            'All Category'
                        )}
                    </h1>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="loading-state">
                        <LoadingSpinner size="lg" text={t('common.loading')} fullPage />
                    </div>
                ) : error ? (
                    <ErrorMessage
                        title="Failed to Load"
                        message={error}
                        onRetry={() => categorySlug ? fetchCategoryDetails() : fetchCategories()}
                    />
                ) : currentCategory ? (
                    // Category Details View
                    <div className="category-details">
                        {/* Sub-categories */}
                        {filteredSubCategories.length > 0 && (
                            <>
                                <h2 className="section-title">
                                    Available Service Sub Categories in {lang === 'bn' ? currentCategory.name_bn : currentCategory.name_en}
                                </h2>
                                <div className="categories-grid subcategories">
                                    {filteredSubCategories.map(cat => renderCategoryCard(cat))}
                                </div>
                            </>
                        )}

                        {/* Services List */}
                        {filteredServices.length > 0 && (
                            <div className="services-list-section">
                                {/* Filters Bar */}
                                <div className="filters-bar">
                                    <div className="search-box">
                                        <Search size={18} />
                                        <input
                                            type="text"
                                            placeholder="Write minimum 3 character to search"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        value={ratingFilter}
                                        onChange={(e) => setRatingFilter(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">Select Rating Star</option>
                                        <option value="5">5 Stars</option>
                                        <option value="4">4+ Stars</option>
                                        <option value="3">3+ Stars</option>
                                    </select>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="filter-select"
                                    >
                                        <option value="">Sort By</option>
                                        <option value="price_low">Price: Low to High</option>
                                        <option value="price_high">Price: High to Low</option>
                                        <option value="rating">Top Rated</option>
                                    </select>
                                </div>

                                {/* Services Grid */}
                                <div className="services-listing-grid">
                                    {filteredServices.map(service => renderServiceCard(service))}
                                </div>
                            </div>
                        )}

                        {filteredSubCategories.length === 0 && filteredServices.length === 0 && (
                            <div className="empty-state">
                                <Grid3X3 size={48} />
                                <h3>No services available</h3>
                                <p>There are no services in this category yet.</p>
                                <Link to="/services" className="btn btn-primary">
                                    Browse All Categories
                                </Link>
                            </div>
                        )}
                    </div>
                ) : (
                    // All Categories View
                    <div className="all-categories">
                        <h2 className="section-title">Categories</h2>
                        {filteredCategories.length > 0 ? (
                            <div className="categories-grid">
                                {filteredCategories.map(cat => renderCategoryCard(cat))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <Grid3X3 size={48} />
                                <h3>No categories found</h3>
                                <p>No categories match your search.</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setSearchQuery('')}
                                >
                                    Clear Search
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, Shield, Clock, Users, Award, ChevronRight, Zap, Wrench, Droplets, Paintbrush, Car, Sparkles, Cpu, Home, Scissors, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Category, Service, Product } from '../../types/database';
import './HomePage.css';

// Category icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
    'electrical-services': <Zap size={32} />,
    'ac-repair-services': <Sparkles size={32} />,
    'computer-repair-services': <Cpu size={32} />,
    'plumbing-services': <Droplets size={32} />,
    'cleaning-services': <Sparkles size={32} />,
    'home-appliance-repair': <Home size={32} />,
    'renovation-interior': <Paintbrush size={32} />,
    'car-services': <Car size={32} />,
    'personal-care-services': <Scissors size={32} />,
    'general-services': <Package size={32} />,
};

export default function HomePage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [_isLoading, setIsLoading] = useState(true);
    const lang = i18n.language as 'en' | 'bn';

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const { data: categoriesData } = await (supabase
                    .from('categories') as any)
                    .select('*')
                    .eq('status', 'active')
                    .is('parent_id', null)
                    .order('display_order', { ascending: true })
                    .limit(10);

                if (categoriesData) {
                    setCategories(categoriesData);
                }

                // Fetch featured services
                const { data: servicesData } = await (supabase
                    .from('services') as any)
                    .select('*, provider:users(*), category:categories(*)')
                    .eq('status', 'active')
                    .eq('is_featured', true)
                    .order('avg_rating', { ascending: false })
                    .limit(8);

                if (servicesData) {
                    setFeaturedServices(servicesData as Service[]);
                }

                // Fetch products (max 10, pinned first)
                const { data: productsData } = await (supabase
                    .from('products') as any)
                    .select('*, category:categories(name_en, name_bn)')
                    .eq('status', 'active')
                    .order('is_pinned', { ascending: false })
                    .order('created_at', { ascending: false })
                    .limit(10);

                if (productsData) {
                    setFeaturedProducts(productsData as Product[]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/services?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const stats = [
        { value: '10K+', label: t('home.servicesCompleted') },
        { value: '500+', label: t('home.activeProviders') },
        { value: '15K+', label: t('home.happyCustomers') },
        { value: '64+', label: t('home.citiesCovered') },
    ];

    const features = [
        { icon: <Star size={24} />, title: t('home.rating'), color: '#f59e0b' },
        { icon: <Clock size={24} />, title: t('home.support247'), color: '#10b981' },
        { icon: <Shield size={24} />, title: t('home.securePayments'), color: '#3b82f6' },
        { icon: <Users size={24} />, title: t('home.professionals'), color: '#8b5cf6' },
        { icon: <Award size={24} />, title: t('home.moneyBack'), color: '#ec4899' },
    ];

    const testimonials = [
        {
            name: 'Rahim Ahmed',
            photo: null,
            rating: 5,
            text: 'Excellent service! The electrician was professional and fixed all issues quickly. Highly recommended!',
            service: 'Electrical Services',
        },
        {
            name: 'Fatima Khan',
            photo: null,
            rating: 5,
            text: 'Very impressed with the AC repair service. The technician was punctual and skilled. Will use again!',
            service: 'AC Repair',
        },
        {
            name: 'Karim Hossain',
            photo: null,
            rating: 5,
            text: 'The cleaning service was thorough and the team was very respectful. My home has never looked better!',
            service: 'Cleaning Services',
        },
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg" />
                <div className="container hero-content">
                    <div className="hero-text">
                        <span className="hero-badge">
                            <Star size={16} fill="currentColor" />
                            {t('home.satisfiedCustomers')}
                        </span>
                        <h1 className="hero-title">{t('home.heroTitle')}</h1>
                        <p className="hero-subtitle">{t('home.heroSubtitle')}</p>

                        <form className="hero-search" onSubmit={handleSearch}>
                            <div className="search-input-wrapper">
                                <Search size={20} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder={t('home.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg">
                                {t('home.searchButton')}
                            </button>
                        </form>
                    </div>

                    <div className="hero-cards hide-mobile">
                        <div className="hero-card customer-card">
                            <div className="card-icon">👤</div>
                            <h3>For Customers</h3>
                            <p>Find and book trusted service providers for all your needs</p>
                            <Link to="/services" className="card-link">
                                Browse Services <ChevronRight size={16} />
                            </Link>
                        </div>
                        <div className="hero-card provider-card">
                            <div className="card-icon">💼</div>
                            <h3>For Providers</h3>
                            <p>Join our platform and grow your service business</p>
                            <Link to="/register?role=provider" className="card-link">
                                Become a Partner <ChevronRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">{t('home.categoriesTitle')}</h2>
                        <Link to="/services" className="section-link">
                            {t('home.exploreMore')} <ChevronRight size={18} />
                        </Link>
                    </div>

                    <div className="categories-grid">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/services?category=${category.slug}`}
                                className="category-card"
                            >
                                <div className="category-icon">
                                    {categoryIcons[category.slug] || <Wrench size={32} />}
                                </div>
                                <h3 className="category-name">
                                    {lang === 'bn' ? category.name_bn : category.name_en}
                                </h3>
                                <span className="category-count">
                                    {category.service_count} services
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Services Section */}
            <section className="featured-section section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">{t('home.featuredServices')}</h2>
                        <Link to="/services?featured=true" className="section-link">
                            {t('common.viewAll')} <ChevronRight size={18} />
                        </Link>
                    </div>

                    <div className="services-grid">
                        {featuredServices.length > 0 ? (
                            featuredServices.map((service) => (
                                <Link
                                    key={service.id}
                                    to={`/services/${service.slug}`}
                                    className="service-card card"
                                >
                                    <div className="card-image">
                                        <img
                                            src={service.images?.[0] || '/placeholder-service.jpg'}
                                            alt={lang === 'bn' ? service.title_bn : service.title_en}
                                        />
                                        {service.is_featured && (
                                            <span className="featured-badge">Featured</span>
                                        )}
                                    </div>
                                    <div className="card-body">
                                        <div className="service-category">
                                            {service.category && (lang === 'bn' ? service.category.name_bn : service.category.name_en)}
                                        </div>
                                        <h3 className="service-title">
                                            {lang === 'bn' ? service.title_bn : service.title_en}
                                        </h3>
                                        <div className="service-rating">
                                            <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                            <span>{service.avg_rating.toFixed(1)}</span>
                                            <span className="rating-count">({service.total_ratings})</span>
                                        </div>
                                        <div className="service-footer">
                                            <div className="service-price">
                                                <span className="price-label">{t('home.startingFrom')}</span>
                                                <span className="price-value">৳{service.price_display}</span>
                                            </div>
                                            <button className="btn btn-primary btn-sm">
                                                {t('home.bookNow')}
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            // Placeholder cards if no services
                            <div className="no-services">
                                <p>Services coming soon!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="products-section section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Featured Products</h2>
                        <Link to="/products" className="section-link">
                            {t('common.viewAll')} <ChevronRight size={18} />
                        </Link>
                    </div>

                    <div className="products-grid">
                        {featuredProducts.length > 0 ? (
                            featuredProducts.map((product: any) => (
                                <Link
                                    key={product.id}
                                    to={`/products/${product.slug}`}
                                    className="product-card card"
                                >
                                    <div className="card-image">
                                        <img
                                            src={product.images?.[0] || '/placeholder-product.jpg'}
                                            alt={lang === 'bn' ? product.name_bn : product.name_en}
                                        />
                                        {product.is_pinned && (
                                            <span className="pinned-badge">📌 Featured</span>
                                        )}
                                        {product.sale_price && (
                                            <span className="sale-badge">
                                                {Math.round((1 - product.sale_price / product.regular_price) * 100)}% OFF
                                            </span>
                                        )}
                                    </div>
                                    <div className="card-body">
                                        <div className="product-category">
                                            {product.category && (lang === 'bn' ? product.category.name_bn : product.category.name_en)}
                                        </div>
                                        <h3 className="product-title">
                                            {lang === 'bn' ? product.name_bn : product.name_en}
                                        </h3>
                                        <div className="product-rating">
                                            <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                            <span>{product.avg_rating?.toFixed(1) || '0.0'}</span>
                                            <span className="rating-count">({product.total_ratings || 0})</span>
                                        </div>
                                        <div className="product-footer">
                                            <div className="product-price">
                                                {product.sale_price ? (
                                                    <>
                                                        <span className="price-value">৳{product.sale_price.toLocaleString()}</span>
                                                        <span className="price-old">৳{product.regular_price.toLocaleString()}</span>
                                                    </>
                                                ) : (
                                                    <span className="price-value">৳{product.regular_price?.toLocaleString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="no-services">
                                <p>Products coming soon!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <section className="features-section section">
                <div className="container">
                    <h2 className="section-title text-center">{t('home.whyChooseUs')}</h2>
                    <p className="section-subtitle text-center">
                        We're committed to providing the best service experience
                    </p>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon" style={{ color: feature.color }}>
                                    {feature.icon}
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="stats-section">
                <div className="container">
                    <h2 className="section-title text-center text-inverse">{t('home.statistics')}</h2>
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section section">
                <div className="container">
                    <h2 className="section-title text-center">{t('home.customerReviews')}</h2>
                    <p className="section-subtitle text-center">
                        See what our customers are saying about us
                    </p>

                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="testimonial-card card">
                                <div className="testimonial-header">
                                    <div className="avatar avatar-lg">
                                        {testimonial.photo ? (
                                            <img src={testimonial.photo} alt={testimonial.name} />
                                        ) : (
                                            testimonial.name.charAt(0)
                                        )}
                                    </div>
                                    <div className="testimonial-author">
                                        <h4 className="author-name">{testimonial.name}</h4>
                                        <span className="author-service">{testimonial.service}</span>
                                    </div>
                                </div>
                                <div className="testimonial-rating">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            fill={i < testimonial.rating ? '#f59e0b' : 'none'}
                                            color={i < testimonial.rating ? '#f59e0b' : '#d1d5db'}
                                        />
                                    ))}
                                </div>
                                <p className="testimonial-text">"{testimonial.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to Get Started?</h2>
                        <p className="cta-text">
                            Join thousands of satisfied customers and find the perfect service provider today.
                        </p>
                        <div className="cta-buttons">
                            <Link to="/services" className="btn btn-primary btn-lg">
                                Browse Services
                            </Link>
                            <Link to="/register?role=provider" className="btn btn-outline btn-lg">
                                Become a Provider
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

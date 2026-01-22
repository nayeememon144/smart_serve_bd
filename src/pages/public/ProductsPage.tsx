/* eslint-disable @typescript-eslint/no-explicit-any */


import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import type { Product, Category } from '../../types/database';
import toast from 'react-hot-toast';
import './ProductsPage.css';

export default function ProductsPage() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language as 'en' | 'bn';
    const [searchParams, setSearchParams] = useSearchParams();
    const { addItem } = useCartStore();
    useAuthStore();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch product categories
                const { data: categoriesData } = await (supabase
                    .from('categories') as any)
                    .select('*')
                    .eq('status', 'active')
                    .in('slug', ['electronics-gadgets', 'home-appliances-products', 'tools-equipment',
                        'books-stationery', 'fashion-accessories', 'health-beauty',
                        'groceries-essentials', 'sports-fitness'])
                    .order('display_order');

                if (categoriesData) setCategories(categoriesData);

                // Build products query
                let query = (supabase
                    .from('products') as any)
                    .select('*, seller:users(id, full_name), category:categories(name_en, name_bn, slug)')
                    .eq('status', 'active');

                if (selectedCategory) {
                    const cat = categoriesData?.find((c: any) => c.slug === selectedCategory);
                    if (cat) {
                        query = query.eq('category_id', cat.id);
                    }
                }

                // Sort
                switch (sortBy) {
                    case 'price_low':
                        query = query.order('regular_price', { ascending: true });
                        break;
                    case 'price_high':
                        query = query.order('regular_price', { ascending: false });
                        break;
                    case 'popular':
                        query = query.order('total_sales', { ascending: false });
                        break;
                    case 'rating':
                        query = query.order('avg_rating', { ascending: false });
                        break;
                    default:
                        query = query.order('created_at', { ascending: false });
                }

                const { data: productsData } = await query.limit(50);

                if (productsData) setProducts(productsData as Product[]);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [selectedCategory, sortBy]);

    const handleAddToCart = (product: Product, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product, 1);
        toast.success('Added to cart!');
    };

    const handleCategoryChange = (slug: string) => {
        setSelectedCategory(slug);
        if (slug) {
            searchParams.set('category', slug);
        } else {
            searchParams.delete('category');
        }
        setSearchParams(searchParams);
    };

    const filteredProducts = products.filter(product => {
        const name = lang === 'bn' ? product.name_bn : product.name_en;
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
        const price = product.sale_price || product.regular_price;
        const matchesPrice = price >= priceRange.min && price <= priceRange.max;
        return matchesSearch && matchesPrice;
    });

    const getDiscountedPrice = (product: Product) => {
        return product.sale_price || product.regular_price;
    };

    return (
        <div className="products-page">
            <div className="container">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">{t('products.title')}</h1>
                    <p className="page-subtitle">Shop quality products from verified sellers</p>
                </div>

                <div className="products-layout">
                    {/* Sidebar Filters */}
                    <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
                        <div className="filters-header">
                            <h3>{t('services.filters')}</h3>
                            <button className="close-filters hide-desktop" onClick={() => setShowFilters(false)}>
                                ✕
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="filter-section">
                            <h4>{t('services.category')}</h4>
                            <div className="category-list">
                                <button
                                    className={`category-item ${!selectedCategory ? 'active' : ''}`}
                                    onClick={() => handleCategoryChange('')}
                                >
                                    {t('common.all')}
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        className={`category-item ${selectedCategory === cat.slug ? 'active' : ''}`}
                                        onClick={() => handleCategoryChange(cat.slug)}
                                    >
                                        {lang === 'bn' ? cat.name_bn : cat.name_en}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="filter-section">
                            <h4>{t('services.priceRange')}</h4>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={priceRange.min || ''}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                                    className="form-input"
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={priceRange.max === 100000 ? '' : priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) || 100000 })}
                                    className="form-input"
                                />
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="products-main">
                        {/* Toolbar */}
                        <div className="products-toolbar">
                            <div className="search-box">
                                <Search size={20} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="form-input"
                                />
                            </div>

                            <div className="toolbar-right">
                                <button
                                    className="filter-toggle hide-desktop"
                                    onClick={() => setShowFilters(true)}
                                >
                                    <Filter size={18} />
                                    {t('services.filters')}
                                </button>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="newest">{t('services.newest')}</option>
                                    <option value="popular">{t('services.popular')}</option>
                                    <option value="price_low">{t('services.priceLowHigh')}</option>
                                    <option value="price_high">{t('services.priceHighLow')}</option>
                                    <option value="rating">{t('services.topRated')}</option>
                                </select>

                                <div className="view-toggle hide-mobile">
                                    <button
                                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results Count */}
                        <div className="results-info">
                            <span>{filteredProducts.length} products found</span>
                        </div>

                        {/* Products Grid */}
                        {isLoading ? (
                            <div className="loading-state">
                                <div className="spinner" />
                                <p>{t('common.loading')}</p>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className={`products-grid ${viewMode}`}>
                                {filteredProducts.map((product) => (
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
                                            {product.discount_percentage > 0 && (
                                                <span className="discount-badge">-{product.discount_percentage}%</span>
                                            )}
                                            <div className="card-actions">
                                                <button
                                                    className="action-btn wishlist-btn"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                >
                                                    <Heart size={18} />
                                                </button>
                                                <button
                                                    className="action-btn cart-btn"
                                                    onClick={(e) => handleAddToCart(product, e)}
                                                >
                                                    <ShoppingCart size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <span className="product-category">
                                                {product.category && (lang === 'bn' ? product.category.name_bn : product.category.name_en)}
                                            </span>
                                            <h3 className="product-name">
                                                {lang === 'bn' ? product.name_bn : product.name_en}
                                            </h3>
                                            <div className="product-rating">
                                                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                                <span>{product.avg_rating.toFixed(1)}</span>
                                                <span className="rating-count">({product.total_ratings})</span>
                                            </div>
                                            <div className="product-price">
                                                <span className="current-price">৳{getDiscountedPrice(product)}</span>
                                                {product.sale_price && (
                                                    <span className="original-price">৳{product.regular_price}</span>
                                                )}
                                            </div>
                                            <div className="product-stock">
                                                {product.stock_quantity > product.low_stock_threshold ? (
                                                    <span className="in-stock">{t('products.inStock')}</span>
                                                ) : product.stock_quantity > 0 ? (
                                                    <span className="low-stock">{t('products.lowStock')}</span>
                                                ) : (
                                                    <span className="out-of-stock">{t('products.outOfStock')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <h3>No products found</h3>
                                <p>Try adjusting your filters or search query</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory('');
                                        setPriceRange({ min: 0, max: 100000 });
                                    }}
                                >
                                    {t('services.clearFilters')}
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

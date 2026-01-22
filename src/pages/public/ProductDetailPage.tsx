/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Star, Minus, Plus, Heart, Share2, ShoppingCart,
    ChevronRight, Truck, Shield, RefreshCw, Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import type { Product, Review } from '../../types/database';
import toast from 'react-hot-toast';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
    const { t, i18n } = useTranslation();
    const { slug } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const { addItem } = useCartStore();

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');

    const currentLang = i18n.language as 'en' | 'bn';

    useEffect(() => {
        if (slug) {
            fetchProduct();
        }
    }, [slug]);

    const fetchProduct = async () => {
        try {
            setIsLoading(true);

            // Fetch product
            const { data: productData, error } = await (supabase
                .from('products') as any)
                .select('*, seller:users!products_seller_id_fkey(full_name, profile_photo), category:categories(name_en, name_bn)')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            setProduct(productData as Product);

            // Increment view count
            await (supabase as any).rpc('increment_product_views', { product_id: productData.id });

            // Fetch reviews
            const { data: reviewsData } = await (supabase
                .from('reviews') as any)
                .select('*, user:users(full_name, profile_photo)')
                .eq('item_type', 'product')
                .eq('item_id', productData.id)
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(5);

            if (reviewsData) setReviews(reviewsData as Review[]);

            // Fetch related products
            if (productData.category_id) {
                const { data: relatedData } = await (supabase
                    .from('products') as any)
                    .select('*')
                    .eq('category_id', productData.category_id)
                    .neq('id', productData.id)
                    .eq('status', 'active')
                    .limit(4);

                if (relatedData) setRelatedProducts(relatedData as Product[]);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Product not found');
            navigate('/products');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!product) return;

        addItem(product, quantity);

        toast.success(t('products.addedToCart'));
    };

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            toast.error(t('common.loginRequired'));
            navigate('/login');
            return;
        }

        handleAddToCart();
        navigate('/checkout');
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({
                title: product?.name_en,
                url,
            });
        } else {
            await navigator.clipboard.writeText(url);
            toast.success(t('common.linkCopied'));
        }
    };

    if (isLoading) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-page">
                <div className="container">
                    <div className="empty-state">
                        <h2>Product not found</h2>
                        <Link to="/products" className="btn btn-primary">Browse Products</Link>
                    </div>
                </div>
            </div>
        );
    }

    const productName = currentLang === 'en' ? product.name_en : product.name_bn;
    const productDescription = currentLang === 'en' ? product.description_en : product.description_bn;
    const discountAmount = product.sale_price ? product.regular_price - product.sale_price : 0;
    const discountPercentage = product.sale_price ? Math.round((discountAmount / product.regular_price) * 100) : 0;

    return (
        <div className="product-detail-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link to="/">{t('nav.home')}</Link>
                    <ChevronRight size={14} />
                    <Link to="/products">{t('nav.products')}</Link>
                    <ChevronRight size={14} />
                    <span>{productName}</span>
                </nav>

                <div className="product-detail-grid">
                    {/* Product Images */}
                    <div className="product-gallery">
                        <div className="main-image">
                            <img
                                src={product.images?.[selectedImage] || '/placeholder-product.jpg'}
                                alt={productName}
                            />
                            {discountPercentage > 0 && (
                                <span className="discount-badge">-{discountPercentage}%</span>
                            )}
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="thumbnail-list">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={image} alt={`${productName} ${index + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="product-info">
                        <div className="product-header">
                            <span className="category-tag">
                                {(product.category as any)?.[`name_${currentLang}`]}
                            </span>
                            <h1>{productName}</h1>

                            <div className="product-meta">
                                <div className="rating">
                                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                    <span className="rating-value">{product.avg_rating.toFixed(1)}</span>
                                    <span className="rating-count">({product.total_ratings} reviews)</span>
                                </div>
                                <span className="divider">•</span>
                                <span className="sales">{product.total_sales} sold</span>
                            </div>
                        </div>

                        <div className="product-price">
                            <div className="price-main">
                                <span className="current-price">৳{(product.sale_price || product.regular_price).toLocaleString()}</span>
                                {product.sale_price && (
                                    <span className="original-price">৳{product.regular_price.toLocaleString()}</span>
                                )}
                            </div>
                            {discountPercentage > 0 && (
                                <span className="save-amount">Save ৳{discountAmount.toLocaleString()}</span>
                            )}
                        </div>

                        <div className="stock-status">
                            {product.stock_quantity > 0 ? (
                                <span className="in-stock">
                                    <Check size={16} /> In Stock ({product.stock_quantity} available)
                                </span>
                            ) : (
                                <span className="out-of-stock">Out of Stock</span>
                            )}
                        </div>

                        <div className="product-actions">
                            <div className="quantity-selector">
                                <button
                                    className="qty-btn"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="qty-value">{quantity}</span>
                                <button
                                    className="qty-btn"
                                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                                    disabled={quantity >= product.stock_quantity}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            <button
                                className="btn btn-outline add-to-cart"
                                onClick={handleAddToCart}
                                disabled={product.stock_quantity === 0}
                            >
                                <ShoppingCart size={18} />
                                {t('products.addToCart')}
                            </button>

                            <button
                                className="btn btn-primary buy-now"
                                onClick={handleBuyNow}
                                disabled={product.stock_quantity === 0}
                            >
                                Buy Now
                            </button>
                        </div>

                        <div className="action-links">
                            <button className="action-link">
                                <Heart size={18} />
                                Add to Wishlist
                            </button>
                            <button className="action-link" onClick={handleShare}>
                                <Share2 size={18} />
                                Share
                            </button>
                        </div>

                        <div className="product-features">
                            <div className="feature">
                                <Truck size={20} />
                                <div>
                                    <strong>Free Delivery</strong>
                                    <span>On orders over ৳1000</span>
                                </div>
                            </div>
                            <div className="feature">
                                <Shield size={20} />
                                <div>
                                    <strong>Warranty</strong>
                                    <span>1 Year warranty</span>
                                </div>
                            </div>
                            <div className="feature">
                                <RefreshCw size={20} />
                                <div>
                                    <strong>Easy Returns</strong>
                                    <span>7 days return policy</span>
                                </div>
                            </div>
                        </div>

                        <div className="seller-info">
                            <span className="label">Sold by:</span>
                            <Link to="#" className="seller-link">
                                {(product.seller as any)?.full_name || 'Unknown Seller'}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Product Tabs */}
                <div className="product-tabs">
                    <div className="tabs-header">
                        <button
                            className={`tab ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Description
                        </button>
                        <button
                            className={`tab ${activeTab === 'specifications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('specifications')}
                        >
                            Specifications
                        </button>
                        <button
                            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reviews ({product.total_ratings})
                        </button>
                    </div>

                    <div className="tabs-content">
                        {activeTab === 'description' && (
                            <div className="tab-pane description">
                                {productDescription || 'No description available.'}
                            </div>
                        )}

                        {activeTab === 'specifications' && (
                            <div className="tab-pane specifications">
                                {product.specifications ? (
                                    <table className="specs-table">
                                        <tbody>
                                            {Object.entries(product.specifications as Record<string, string>).map(([key, value]) => (
                                                <tr key={key}>
                                                    <th>{key}</th>
                                                    <td>{value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No specifications available.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="tab-pane reviews">
                                {reviews.length > 0 ? (
                                    <div className="reviews-list">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="review-card">
                                                <div className="review-header">
                                                    <div className="reviewer">
                                                        <div className="avatar">
                                                            {(review.user as any)?.profile_photo ? (
                                                                <img src={(review.user as any).profile_photo} alt="" />
                                                            ) : (
                                                                (review.user as any)?.full_name?.charAt(0)
                                                            )}
                                                        </div>
                                                        <div>
                                                            <strong>{(review.user as any)?.full_name}</strong>
                                                            <div className="review-date">
                                                                {new Date(review.created_at).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="review-rating">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                fill={i < review.rating ? '#f59e0b' : 'none'}
                                                                color="#f59e0b"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="review-content">{review.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="related-products">
                        <h2>Related Products</h2>
                        <div className="products-grid">
                            {relatedProducts.map((prod) => (
                                <Link key={prod.id} to={`/products/${prod.slug}`} className="product-card">
                                    <div className="product-image">
                                        <img src={prod.images?.[0] || '/placeholder-product.jpg'} alt={prod.name_en} />
                                    </div>
                                    <div className="product-info">
                                        <h3>{currentLang === 'en' ? prod.name_en : prod.name_bn}</h3>
                                        <div className="rating">
                                            <Star size={12} fill="#f59e0b" color="#f59e0b" />
                                            <span>{prod.avg_rating.toFixed(1)}</span>
                                        </div>
                                        <div className="price">
                                            <span className="current">৳{(prod.sale_price || prod.regular_price).toLocaleString()}</span>
                                            {prod.sale_price && (
                                                <span className="original">৳{prod.regular_price.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

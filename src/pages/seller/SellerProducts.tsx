 
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Edit2, Trash2, Eye,
    Search, Grid, List, Package, AlertTriangle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './SellerProducts.css';

interface Product {
    id: string;
    name_en: string;
    name_bn: string;
    slug: string;
    images: string[] | null;
    regular_price: number;
    sale_price: number | null;
    stock_quantity: number;
    status: 'active' | 'draft' | 'out_of_stock';
    avg_rating: number;
    total_sales: number;
    created_at: string;
    category?: {
        name_en: string;
    };
}

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'active' | 'draft' | 'out_of_stock';

export default function SellerProducts() {
    const { user } = useAuthStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [user?.id]);

    useEffect(() => {
        filterProducts();
    }, [statusFilter, searchQuery, products]);

    const fetchProducts = async () => {
        if (!user?.id) return;

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*, category:categories(name_en)')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data as Product[] || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];

        if (statusFilter !== 'all') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name_en.toLowerCase().includes(query) ||
                p.name_bn?.toLowerCase().includes(query)
            );
        }

        setFilteredProducts(filtered);
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) throw error;

            toast.success('Product deleted');
            setProducts(prev => prev.filter(p => p.id !== productId));
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const getStatusBadge = (status: string) => {
        const config: Record<string, { class: string; label: string }> = {
            active: { class: 'status-active', label: 'Active' },
            draft: { class: 'status-draft', label: 'Draft' },
            out_of_stock: { class: 'status-oos', label: 'Out of Stock' },
        };
        const s = config[status] || config.draft;
        return <span className={`status-badge ${s.class}`}>{s.label}</span>;
    };

    const getStockIndicator = (stock: number) => {
        if (stock === 0) {
            return <span className="stock-badge oos"><AlertTriangle size={12} /> Out of Stock</span>;
        }
        if (stock <= 5) {
            return <span className="stock-badge low">Low Stock: {stock}</span>;
        }
        return <span className="stock-badge normal">In Stock: {stock}</span>;
    };

    const stats = {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        outOfStock: products.filter(p => p.stock_quantity === 0).length,
        lowStock: products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length,
    };

    return (
        <div className="seller-products-page">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1>My Products</h1>
                    <p>Manage your product inventory</p>
                </div>
                <Link to="/seller/products/new" className="btn btn-primary">
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            {/* Stats Row */}
            <div className="stats-row">
                <div className="mini-stat">
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total Products</span>
                </div>
                <div className="mini-stat">
                    <span className="stat-value success">{stats.active}</span>
                    <span className="stat-label">Active</span>
                </div>
                <div className="mini-stat">
                    <span className="stat-value warning">{stats.lowStock}</span>
                    <span className="stat-label">Low Stock</span>
                </div>
                <div className="mini-stat">
                    <span className="stat-value danger">{stats.outOfStock}</span>
                    <span className="stat-label">Out of Stock</span>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-row">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
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
                        <option value="draft">Draft</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>

                    <div className="view-toggle">
                        <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
                            <Grid size={18} />
                        </button>
                        <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="products-container">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                        <p>Loading products...</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className={`products-${viewMode}`}>
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="product-card">
                                <div className="product-image">
                                    <img src={product.images?.[0] || '/placeholder-product.jpg'} alt={product.name_en} />
                                    {getStatusBadge(product.status)}
                                </div>

                                <div className="product-content">
                                    <h3 className="product-title">{product.name_en}</h3>
                                    {product.category && (
                                        <span className="product-category">{product.category.name_en}</span>
                                    )}

                                    <div className="product-pricing">
                                        {product.sale_price ? (
                                            <>
                                                <span className="sale-price">৳{product.sale_price.toLocaleString()}</span>
                                                <span className="regular-price">৳{product.regular_price.toLocaleString()}</span>
                                            </>
                                        ) : (
                                            <span className="sale-price">৳{product.regular_price.toLocaleString()}</span>
                                        )}
                                    </div>

                                    <div className="product-meta">
                                        {getStockIndicator(product.stock_quantity)}
                                        <span className="sales-count">{product.total_sales || 0} sold</span>
                                    </div>
                                </div>

                                <div className="product-actions">
                                    <Link to={`/products/${product.slug}`} className="action-btn" title="View">
                                        <Eye size={16} />
                                    </Link>
                                    <Link to={`/seller/products/${product.id}/edit`} className="action-btn" title="Edit">
                                        <Edit2 size={16} />
                                    </Link>
                                    <button className="action-btn danger" onClick={() => handleDelete(product.id)} title="Delete">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <Package size={48} />
                        <h3>No products yet</h3>
                        <p>Add your first product to start selling</p>
                        <Link to="/seller/products/new" className="btn btn-primary">
                            <Plus size={18} />
                            Add Product
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import {
    Search, ChevronLeft, ChevronRight, Star, Package, Plus, Edit2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import './AdminStyles.css';

interface Product {
    id: string;
    name_en: string;
    name_bn: string;
    slug: string;
    description_en: string | null;
    regular_price: number;
    sale_price: number | null;
    stock_quantity: number;
    status: string;
    is_featured: boolean;
    avg_rating: number;
    total_ratings: number;
    total_sales: number;
    images: string[] | null;
    created_at: string;
    category?: {
        name_en: string;
    };
}



export default function AdminProducts() {
    const { user, isAuthenticated } = useAuthStore();

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchProducts();
        }
    }, [user, page, searchQuery, statusFilter]);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);

            let query = (supabase
                .from('products') as any)
                .select(`
                    *,
                    category:categories(name_en)
                `, { count: 'exact' })
                .order('created_at', { ascending: false })
                .range((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE - 1);

            if (searchQuery) {
                query = query.or(`name_en.ilike.%${searchQuery}%,name_bn.ilike.%${searchQuery}%`);
            }

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter);
            }

            const { data, count, error } = await query;

            if (error) throw error;
            setProducts(data as Product[]);
            setTotalCount(count || 0);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };



    const formatPrice = (price: number) => `৳${price.toLocaleString()}`;

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { class: string; label: string }> = {
            active: { class: 'success', label: 'Active' },
            draft: { class: 'warning', label: 'Draft' },
            out_of_stock: { class: 'error', label: 'Out of Stock' },
            discontinued: { class: 'default', label: 'Discontinued' },
        };
        const s = statusMap[status] || { class: 'default', label: status };
        return <span className={`badge badge-${s.class}`}>{s.label}</span>;
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/1234/admin" replace />;
    }

    return (
        <>
            <header className="admin-header">
                <div>
                    <h1>Product Management</h1>
                    <p>Manage marketplace products</p>
                </div>
                <Link to="/1234/admin/products/new" className="btn btn-primary">
                    <Plus size={18} /> Add Product
                </Link>
            </header>

            {/* Filters */}
            <div className="filters-section">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="discontinued">Discontinued</option>
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="data-table-wrapper">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <Package size={48} />
                        <h3>No products found</h3>
                        <p>Products will appear here when sellers add them.</p>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Rating</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product.id}>
                                        <td>
                                            <div className="product-cell">
                                                <div className="product-image">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt={product.name_en} />
                                                    ) : (
                                                        <Package size={24} />
                                                    )}
                                                </div>
                                                <div className="product-info">
                                                    <span className="product-name">{product.name_en}</span>
                                                    {product.is_featured && (
                                                        <span className="featured-badge">
                                                            <Star size={12} /> Featured
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>{product.category?.name_en || 'Uncategorized'}</td>
                                        <td>
                                            <div className="price-cell">
                                                {product.sale_price ? (
                                                    <>
                                                        <span className="sale-price">{formatPrice(product.sale_price)}</span>
                                                        <span className="regular-price">{formatPrice(product.regular_price)}</span>
                                                    </>
                                                ) : (
                                                    <span>{formatPrice(product.regular_price)}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`stock-badge ${product.stock_quantity < 10 ? 'low' : ''}`}>
                                                {product.stock_quantity}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="rating-cell">
                                                <Star size={14} className="star-icon" />
                                                <span>{product.avg_rating.toFixed(1)}</span>
                                                <small>({product.total_ratings})</small>
                                            </div>
                                        </td>
                                        <td>{getStatusBadge(product.status)}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <Link to={`/1234/admin/products/${product.id}/edit`} className="btn btn-sm btn-outline">
                                                    <Edit2 size={14} /> Edit
                                                </Link>
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

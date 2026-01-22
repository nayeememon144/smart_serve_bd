/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Save, Plus, X, Star, Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './AdminStyles.css';

interface ProductVariant {
    id: string;
    name: string;
    price_adjustment: number;
    stock: number;
}

export default function AdminProductForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuthStore();
    const isEditing = Boolean(id);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name_en: '',
        name_bn: '',
        description_en: '',
        description_bn: '',
        regular_price: '',
        sale_price: '',
        stock_quantity: '',
        status: 'draft',
        is_featured: false,
        is_pinned: false, // Pin to homepage
    });

    const [images, setImages] = useState<string[]>([]);
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [newVariant, setNewVariant] = useState({ name: '', price_adjustment: 0, stock: 0 });

    useEffect(() => {
        if (isEditing) {
            fetchProduct();
        }
    }, [id]);



    const fetchProduct = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const { data, error } = await (supabase
                .from('products') as any)
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                const productData = data as any;
                setFormData({
                    name_en: productData.name_en || '',
                    name_bn: productData.name_bn || '',
                    description_en: productData.description_en || '',
                    description_bn: productData.description_bn || '',
                    regular_price: productData.regular_price?.toString() || '',
                    sale_price: productData.sale_price?.toString() || '',
                    stock_quantity: productData.stock_quantity?.toString() || '',
                    status: productData.status || 'draft',
                    is_featured: productData.is_featured || false,
                    is_pinned: productData.is_pinned || false,
                });
                setImages(productData.images || []);
                setVariants(productData.variants || []);
            }
        } catch (error) {
            toast.error('Failed to load product');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addVariant = () => {
        if (!newVariant.name.trim()) {
            toast.error('Variant name is required');
            return;
        }
        setVariants(prev => [...prev, { ...newVariant, id: crypto.randomUUID() }]);
        setNewVariant({ name: '', price_adjustment: 0, stock: 0 });
    };

    const removeVariant = (variantId: string) => {
        setVariants(prev => prev.filter(v => v.id !== variantId));
    };

    const addImageUrl = () => {
        const url = prompt('Enter image URL:');
        if (url) {
            setImages(prev => [...prev, url]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name_en || !formData.regular_price) {
            toast.error('Please fill all required fields');
            return;
        }

        setIsSaving(true);
        try {
            const productData = {
                name_en: formData.name_en,
                name_bn: formData.name_bn || null,
                slug: generateSlug(formData.name_en),
                description_en: formData.description_en || null,
                description_bn: formData.description_bn || null,
                regular_price: parseFloat(formData.regular_price),
                sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
                stock_quantity: parseInt(formData.stock_quantity) || 0,
                status: formData.status,
                is_featured: formData.is_featured,
                is_pinned: formData.is_pinned,
                images: images.length > 0 ? images : null,
                variants: variants.length > 0 ? variants : null,
                seller_id: user?.id, // Admin creates as platform product
            };

            if (isEditing) {
                const { error } = await (supabase
                    .from('products') as any)
                    .update(productData as any)
                    .eq('id', id as string);
                if (error) throw error;
                toast.success('Product updated successfully');
            } else {
                const { error } = await (supabase
                    .from('products') as any)
                    .insert(productData as any);
                if (error) throw error;
                toast.success('Product created successfully');
            }

            navigate('/1234/admin/products');
        } catch (error: any) {
            toast.error(error.message || 'Failed to save product');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="loading-state" style={{ minHeight: '400px' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <>
            <header className="admin-header form-page-header">
                <div className="header-left">
                    <button
                        type="button"
                        className="back-btn"
                        onClick={() => navigate('/1234/admin/products')}
                        title="Back to Products"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-title">
                        <h1>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => navigate('/1234/admin/products')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="product-form"
                        className="btn btn-primary"
                        disabled={isSaving}
                    >
                        <Save size={18} />
                        {isSaving ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </header>

            <form id="product-form" onSubmit={handleSubmit} className="admin-form">
                <div className="form-grid">
                    {/* Basic Info */}
                    <div className="form-section">
                        <h3>Basic Information</h3>

                        <div className="form-group">
                            <label htmlFor="name_en">Product Name (English) *</label>
                            <input
                                type="text"
                                id="name_en"
                                name="name_en"
                                value={formData.name_en}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="name_bn">Product Name (Bangla)</label>
                            <input
                                type="text"
                                id="name_bn"
                                name="name_bn"
                                value={formData.name_bn}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description_en">Description (English)</label>
                            <textarea
                                id="description_en"
                                name="description_en"
                                rows={4}
                                value={formData.description_en}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description_bn">Description (Bangla)</label>
                            <textarea
                                id="description_bn"
                                name="description_bn"
                                rows={4}
                                value={formData.description_bn}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className="form-section">
                        <h3>Pricing & Inventory</h3>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="regular_price">Regular Price (৳) *</label>
                                <input
                                    type="number"
                                    id="regular_price"
                                    name="regular_price"
                                    value={formData.regular_price}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="sale_price">Sale Price (৳)</label>
                                <input
                                    type="number"
                                    id="sale_price"
                                    name="sale_price"
                                    value={formData.sale_price}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="stock_quantity">Stock Quantity</label>
                                <input
                                    type="number"
                                    id="stock_quantity"
                                    name="stock_quantity"
                                    value={formData.stock_quantity}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="active">Active</option>
                                    <option value="out_of_stock">Out of Stock</option>
                                    <option value="discontinued">Discontinued</option>
                                </select>
                            </div>
                        </div>

                        {/* Feature/Pin Options */}
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    checked={formData.is_featured}
                                    onChange={handleInputChange}
                                />
                                <Star size={16} />
                                Featured Product
                            </label>
                            <label className="checkbox-label highlight">
                                <input
                                    type="checkbox"
                                    name="is_pinned"
                                    checked={formData.is_pinned}
                                    onChange={handleInputChange}
                                />
                                📌 Pin to Homepage
                            </label>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="form-section">
                        <h3>Product Images</h3>
                        <div className="images-grid">
                            {images.map((img, index) => (
                                <div key={index} className="image-preview">
                                    <img src={img} alt={`Product ${index + 1}`} />
                                    <button type="button" className="remove-btn" onClick={() => removeImage(index)}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="add-image-btn" onClick={addImageUrl}>
                                <ImageIcon size={24} />
                                <span>Add Image URL</span>
                            </button>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="form-section">
                        <h3>Product Variants (Optional)</h3>
                        <p className="section-desc">Add different models or variations of this product</p>

                        {variants.length > 0 && (
                            <div className="variants-list">
                                {variants.map(variant => (
                                    <div key={variant.id} className="variant-item">
                                        <span className="variant-name">{variant.name}</span>
                                        <span className="variant-price">
                                            {variant.price_adjustment >= 0 ? '+' : ''}৳{variant.price_adjustment}
                                        </span>
                                        <span className="variant-stock">{variant.stock} in stock</span>
                                        <button type="button" onClick={() => removeVariant(variant.id)}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="add-variant-form">
                            <input
                                type="text"
                                placeholder="Variant name (e.g., Red, Large, 128GB)"
                                value={newVariant.name}
                                onChange={e => setNewVariant(prev => ({ ...prev, name: e.target.value }))}
                            />
                            <input
                                type="number"
                                placeholder="Price adjustment"
                                value={newVariant.price_adjustment}
                                onChange={e => setNewVariant(prev => ({ ...prev, price_adjustment: parseFloat(e.target.value) || 0 }))}
                            />
                            <input
                                type="number"
                                placeholder="Stock"
                                value={newVariant.stock}
                                onChange={e => setNewVariant(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                            />
                            <button type="button" className="btn btn-outline" onClick={addVariant}>
                                <Plus size={16} /> Add
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}

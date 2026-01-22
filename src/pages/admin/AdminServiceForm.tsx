/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Save, X, Star, Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './AdminStyles.css';

interface Category {
    id: string;
    name_en: string;
    name_bn: string;
    slug: string;
}

export default function AdminServiceForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    useAuthStore();
    const isEditing = Boolean(id);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        title_en: '',
        title_bn: '',
        description_en: '',
        description_bn: '',
        category_id: '', // Required for services
        price_type: 'fixed',
        price_display: '',
        price_min: '',
        price_max: '',
        duration_minutes: '',
        status: 'draft',
        is_featured: false,
    });

    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        fetchCategories();
        if (isEditing) {
            fetchService();
        }
    }, [id]);

    const fetchCategories = async () => {
        // Fetch all active categories
        const { data, error } = await (supabase
            .from('categories') as any)
            .select('id, name_en, name_bn, slug')
            .eq('status', 'active')
            .order('name_en');

        if (error) {
            console.error('Error fetching categories:', error);
            // Try without status filter if it fails
            const { data: allData } = await (supabase
                .from('categories') as any)
                .select('id, name_en, name_bn, slug')
                .order('name_en');
            if (allData) setCategories(allData);
        } else if (data) {
            setCategories(data);
        }
    };

    const fetchService = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const { data, error } = await (supabase
                .from('services') as any)
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                const serviceData = data as any;
                setFormData({
                    title_en: serviceData.title_en || '',
                    title_bn: serviceData.title_bn || '',
                    description_en: serviceData.description_en || '',
                    description_bn: serviceData.description_bn || '',
                    category_id: serviceData.category_id || '',
                    price_type: serviceData.price_type || 'fixed',
                    price_display: serviceData.price_display?.toString() || '',
                    price_min: serviceData.price_min?.toString() || '',
                    price_max: serviceData.price_max?.toString() || '',
                    duration_minutes: serviceData.duration_minutes?.toString() || '',
                    status: serviceData.status || 'draft',
                    is_featured: serviceData.is_featured || false,
                });
                setImages(serviceData.images || []);
            }
        } catch (error) {
            toast.error('Failed to load service');
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

        // Category is REQUIRED for services
        if (!formData.title_en || !formData.category_id || !formData.price_display) {
            toast.error('Please fill all required fields (Title, Category, Price)');
            return;
        }

        setIsSaving(true);
        try {
            // Map form data to actual database columns
            const serviceData = {
                title_en: formData.title_en,
                title_bn: formData.title_bn || formData.title_en, // Use English as fallback for Bangla
                slug: generateSlug(formData.title_en),
                description_en: formData.description_en || null,
                description_bn: formData.description_bn || formData.description_en || null,
                category_id: formData.category_id, // Required
                price_display: parseFloat(formData.price_display),
                price_basic: parseFloat(formData.price_display), // Use same as display for now
                duration_minutes: parseInt(formData.duration_minutes) || null,
                status: formData.status,
                is_featured: formData.is_featured,
                images: images.length > 0 ? images : null,
                // provider_id is optional for admin-created services (platform services)
            };

            if (isEditing) {
                const { error } = await (supabase
                    .from('services') as any)
                    .update(serviceData as any)
                    .eq('id', id as string);
                if (error) throw error;
                toast.success('Service updated successfully');
            } else {
                const { error } = await (supabase
                    .from('services') as any)
                    .insert(serviceData as any);
                if (error) throw error;
                toast.success('Service created successfully');
            }

            navigate('/1234/admin/services');
        } catch (error: any) {
            toast.error(error.message || 'Failed to save service');
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
                        onClick={() => navigate('/1234/admin/services')}
                        title="Back to Services"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-title">
                        <h1>{isEditing ? 'Edit Service' : 'Add New Service'}</h1>
                    </div>
                </div>
                <div className="header-actions">
                    <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => navigate('/1234/admin/services')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="service-form"
                        className="btn btn-primary"
                        disabled={isSaving}
                    >
                        <Save size={18} />
                        {isSaving ? 'Saving...' : 'Save Service'}
                    </button>
                </div>
            </header>

            <form id="service-form" onSubmit={handleSubmit} className="admin-form">
                <div className="form-grid">
                    {/* Basic Info */}
                    <div className="form-section">
                        <h3>Basic Information</h3>

                        <div className="form-group">
                            <label htmlFor="title_en">Service Title (English) *</label>
                            <input
                                type="text"
                                id="title_en"
                                name="title_en"
                                value={formData.title_en}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="title_bn">Service Title (Bangla)</label>
                            <input
                                type="text"
                                id="title_bn"
                                name="title_bn"
                                value={formData.title_bn}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="category_id">Service Category * (Required)</label>
                            <select
                                id="category_id"
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleInputChange}
                                required
                                className="required-field"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                                ))}
                            </select>
                            <small className="field-hint">Service will be displayed under this category</small>
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

                    {/* Pricing */}
                    <div className="form-section">
                        <h3>Pricing & Details</h3>

                        <div className="form-group">
                            <label htmlFor="price_type">Price Type</label>
                            <select
                                id="price_type"
                                name="price_type"
                                value={formData.price_type}
                                onChange={handleInputChange}
                            >
                                <option value="fixed">Fixed Price</option>
                                <option value="range">Price Range</option>
                                <option value="hourly">Hourly Rate</option>
                                <option value="quote">Quote Required</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="price_display">Display Price (৳) *</label>
                                <input
                                    type="number"
                                    id="price_display"
                                    name="price_display"
                                    value={formData.price_display}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="duration_minutes">Duration (minutes)</label>
                                <input
                                    type="number"
                                    id="duration_minutes"
                                    name="duration_minutes"
                                    value={formData.duration_minutes}
                                    onChange={handleInputChange}
                                    min="0"
                                />
                            </div>
                        </div>

                        {formData.price_type === 'range' && (
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="price_min">Minimum Price (৳)</label>
                                    <input
                                        type="number"
                                        id="price_min"
                                        name="price_min"
                                        value={formData.price_min}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="price_max">Maximum Price (৳)</label>
                                    <input
                                        type="number"
                                        id="price_max"
                                        name="price_max"
                                        value={formData.price_max}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>
                            </div>
                        )}

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
                                <option value="paused">Paused</option>
                            </select>
                        </div>

                        {/* Feature Option (NO PIN TO HOMEPAGE for Services) */}
                        <div className="form-group checkbox-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    checked={formData.is_featured}
                                    onChange={handleInputChange}
                                />
                                <Star size={16} />
                                Featured Service
                            </label>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="form-section">
                        <h3>Service Images</h3>
                        <div className="images-grid">
                            {images.map((img, index) => (
                                <div key={index} className="image-preview">
                                    <img src={img} alt={`Service ${index + 1}`} />
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
                </div>
            </form>
        </>
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
    Plus, Edit2, Trash2, Search, X, Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import type { Category } from '../../types/database';
import toast from 'react-hot-toast';
import './AdminStyles.css';

export default function AdminCategories() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryType, setCategoryType] = useState<'all' | 'service' | 'product'>('all');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({
        name_en: '',
        name_bn: '',
        slug: '',
        description_en: '',
        description_bn: '',
        icon: '',
        image: '',
        type: 'service' as 'service' | 'product',
        status: 'active' as 'active' | 'inactive',
        display_order: 0,
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        let filtered = categories;

        if (categoryType !== 'all') {
            filtered = filtered.filter(c => c.type === categoryType);
        }

        if (searchQuery) {
            filtered = filtered.filter(c =>
                c.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.name_bn.includes(searchQuery)
            );
        }

        setFilteredCategories(filtered);
    }, [categories, categoryType, searchQuery]);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('display_order');

            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name_en: category.name_en,
                name_bn: category.name_bn,
                slug: category.slug,
                description_en: category.description_en || '',
                description_bn: category.description_bn || '',
                icon: category.icon || '',
                image: category.image || '',
                type: category.type,
                status: category.status,
                display_order: category.display_order,
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name_en: '',
                name_bn: '',
                slug: '',
                description_en: '',
                description_bn: '',
                icon: '',
                image: '',
                type: 'service',
                status: 'active',
                display_order: categories.length + 1,
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    const handleNameChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            name_en: value,
            slug: generateSlug(value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name_en || !formData.name_bn || !formData.slug) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            if (editingCategory) {
                // Update
                const { error } = await (supabase
                    .from('categories') as any)
                    .update({
                        name_en: formData.name_en,
                        name_bn: formData.name_bn,
                        slug: formData.slug,
                        description_en: formData.description_en,
                        description_bn: formData.description_bn,
                        icon: formData.icon,
                        image: formData.image,
                        type: formData.type,
                        status: formData.status,
                        display_order: formData.display_order,
                    })
                    .eq('id', editingCategory.id);

                if (error) throw error;
                toast.success('Category updated successfully');
            } else {
                // Create
                const { error } = await (supabase
                    .from('categories') as any)
                    .insert({
                        name_en: formData.name_en,
                        name_bn: formData.name_bn,
                        slug: formData.slug,
                        description_en: formData.description_en,
                        description_bn: formData.description_bn,
                        icon: formData.icon,
                        image: formData.image,
                        type: formData.type,
                        status: formData.status,
                        display_order: formData.display_order,
                    });

                if (error) throw error;
                toast.success('Category created successfully');
            }

            handleCloseModal();
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Failed to save category');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
        }
    };

    const toggleStatus = async (category: Category) => {
        const newStatus = category.status === 'active' ? 'inactive' : 'active';

        try {
            const { error } = await (supabase
                .from('categories') as any)
                .update({ status: newStatus })
                .eq('id', category.id);

            if (error) throw error;
            toast.success(`Category ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
            fetchCategories();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (authLoading) {
        return (
            <div className="loading-state" style={{ minHeight: '100vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/1234/admin" replace />;
    }

    return (
        <>
            {/* Header */}
            <header className="admin-header">
                <div>
                    <h1>Category Management</h1>
                    <p>Manage service and product categories</p>
                </div>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    Add Category
                </button>
            </header>

            {/* Filters */}
            <div className="content-filters">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="filter-tabs">
                    <button
                        className={`tab ${categoryType === 'all' ? 'active' : ''}`}
                        onClick={() => setCategoryType('all')}
                    >
                        All ({categories.length})
                    </button>
                    <button
                        className={`tab ${categoryType === 'service' ? 'active' : ''}`}
                        onClick={() => setCategoryType('service')}
                    >
                        Services ({categories.filter(c => c.type === 'service').length})
                    </button>
                    <button
                        className={`tab ${categoryType === 'product' ? 'active' : ''}`}
                        onClick={() => setCategoryType('product')}
                    >
                        Products ({categories.filter(c => c.type === 'product').length})
                    </button>
                </div>
            </div>

            {/* Categories Table */}
            <div className="content-card">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                ) : filteredCategories.length > 0 ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Name (EN)</th>
                                <th>Name (BN)</th>
                                <th>Slug</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((category) => (
                                <tr key={category.id}>
                                    <td>{category.display_order}</td>
                                    <td>
                                        <div className="cell-with-icon">
                                            {category.icon && <span className="category-icon">{category.icon}</span>}
                                            {category.name_en}
                                        </div>
                                    </td>
                                    <td>{category.name_bn}</td>
                                    <td><code>{category.slug}</code></td>
                                    <td>
                                        <span className={`type-badge ${category.type}`}>
                                            {category.type}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`status-toggle ${category.status}`}
                                            onClick={() => toggleStatus(category)}
                                        >
                                            {category.status === 'active' ? <Check size={14} /> : <X size={14} />}
                                            {category.status}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-icon edit"
                                                onClick={() => handleOpenModal(category)}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn-icon delete"
                                                onClick={() => handleDelete(category.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <p>No categories found</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Name (English) *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.name_en}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Name (Bangla) *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.name_bn}
                                            onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Slug *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Description (English)</label>
                                        <textarea
                                            className="form-input"
                                            rows={3}
                                            value={formData.description_en}
                                            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description (Bangla)</label>
                                        <textarea
                                            className="form-input"
                                            rows={3}
                                            value={formData.description_bn}
                                            onChange={(e) => setFormData({ ...formData, description_bn: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Icon (Emoji)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            placeholder="🏠"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Display Order</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.display_order}
                                            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Type *</label>
                                        <select
                                            className="form-input"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'service' | 'product' })}
                                        >
                                            <option value="service">Service</option>
                                            <option value="product">Product</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Status *</label>
                                        <select
                                            className="form-input"
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Image URL</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

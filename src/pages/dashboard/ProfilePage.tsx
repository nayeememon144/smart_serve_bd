/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Mail, Phone, MapPin, Home, Package, CalendarCheck,
    Edit2, Save, X, Plus, Trash2, Check
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './ProfilePage.css';

interface UserAddress {
    id: string;
    user_id: string;
    label: string;
    address_line1: string;
    address_line2: string | null;
    area: string;
    city: string;
    postal_code: string | null;
    is_default: boolean;
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, setUser, isAuthenticated, isLoading: authLoading } = useAuthStore();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        email: '',
        profile_photo: '',
    });

    const [addressForm, setAddressForm] = useState({
        label: 'Home',
        address_line1: '',
        address_line2: '',
        area: '',
        city: 'Dhaka',
        postal_code: '',
        is_default: false,
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone: user.phone || '',
                email: user.email || '',
                profile_photo: user.profile_photo || '',
            });
            fetchAddresses();
        }
    }, [user]);

    const fetchAddresses = async () => {
        if (!user) return;

        const { data, error } = await (supabase
            .from('user_addresses') as any)
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false });

        if (error) {
            console.error('Error fetching addresses:', error);
        } else {
            setAddresses(data || []);
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            const { data, error } = await (supabase
                .from('users') as any)
                .update({
                    full_name: formData.full_name,
                    phone: formData.phone,
                })
                .eq('id', user.id)
                .select()
                .single();

            if (error) throw error;

            setUser(data);
            setIsEditing(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAddress = async () => {
        if (!user) return;

        setIsSaving(true);
        try {
            if (addressForm.is_default) {
                // Unset other default addresses
                await (supabase
                    .from('user_addresses') as any)
                    .update({ is_default: false })
                    .eq('user_id', user.id);
            }

            if (editingAddress) {
                // Update existing
                const { error } = await (supabase
                    .from('user_addresses') as any)
                    .update({
                        label: addressForm.label,
                        address_line1: addressForm.address_line1,
                        address_line2: addressForm.address_line2 || null,
                        area: addressForm.area,
                        city: addressForm.city,
                        postal_code: addressForm.postal_code || null,
                        is_default: addressForm.is_default,
                    })
                    .eq('id', editingAddress.id);

                if (error) throw error;
                toast.success('Address updated!');
            } else {
                // Create new
                const { error } = await (supabase
                    .from('user_addresses') as any)
                    .insert({
                        user_id: user.id,
                        label: addressForm.label,
                        address_line1: addressForm.address_line1,
                        address_line2: addressForm.address_line2 || null,
                        area: addressForm.area,
                        city: addressForm.city,
                        postal_code: addressForm.postal_code || null,
                        is_default: addressForm.is_default,
                    });

                if (error) throw error;
                toast.success('Address added!');
            }

            setShowAddressModal(false);
            setEditingAddress(null);
            resetAddressForm();
            fetchAddresses();
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Failed to save address');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAddress = async (addressId: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;

        try {
            const { error } = await (supabase
                .from('user_addresses') as any)
                .delete()
                .eq('id', addressId);

            if (error) throw error;

            toast.success('Address deleted');
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to delete address');
        }
    };

    const handleSetDefault = async (addressId: string) => {
        if (!user) return;

        try {
            // Unset all defaults
            await (supabase
                .from('user_addresses') as any)
                .update({ is_default: false })
                .eq('user_id', user.id);

            // Set new default
            const { error } = await (supabase
                .from('user_addresses') as any)
                .update({ is_default: true })
                .eq('id', addressId);

            if (error) throw error;

            toast.success('Default address updated');
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to update default address');
        }
    };

    const openEditAddress = (address: UserAddress) => {
        setEditingAddress(address);
        setAddressForm({
            label: address.label,
            address_line1: address.address_line1,
            address_line2: address.address_line2 || '',
            area: address.area,
            city: address.city,
            postal_code: address.postal_code || '',
            is_default: address.is_default,
        });
        setShowAddressModal(true);
    };

    const resetAddressForm = () => {
        setAddressForm({
            label: 'Home',
            address_line1: '',
            address_line2: '',
            area: '',
            city: 'Dhaka',
            postal_code: '',
            is_default: false,
        });
    };

    if (authLoading) {
        return (
            <div className="profile-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="profile-page">
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <span>/</span>
                    <Link to="/dashboard">Dashboard</Link>
                    <span>/</span>
                    <span>Profile</span>
                </div>

                <div className="profile-layout">
                    {/* Profile Sidebar */}
                    <aside className="profile-sidebar">
                        <div className="user-card">
                            <div className="user-avatar">
                                {user.profile_photo ? (
                                    <img src={user.profile_photo} alt={user.full_name} />
                                ) : (
                                    <User size={40} />
                                )}
                            </div>
                            <h2>{user.full_name}</h2>
                            <span className="user-role">{user.role}</span>
                        </div>

                        <nav className="profile-nav">
                            <Link to="/dashboard" className="nav-item">
                                <Package size={18} /> My Orders
                            </Link>
                            <Link to="/dashboard" className="nav-item">
                                <CalendarCheck size={18} /> My Bookings
                            </Link>
                            <Link to="/profile" className="nav-item active">
                                <User size={18} /> Profile Settings
                            </Link>
                        </nav>
                    </aside>

                    {/* Profile Content */}
                    <main className="profile-content">
                        {/* Personal Info */}
                        <section className="profile-section">
                            <div className="section-header">
                                <h2>Personal Information</h2>
                                {!isEditing ? (
                                    <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(true)}>
                                        <Edit2 size={16} /> Edit
                                    </button>
                                ) : (
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setFormData({
                                                    full_name: user.full_name || '',
                                                    phone: user.phone || '',
                                                    email: user.email || '',
                                                    profile_photo: user.profile_photo || '',
                                                });
                                            }}
                                        >
                                            <X size={16} /> Cancel
                                        </button>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : <><Save size={16} /> Save</>}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">
                                        <User size={16} /> Full Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.full_name}
                                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        />
                                    ) : (
                                        <p className="form-value">{user.full_name}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <Mail size={16} /> Email
                                    </label>
                                    <p className="form-value">{user.email}</p>
                                    <small className="form-hint">Email cannot be changed</small>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <Phone size={16} /> Phone Number
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    ) : (
                                        <p className="form-value">{user.phone || 'Not set'}</p>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Account Role</label>
                                    <p className="form-value capitalize">{user.role}</p>
                                </div>
                            </div>
                        </section>

                        {/* Addresses */}
                        <section className="profile-section">
                            <div className="section-header">
                                <h2>My Addresses</h2>
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        setEditingAddress(null);
                                        resetAddressForm();
                                        setShowAddressModal(true);
                                    }}
                                >
                                    <Plus size={16} /> Add Address
                                </button>
                            </div>

                            {addresses.length === 0 ? (
                                <div className="empty-addresses">
                                    <MapPin size={40} />
                                    <p>No addresses saved yet</p>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => setShowAddressModal(true)}
                                    >
                                        Add Your First Address
                                    </button>
                                </div>
                            ) : (
                                <div className="addresses-grid">
                                    {addresses.map(address => (
                                        <div
                                            key={address.id}
                                            className={`address-card ${address.is_default ? 'default' : ''}`}
                                        >
                                            <div className="address-header">
                                                <span className="address-label">
                                                    {address.label === 'Home' ? <Home size={16} /> : <MapPin size={16} />}
                                                    {address.label}
                                                </span>
                                                {address.is_default && (
                                                    <span className="default-badge">Default</span>
                                                )}
                                            </div>
                                            <p className="address-text">
                                                {address.address_line1}
                                                {address.address_line2 && `, ${address.address_line2}`}
                                            </p>
                                            <p className="address-area">
                                                {address.area}, {address.city}
                                                {address.postal_code && ` - ${address.postal_code}`}
                                            </p>
                                            <div className="address-actions">
                                                {!address.is_default && (
                                                    <button
                                                        className="btn-link"
                                                        onClick={() => handleSetDefault(address.id)}
                                                    >
                                                        <Check size={14} /> Set as Default
                                                    </button>
                                                )}
                                                <button
                                                    className="btn-link"
                                                    onClick={() => openEditAddress(address)}
                                                >
                                                    <Edit2 size={14} /> Edit
                                                </button>
                                                <button
                                                    className="btn-link danger"
                                                    onClick={() => handleDeleteAddress(address.id)}
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </main>
                </div>
            </div>

            {/* Address Modal */}
            {showAddressModal && (
                <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
                            <button className="close-btn" onClick={() => setShowAddressModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Label</label>
                                <select
                                    className="form-input"
                                    value={addressForm.label}
                                    onChange={e => setAddressForm({ ...addressForm, label: e.target.value })}
                                >
                                    <option value="Home">Home</option>
                                    <option value="Office">Office</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address Line 1 *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="House no, road, block"
                                    value={addressForm.address_line1}
                                    onChange={e => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address Line 2</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Apartment, suite, etc. (optional)"
                                    value={addressForm.address_line2}
                                    onChange={e => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Area *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Gulshan, Dhanmondi"
                                        value={addressForm.area}
                                        onChange={e => setAddressForm({ ...addressForm, area: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">City *</label>
                                    <select
                                        className="form-input"
                                        value={addressForm.city}
                                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                    >
                                        <option value="Dhaka">Dhaka</option>
                                        <option value="Chattogram">Chattogram</option>
                                        <option value="Sylhet">Sylhet</option>
                                        <option value="Khulna">Khulna</option>
                                        <option value="Rajshahi">Rajshahi</option>
                                        <option value="Rangpur">Rangpur</option>
                                        <option value="Barishal">Barishal</option>
                                        <option value="Mymensingh">Mymensingh</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Postal Code</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., 1212"
                                    value={addressForm.postal_code}
                                    onChange={e => setAddressForm({ ...addressForm, postal_code: e.target.value })}
                                />
                            </div>

                            <div className="form-group checkbox-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={addressForm.is_default}
                                        onChange={e => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                                    />
                                    Set as default address
                                </label>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn btn-outline" onClick={() => setShowAddressModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveAddress}
                                disabled={isSaving || !addressForm.address_line1 || !addressForm.area}
                            >
                                {isSaving ? 'Saving...' : editingAddress ? 'Update Address' : 'Add Address'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

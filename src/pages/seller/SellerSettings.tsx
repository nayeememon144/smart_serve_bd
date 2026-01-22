/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Store, Save, Bell, Shield } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './SellerDashboard.css';

interface SellerProfile {
    full_name: string;
    email: string;
    phone: string;
    store_name: string;
    store_description: string;
    address: string;
    city: string;
}

export default function SellerSettings() {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<SellerProfile>({
        full_name: '',
        email: '',
        phone: '',
        store_name: '',
        store_description: '',
        address: '',
        city: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');

    useEffect(() => {
        if (user?.id) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        const { data, error } = await (supabase
            .from('users') as any)
            .select('*')
            .eq('id', user?.id)
            .single();

        if (!error && data) {
            setProfile({
                full_name: data.full_name || '',
                email: data.email || '',
                phone: data.phone || '',
                store_name: (data as any).store_name || '',
                store_description: (data as any).store_description || '',
                address: (data as any).address || '',
                city: (data as any).city || ''
            });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const { error } = await (supabase
                .from('users') as any)
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone,
                } as any)
                .eq('id', user?.id as string);

            if (error) throw error;
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="seller-page">
            <header className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p>Manage your account and store preferences</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="settings-tabs">
                <button
                    className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <User size={18} /> Profile
                </button>
                <button
                    className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    <Bell size={18} /> Notifications
                </button>
                <button
                    className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <Shield size={18} /> Security
                </button>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="settings-card">
                    <h3>Personal Information</h3>
                    <div className="settings-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label><User size={14} /> Full Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={profile.full_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label><Mail size={14} /> Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    disabled
                                    className="disabled"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label><Phone size={14} /> Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profile.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label><MapPin size={14} /> City</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={profile.city}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <h3 style={{ marginTop: '2rem' }}>Store Information</h3>
                    <div className="settings-form">
                        <div className="form-group">
                            <label><Store size={14} /> Store Name</label>
                            <input
                                type="text"
                                name="store_name"
                                value={profile.store_name}
                                onChange={handleChange}
                                placeholder="Your store name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Store Description</label>
                            <textarea
                                name="store_description"
                                value={profile.store_description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Tell customers about your store..."
                            />
                        </div>
                        <div className="form-group">
                            <label><MapPin size={14} /> Business Address</label>
                            <input
                                type="text"
                                name="address"
                                value={profile.address}
                                onChange={handleChange}
                                placeholder="Your business address"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                            <Save size={16} />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <div className="settings-card">
                    <h3>Notification Preferences</h3>
                    <div className="notification-options">
                        <label className="toggle-option">
                            <span>
                                <strong>New Orders</strong>
                                <small>Get notified when you receive a new order</small>
                            </span>
                            <input type="checkbox" defaultChecked />
                        </label>
                        <label className="toggle-option">
                            <span>
                                <strong>Product Reviews</strong>
                                <small>Get notified when customers review your products</small>
                            </span>
                            <input type="checkbox" defaultChecked />
                        </label>
                        <label className="toggle-option">
                            <span>
                                <strong>Customer Questions</strong>
                                <small>Get notified when customers ask about your products</small>
                            </span>
                            <input type="checkbox" defaultChecked />
                        </label>
                        <label className="toggle-option">
                            <span>
                                <strong>Low Stock Alerts</strong>
                                <small>Get notified when products are running low</small>
                            </span>
                            <input type="checkbox" defaultChecked />
                        </label>
                    </div>
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="settings-card">
                    <h3>Security Settings</h3>
                    <div className="security-section">
                        <div className="security-item">
                            <div>
                                <strong>Change Password</strong>
                                <p>Update your password to keep your account secure</p>
                            </div>
                            <button className="btn btn-outline">Change Password</button>
                        </div>
                        <div className="security-item">
                            <div>
                                <strong>Two-Factor Authentication</strong>
                                <p>Add an extra layer of security to your account</p>
                            </div>
                            <button className="btn btn-outline">Enable 2FA</button>
                        </div>
                        <div className="security-item danger">
                            <div>
                                <strong>Delete Account</strong>
                                <p>Permanently delete your account and all data</p>
                            </div>
                            <button className="btn btn-outline btn-danger">Delete Account</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

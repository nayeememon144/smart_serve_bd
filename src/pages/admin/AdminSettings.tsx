/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
    Save, Globe, Percent, Bell, Shield, Mail, Key, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './AdminStyles.css';

interface SiteSetting {
    id: string;
    key: string;
    value: string | number | boolean | object;
    description: string | null;
}



export default function AdminSettings() {
    const { user, isAuthenticated } = useAuthStore();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newEmail: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Settings state
    const [settings, setSettings] = useState({
        // General
        site_name: 'Service Marketplace BD',
        site_tagline: 'Your trusted service platform in Bangladesh',
        contact_email: 'support@marketplace.bd',
        contact_phone: '+880 1234-567890',
        default_language: 'en',

        // Commission
        provider_commission_rate: 10,
        seller_commission_rate: 15,
        min_payout_amount: 1000,

        // Notifications
        email_notifications: true,
        sms_notifications: true,
        push_notifications: false,

        // Security
        require_email_verification: true,
        require_phone_verification: true,
        provider_verification_required: true,
        max_login_attempts: 5,
    });

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);

            const { data, error } = await (supabase
                .from('settings') as any)
                .select('*');

            if (error) throw error;

            if (data) {
                const settingsObj: Record<string, unknown> = {};
                data.forEach((setting: SiteSetting) => {
                    // Handle object values (e.g., i18n format {en: "...", bn: "..."})
                    let value = setting.value;
                    if (typeof value === 'object' && value !== null) {
                        // If it's an i18n object with 'en' key, extract English value
                        if ('en' in (value as Record<string, unknown>)) {
                            value = (value as Record<string, string>).en;
                        } else {
                            // Convert to string to avoid [object Object]
                            value = JSON.stringify(value);
                        }
                    }
                    settingsObj[setting.key] = value;
                });

                setSettings(prev => ({
                    ...prev,
                    ...settingsObj,
                }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            // Save each setting to the database
            const settingsToSave = [
                { key: 'site_name', value: settings.site_name },
                { key: 'site_tagline', value: settings.site_tagline },
                { key: 'contact_email', value: settings.contact_email },
                { key: 'contact_phone', value: settings.contact_phone },
                { key: 'default_language', value: settings.default_language },
                { key: 'provider_commission_rate', value: settings.provider_commission_rate },
                { key: 'seller_commission_rate', value: settings.seller_commission_rate },
                { key: 'min_payout_amount', value: settings.min_payout_amount },
                { key: 'email_notifications', value: settings.email_notifications },
                { key: 'sms_notifications', value: settings.sms_notifications },
                { key: 'push_notifications', value: settings.push_notifications },
                { key: 'require_email_verification', value: settings.require_email_verification },
                { key: 'require_phone_verification', value: settings.require_phone_verification },
                { key: 'provider_verification_required', value: settings.provider_verification_required },
                { key: 'max_login_attempts', value: settings.max_login_attempts },
            ];

            for (const setting of settingsToSave) {
                const { error } = await (supabase
                    .from('settings') as any)
                    .upsert(
                        { key: setting.key, value: setting.value } as any,
                        { onConflict: 'key' }
                    );

                if (error) {
                    console.error(`Error saving ${setting.key}:`, error);
                }
            }

            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        // Validate
        if (passwordData.currentPassword !== localStorage.getItem('admin_password') &&
            passwordData.currentPassword !== 'admin123') {
            toast.error('Current password is incorrect');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsChangingPassword(true);
        try {
            // Save to localStorage for dev mode
            if (passwordData.newEmail) {
                localStorage.setItem('admin_email', passwordData.newEmail);
            }
            localStorage.setItem('admin_password', passwordData.newPassword);

            toast.success('Admin credentials updated successfully!');
            setPasswordData({
                currentPassword: '',
                newEmail: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('Failed to update credentials');
        } finally {
            setIsChangingPassword(false);
        }
    };



    if (!isAuthenticated || user?.role !== 'admin') {
        return <Navigate to="/1234/admin" replace />;
    }

    const tabs = [
        { id: 'general', label: 'General', icon: <Globe size={18} /> },
        { id: 'commission', label: 'Commission', icon: <Percent size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
        { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    ];

    return (
        <>
            <header className="admin-header">
                <div>
                    <h1>Platform Settings</h1>
                    <p>Configure your marketplace settings</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                    >
                        <Save size={16} /> {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </header>

            {isLoading ? (
                <div className="loading-state">
                    <div className="spinner" />
                </div>
            ) : (
                <div className="settings-layout">
                    {/* Tabs */}
                    <div className="settings-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="settings-content">
                        {activeTab === 'general' && (
                            <div className="settings-section">
                                <h3>General Settings</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Site Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={settings.site_name}
                                            onChange={e => setSettings({ ...settings, site_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Tagline</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={settings.site_tagline}
                                            onChange={e => setSettings({ ...settings, site_tagline: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            <Mail size={16} /> Contact Email
                                        </label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            value={settings.contact_email}
                                            onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Contact Phone</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={settings.contact_phone}
                                            onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Default Language</label>
                                        <select
                                            className="form-input"
                                            value={settings.default_language}
                                            onChange={e => setSettings({ ...settings, default_language: e.target.value })}
                                        >
                                            <option value="en">English</option>
                                            <option value="bn">বাংলা (Bengali)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'commission' && (
                            <div className="settings-section">
                                <h3>Commission Settings</h3>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">Provider Commission Rate (%)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            min="0"
                                            max="100"
                                            value={settings.provider_commission_rate}
                                            onChange={e => setSettings({ ...settings, provider_commission_rate: Number(e.target.value) })}
                                        />
                                        <small className="form-hint">Commission charged to service providers per booking</small>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Seller Commission Rate (%)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            min="0"
                                            max="100"
                                            value={settings.seller_commission_rate}
                                            onChange={e => setSettings({ ...settings, seller_commission_rate: Number(e.target.value) })}
                                        />
                                        <small className="form-hint">Commission charged to product sellers per order</small>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Minimum Payout Amount (৳)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            min="0"
                                            value={settings.min_payout_amount}
                                            onChange={e => setSettings({ ...settings, min_payout_amount: Number(e.target.value) })}
                                        />
                                        <small className="form-hint">Minimum balance required for payout request</small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="settings-section">
                                <h3>Notification Settings</h3>
                                <div className="toggle-list">
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Email Notifications</span>
                                            <span className="toggle-description">Send notifications via email</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.email_notifications}
                                                onChange={e => setSettings({ ...settings, email_notifications: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">SMS Notifications</span>
                                            <span className="toggle-description">Send notifications via SMS</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.sms_notifications}
                                                onChange={e => setSettings({ ...settings, sms_notifications: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Push Notifications</span>
                                            <span className="toggle-description">Send browser push notifications</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.push_notifications}
                                                onChange={e => setSettings({ ...settings, push_notifications: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="settings-section">
                                <h3>Security Settings</h3>
                                <div className="toggle-list">
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Require Email Verification</span>
                                            <span className="toggle-description">Users must verify email before accessing features</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.require_email_verification}
                                                onChange={e => setSettings({ ...settings, require_email_verification: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Require Phone Verification</span>
                                            <span className="toggle-description">Users must verify phone number</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.require_phone_verification}
                                                onChange={e => setSettings({ ...settings, require_phone_verification: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>

                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <span className="toggle-label">Provider Verification Required</span>
                                            <span className="toggle-description">Providers must be verified before listing services</span>
                                        </div>
                                        <label className="toggle-switch">
                                            <input
                                                type="checkbox"
                                                checked={settings.provider_verification_required}
                                                onChange={e => setSettings({ ...settings, provider_verification_required: e.target.checked })}
                                            />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-grid" style={{ marginTop: '1.5rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Max Login Attempts</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            min="1"
                                            max="10"
                                            value={settings.max_login_attempts}
                                            onChange={e => setSettings({ ...settings, max_login_attempts: Number(e.target.value) })}
                                        />
                                        <small className="form-hint">Account locked after this many failed attempts</small>
                                    </div>
                                </div>

                                {/* Change Admin Password Section */}
                                <div className="settings-section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                                    <h3><Key size={18} style={{ marginRight: '0.5rem' }} />Change Admin Password</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                                        Update your admin login credentials
                                    </p>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Current Password *</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="form-input"
                                                    placeholder="Enter current password"
                                                    value={passwordData.currentPassword}
                                                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '12px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: 'var(--text-secondary)'
                                                    }}
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">New Email (Optional)</label>
                                            <input
                                                type="email"
                                                className="form-input"
                                                placeholder="Leave blank to keep current email"
                                                value={passwordData.newEmail}
                                                onChange={e => setPasswordData({ ...passwordData, newEmail: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">New Password *</label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    className="form-input"
                                                    placeholder="Enter new password"
                                                    value={passwordData.newPassword}
                                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    style={{
                                                        position: 'absolute',
                                                        right: '12px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: 'var(--text-secondary)'
                                                    }}
                                                >
                                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            <small className="form-hint">Minimum 6 characters</small>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Confirm New Password *</label>
                                            <input
                                                type="password"
                                                className="form-input"
                                                placeholder="Confirm new password"
                                                value={passwordData.confirmPassword}
                                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={handleChangePassword}
                                        disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                                        style={{ marginTop: '1rem' }}
                                    >
                                        <Key size={16} /> {isChangingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

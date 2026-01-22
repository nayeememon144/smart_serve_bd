import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingCart, Heart, Bell, Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { changeLanguage, getCurrentLanguage } from '../../lib/i18n';
import './Header.css';

export default function Header() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthStore();
    const { getItemCount } = useCartStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
    const currentLang = getCurrentLanguage();

    const handleLanguageChange = (lang: 'en' | 'bn') => {
        changeLanguage(lang);
        setIsLangMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsUserMenuOpen(false);
    };

    return (
        <header className="header">
            <div className="header-container container">
                {/* Logo */}
                <Link to="/" className="header-logo">
                    <span className="logo-icon">🛠️</span>
                    <span className="logo-text">{t('common.appName')}</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="header-nav hide-mobile">
                    <Link to="/" className="nav-link">{t('nav.home')}</Link>
                    <Link to="/services" className="nav-link">{t('nav.services')}</Link>
                    <Link to="/products" className="nav-link">{t('nav.products')}</Link>
                    <Link to="/about" className="nav-link">{t('nav.about')}</Link>
                    <Link to="/contact" className="nav-link">{t('nav.contact')}</Link>
                </nav>

                {/* Header Actions */}
                <div className="header-actions">
                    {/* Search Button */}
                    <button className="header-icon-btn hide-mobile" aria-label="Search">
                        <Search size={20} />
                    </button>

                    {/* Language Switcher */}
                    <div className="dropdown">
                        <button
                            className="header-icon-btn lang-btn"
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                        >
                            <Globe size={20} />
                            <span className="lang-code">{currentLang.toUpperCase()}</span>
                        </button>
                        {isLangMenuOpen && (
                            <div className="dropdown-menu lang-menu">
                                <button
                                    className={`dropdown-item ${currentLang === 'en' ? 'active' : ''}`}
                                    onClick={() => handleLanguageChange('en')}
                                >
                                    🇬🇧 English
                                </button>
                                <button
                                    className={`dropdown-item ${currentLang === 'bn' ? 'active' : ''}`}
                                    onClick={() => handleLanguageChange('bn')}
                                >
                                    🇧🇩 বাংলা
                                </button>
                            </div>
                        )}
                    </div>

                    {isAuthenticated ? (
                        <>
                            {/* Wishlist */}
                            <Link to="/wishlist" className="header-icon-btn hide-mobile">
                                <Heart size={20} />
                            </Link>

                            {/* Cart */}
                            <Link to="/cart" className="header-icon-btn cart-btn">
                                <ShoppingCart size={20} />
                                {getItemCount() > 0 && (
                                    <span className="cart-badge">{getItemCount()}</span>
                                )}
                            </Link>

                            {/* Notifications */}
                            <button className="header-icon-btn hide-mobile">
                                <Bell size={20} />
                            </button>

                            {/* User Menu */}
                            <div className="dropdown">
                                <button
                                    className="user-menu-btn"
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                >
                                    <div className="avatar avatar-sm">
                                        {user?.profile_photo ? (
                                            <img src={user.profile_photo} alt={user.full_name} />
                                        ) : (
                                            user?.full_name?.charAt(0) || 'U'
                                        )}
                                    </div>
                                    <ChevronDown size={16} />
                                </button>
                                {isUserMenuOpen && (
                                    <div className="dropdown-menu user-dropdown">
                                        <div className="dropdown-header">
                                            <span className="user-name">{user?.full_name}</span>
                                            <span className="user-email">{user?.email}</span>
                                        </div>
                                        <div className="dropdown-divider" />
                                        <Link to="/dashboard" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                                            {t('nav.dashboard')}
                                        </Link>
                                        <Link to="/profile" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                                            {t('nav.profile')}
                                        </Link>
                                        <Link to="/bookings" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                                            {t('nav.bookings')}
                                        </Link>
                                        <Link to="/orders" className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                                            {t('nav.orders')}
                                        </Link>
                                        <div className="dropdown-divider" />
                                        <button className="dropdown-item logout-btn" onClick={handleLogout}>
                                            {t('nav.logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="auth-buttons hide-mobile">
                            <Link to="/login" className="btn btn-ghost btn-sm">
                                {t('nav.login')}
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm">
                                {t('nav.register')}
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="header-icon-btn mobile-menu-btn hide-desktop"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    <nav className="mobile-nav">
                        <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            {t('nav.home')}
                        </Link>
                        <Link to="/services" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            {t('nav.services')}
                        </Link>
                        <Link to="/products" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            {t('nav.products')}
                        </Link>
                        <Link to="/about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            {t('nav.about')}
                        </Link>
                        <Link to="/contact" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            {t('nav.contact')}
                        </Link>
                        <Link to="/faq" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                            {t('nav.faq')}
                        </Link>
                    </nav>
                    {!isAuthenticated && (
                        <div className="mobile-auth-buttons">
                            <Link to="/login" className="btn btn-outline" onClick={() => setIsMobileMenuOpen(false)}>
                                {t('nav.login')}
                            </Link>
                            <Link to="/register" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>
                                {t('nav.register')}
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}

import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Grid3X3, Users, Briefcase, CalendarCheck,
    ShoppingBag, DollarSign, Settings, LogOut, Star, CreditCard, UserCheck, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface AdminSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

// Single source of truth for admin menu items
const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/1234/admin/dashboard' },
    { icon: <Grid3X3 size={20} />, label: 'Categories', path: '/1234/admin/categories' },
    { icon: <Briefcase size={20} />, label: 'Services', path: '/1234/admin/services' },
    { icon: <ShoppingBag size={20} />, label: 'Products', path: '/1234/admin/products' },
    { icon: <Users size={20} />, label: 'Users', path: '/1234/admin/users' },
    { icon: <UserCheck size={20} />, label: 'Approvals', path: '/1234/admin/approvals' },
    { icon: <CalendarCheck size={20} />, label: 'Bookings', path: '/1234/admin/bookings' },
    { icon: <Star size={20} />, label: 'Reviews', path: '/1234/admin/reviews' },
    { icon: <CreditCard size={20} />, label: 'Transactions', path: '/1234/admin/transactions' },
    { icon: <DollarSign size={20} />, label: 'Financials', path: '/1234/admin/financials' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/1234/admin/settings' },
];

export default function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthStore();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        logout();
        navigate('/1234/admin');
    };

    const isActive = (path: string) => {
        // Check if current path matches menu item path
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const handleNavClick = () => {
        // Close sidebar on mobile when a nav item is clicked
        if (onClose) {
            onClose();
        }
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <span className="sidebar-logo">🛠️</span>
                    <h2>Admin Panel</h2>
                    {/* Mobile close button */}
                    <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={handleNavClick}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Box, ClipboardList, Star,
    Wallet, TrendingUp, Settings, LogOut, Bell, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import './SellerLayout.css';

const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/seller/dashboard' },
    { icon: <Box size={20} />, label: 'Products', path: '/seller/products' },
    { icon: <ClipboardList size={20} />, label: 'Orders', path: '/seller/orders' },
    { icon: <Star size={20} />, label: 'Reviews', path: '/seller/reviews' },
    { icon: <Wallet size={20} />, label: 'Earnings', path: '/seller/earnings' },
    { icon: <TrendingUp size={20} />, label: 'Analytics', path: '/seller/analytics' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/seller/settings' },
];

export default function SellerLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        logout();
        navigate('/');
    };

    const isActive = (path: string) => {
        if (path === '/seller/dashboard') {
            return location.pathname === '/seller' || location.pathname === '/seller/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="seller-layout">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <span className="logo">Seller Center</span>
                <button className="btn btn-icon">
                    <Bell size={20} />
                </button>
            </header>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="avatar avatar-lg">
                        {user?.profile_photo ? (
                            <img src={user.profile_photo} alt={user.full_name} />
                        ) : (
                            user?.full_name?.charAt(0) || 'S'
                        )}
                    </div>
                    <div className="user-info">
                        <h3>{user?.full_name}</h3>
                        <span className="role-badge seller">Seller</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            to={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
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

            {/* Main Content */}
            <main className="dashboard-main">
                <Outlet />
            </main>
        </div>
    );
}

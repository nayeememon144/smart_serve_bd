import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Briefcase, CalendarCheck, MessageSquare,
    Star, Wallet, Settings, LogOut, Bell, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import './ProviderLayout.css';

const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/provider/dashboard' },
    { icon: <Briefcase size={20} />, label: 'My Services', path: '/provider/services' },
    { icon: <CalendarCheck size={20} />, label: 'Bookings', path: '/provider/bookings' },
    { icon: <MessageSquare size={20} />, label: 'Quotes', path: '/provider/quotes' },
    { icon: <Star size={20} />, label: 'Reviews', path: '/provider/reviews' },
    { icon: <Wallet size={20} />, label: 'Earnings', path: '/provider/earnings' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/provider/settings' },
];

export default function ProviderLayout() {
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
        if (path === '/provider/dashboard') {
            return location.pathname === '/provider' || location.pathname === '/provider/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="provider-layout">
            {/* Mobile Header */}
            <header className="mobile-header">
                <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <span className="logo">Provider Portal</span>
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
                            user?.full_name?.charAt(0) || 'P'
                        )}
                    </div>
                    <div className="user-info">
                        <h3>{user?.full_name}</h3>
                        <span className="role-badge">Provider</span>
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

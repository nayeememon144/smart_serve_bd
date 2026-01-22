import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import './lib/i18n';

// Layout components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { ErrorBoundary } from './components/common';

// Public pages
import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import ServiceDetailPage from './pages/public/ServiceDetailPage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import CartPage from './pages/public/CartPage';
import CheckoutPage from './pages/public/CheckoutPage';
import OrderSuccessPage from './pages/public/OrderSuccessPage';
import QuoteRequestPage from './pages/public/QuoteRequestPage';
import OrderTrackingPage from './pages/public/OrderTrackingPage';
import TrackOrderPage from './pages/public/TrackOrderPage';
import ServiceBookingPage from './pages/public/ServiceBookingPage';
import BookingSuccessPage from './pages/public/BookingSuccessPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import FAQPage from './pages/public/FAQPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard pages
import CustomerDashboard from './pages/dashboard/CustomerDashboard';
import ProfilePage from './pages/dashboard/ProfilePage';

// Provider pages
import ProviderLayout from './components/provider/ProviderLayout';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderBookings from './pages/provider/ProviderBookings';
import ProviderServices from './pages/provider/ProviderServices';
import ProviderEarnings from './pages/provider/ProviderEarnings';
import ProviderQuotes from './pages/provider/ProviderQuotes';
import ProviderReviews from './pages/provider/ProviderReviews';
import ProviderSettings from './pages/provider/ProviderSettings';

// Seller pages
import SellerLayout from './components/seller/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerOrders from './pages/seller/SellerOrders';
import SellerProducts from './pages/seller/SellerProducts';
import SellerEarnings from './pages/seller/SellerEarnings';
import SellerReviews from './pages/seller/SellerReviews';
import SellerAnalytics from './pages/seller/SellerAnalytics';
import SellerSettings from './pages/seller/SellerSettings';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';
import AdminServices from './pages/admin/AdminServices';
import AdminBookings from './pages/admin/AdminBookings';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminServiceForm from './pages/admin/AdminServiceForm';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminReviews from './pages/admin/AdminReviews';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminFinancials from './pages/admin/AdminFinancials';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSidebar from './components/admin/AdminSidebar';

import './App.css';

// Main layout with header and footer
function MainLayout() {
  return (
    <div className="app-layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Admin layout without sidebar (for login page)
function AdminLayout() {
  return (
    <div className="admin-login-layout">
      <Outlet />
    </div>
  );
}

// Admin layout with shared sidebar (for all other admin pages)
function AdminDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="admin-main">
        {/* Mobile Header with Hamburger */}
        <div className="admin-mobile-header">
          <button
            className="mobile-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
          <span className="admin-mobile-title">Admin Panel</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Fetch user profile from our users table
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userProfile) {
            setUser(userProfile);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userProfile) {
            setUser(userProfile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        <Routes>
          {/* Public routes with main layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:categorySlug" element={<ServicesPage />} />
            <Route path="/service/:slug" element={<ServiceDetailPage />} />
            <Route path="/book/:slug" element={<ServiceBookingPage />} />
            <Route path="/booking-success/:bookingCode" element={<BookingSuccessPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success/:orderCode" element={<OrderSuccessPage />} />
            <Route path="/orders/:orderCode" element={<OrderTrackingPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/quote/:serviceSlug" element={<QuoteRequestPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FAQPage />} />

            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Dashboard routes */}
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Provider routes with shared layout */}
          <Route path="/provider" element={<ProviderLayout />}>
            <Route index element={<ProviderDashboard />} />
            <Route path="dashboard" element={<ProviderDashboard />} />
            <Route path="bookings" element={<ProviderBookings />} />
            <Route path="services" element={<ProviderServices />} />
            <Route path="quotes" element={<ProviderQuotes />} />
            <Route path="reviews" element={<ProviderReviews />} />
            <Route path="earnings" element={<ProviderEarnings />} />
            <Route path="settings" element={<ProviderSettings />} />
          </Route>

          {/* Seller routes with shared layout */}
          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<SellerDashboard />} />
            <Route path="dashboard" element={<SellerDashboard />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="products" element={<SellerProducts />} />
            <Route path="earnings" element={<SellerEarnings />} />
            <Route path="reviews" element={<SellerReviews />} />
            <Route path="analytics" element={<SellerAnalytics />} />
            <Route path="settings" element={<SellerSettings />} />
          </Route>

          {/* Admin routes */}
          <Route path="/1234/admin" element={<AdminLayout />}>
            <Route index element={<AdminLogin />} />
          </Route>
          <Route path="/1234/admin" element={<AdminDashboardLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="approvals" element={<AdminApprovals />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="services/new" element={<AdminServiceForm />} />
            <Route path="services/:id/edit" element={<AdminServiceForm />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AdminProductForm />} />
            <Route path="products/:id/edit" element={<AdminProductForm />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="financials" element={<AdminFinancials />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

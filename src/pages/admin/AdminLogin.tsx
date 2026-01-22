/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
 
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import './AdminStyles.css';

const adminLoginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLogin() {
    const { t: _t } = useTranslation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AdminLoginFormData>({
        resolver: zodResolver(adminLoginSchema),
    });

    const onSubmit = async (data: AdminLoginFormData) => {
        setIsLoading(true);
        try {
            // Get admin credentials from localStorage or use defaults
            const storedEmail = localStorage.getItem('admin_email') || 'admin@admin.com';
            const storedPassword = localStorage.getItem('admin_password') || 'admin123';

            // Development mode bypass - for testing without Supabase Auth
            if (data.email === storedEmail && data.password === storedPassword) {
                // Create mock admin user for dev mode
                const mockAdmin = {
                    id: 'dev-admin-id',
                    email: storedEmail,
                    role: 'admin' as const,
                    full_name: 'Development Admin',
                    phone: null,
                    profile_photo: null,
                    date_of_birth: null,
                    gender: null,
                    status: 'active' as const,
                    email_verified: true,
                    phone_verified: true,
                    language_preference: 'en' as const,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    last_login: new Date().toISOString(),
                };

                // Import auth store
                const { useAuthStore } = await import('../../store/authStore');
                useAuthStore.getState().setUser(mockAdmin);

                toast.success('Welcome, Admin!');
                navigate('/1234/admin/dashboard');
                return;
            }

            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            // Check if user is admin
            const { data: userData } = await (supabase
                .from('users') as any)
                .select('role')
                .eq('id', authData.user?.id)
                .single();

            if (userData?.role !== 'admin') {
                await supabase.auth.signOut();
                toast.error('Access denied. Admin privileges required.');
                return;
            }

            toast.success('Welcome, Admin!');
            navigate('/1234/admin/dashboard');
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="admin-login-card">
                <div className="admin-login-header">
                    <div className="admin-icon">
                        <Shield size={32} />
                    </div>
                    <h1>Admin Portal</h1>
                    <p>Sign in to access the admin dashboard</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="admin-login-form">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                className={`form-input ${errors.email ? 'error' : ''}`}
                                placeholder="admin@example.com"
                                {...register('email')}
                            />
                        </div>
                        {errors.email && <span className="form-error">{errors.email.message}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type="password"
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                placeholder="••••••••"
                                {...register('password')}
                            />
                        </div>
                        {errors.password && <span className="form-error">{errors.password.message}</span>}
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading}>
                        {isLoading ? <span className="spinner" /> : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}

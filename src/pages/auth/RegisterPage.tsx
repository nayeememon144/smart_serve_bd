 
/* eslint-disable @typescript-eslint/no-unused-vars */
 
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import { signUp } from '../../lib/supabase';
import './AuthPages.css';

const registerSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['customer', 'provider', 'seller']),
    agreeTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const defaultRole = searchParams.get('role') as 'customer' | 'provider' | 'seller' || 'customer';
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: defaultRole,
        },
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            const { error } = await signUp(data.email, data.password, {
                full_name: data.fullName,
                phone: data.phone,
                role: data.role,
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            toast.success('Account created! Please check your email to verify.');
            navigate('/login');
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title">{t('auth.registerTitle')}</h1>
                        <p className="auth-subtitle">{t('auth.registerSubtitle')}</p>
                    </div>

                    {/* Role Selector */}
                    <div className="role-selector">
                        <label className={`role-option ${selectedRole === 'customer' ? 'active' : ''}`}>
                            <input type="radio" value="customer" {...register('role')} />
                            <span className="role-icon">👤</span>
                            <span className="role-label">{t('auth.customer')}</span>
                        </label>
                        <label className={`role-option ${selectedRole === 'provider' ? 'active' : ''}`}>
                            <input type="radio" value="provider" {...register('role')} />
                            <span className="role-icon">🔧</span>
                            <span className="role-label">{t('auth.provider')}</span>
                        </label>
                        <label className={`role-option ${selectedRole === 'seller' ? 'active' : ''}`}>
                            <input type="radio" value="seller" {...register('role')} />
                            <span className="role-icon">🏪</span>
                            <span className="role-label">{t('auth.seller')}</span>
                        </label>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">{t('auth.fullName')}</label>
                            <div className="input-with-icon">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                                    placeholder="Your full name"
                                    {...register('fullName')}
                                />
                            </div>
                            {errors.fullName && <span className="form-error">{errors.fullName.message}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('auth.email')}</label>
                            <div className="input-with-icon">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    className={`form-input ${errors.email ? 'error' : ''}`}
                                    placeholder="you@example.com"
                                    {...register('email')}
                                />
                            </div>
                            {errors.email && <span className="form-error">{errors.email.message}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('auth.phone')} (Optional)</label>
                            <div className="input-with-icon">
                                <Phone size={18} className="input-icon" />
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="+880-1XXX-XXXXXX"
                                    {...register('phone')}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">{t('auth.password')}</label>
                                <div className="input-with-icon">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={`form-input ${errors.password ? 'error' : ''}`}
                                        placeholder="••••••••"
                                        {...register('password')}
                                    />
                                </div>
                                {errors.password && <span className="form-error">{errors.password.message}</span>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('auth.confirmPassword')}</label>
                                <div className="input-with-icon">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                        placeholder="••••••••"
                                        {...register('confirmPassword')}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input type="checkbox" {...register('agreeTerms')} />
                                <span>
                                    {t('auth.termsAgree')}{' '}
                                    <Link to="/terms" className="auth-link">{t('auth.termsLink')}</Link>
                                </span>
                            </label>
                            {errors.agreeTerms && <span className="form-error">{errors.agreeTerms.message}</span>}
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg w-full" disabled={isLoading}>
                            {isLoading ? <span className="spinner" /> : t('auth.registerButton')}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            {t('auth.hasAccount')}{' '}
                            <Link to="/login" className="auth-link">
                                {t('auth.loginButton')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setIsSubmitted(true);
            toast.success('Password reset email sent!');
        } catch (error: any) {
            console.error('Error sending reset email:', error);
            toast.error(error.message || 'Failed to send reset email');
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="success-icon">
                            <CheckCircle size={64} />
                        </div>
                        <h1>Check Your Email</h1>
                        <p className="auth-subtitle">
                            We've sent a password reset link to <strong>{email}</strong>.
                            Please check your inbox and follow the instructions to reset your password.
                        </p>
                        <div className="auth-actions">
                            <p className="auth-link">
                                Didn't receive the email?{' '}
                                <button
                                    className="link-btn"
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        setEmail('');
                                    }}
                                >
                                    Try again
                                </button>
                            </p>
                            <Link to="/login" className="btn btn-outline btn-block">
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <Link to="/login" className="back-link">
                            <ArrowLeft size={18} /> Back to Login
                        </Link>
                        <h1>Forgot Password?</h1>
                        <p className="auth-subtitle">
                            No worries! Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">
                                <Mail size={16} /> Email Address
                            </label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Remember your password?{' '}
                            <Link to="/login">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

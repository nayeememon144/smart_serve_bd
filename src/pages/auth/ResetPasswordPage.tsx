/* eslint-disable @typescript-eslint/no-explicit-any */
 
 
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        // Check if user came from reset link
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                // User has access to reset password
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const validatePassword = (pwd: string) => {
        const minLength = pwd.length >= 8;
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        return { minLength, hasUpper, hasLower, hasNumber, isValid: minLength && hasUpper && hasLower && hasNumber };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = validatePassword(password);
        if (!validation.isValid) {
            toast.error('Password does not meet requirements');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setIsSuccess(true);
            toast.success('Password updated successfully!');

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error: any) {
            console.error('Error resetting password:', error);
            toast.error(error.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    const validation = validatePassword(password);

    if (isSuccess) {
        return (
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="success-icon">
                            <CheckCircle size={64} />
                        </div>
                        <h1>Password Updated!</h1>
                        <p className="auth-subtitle">
                            Your password has been successfully updated.
                            You will be redirected to the login page shortly.
                        </p>
                        <Link to="/login" className="btn btn-primary btn-block">
                            Go to Login
                        </Link>
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
                        <h1>Reset Password</h1>
                        <p className="auth-subtitle">
                            Create a new password for your account.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">
                                <Lock size={16} /> New Password
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="input-icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Password Requirements */}
                            <div className="password-requirements">
                                <p className="requirements-title">Password must contain:</p>
                                <ul>
                                    <li className={validation.minLength ? 'valid' : ''}>
                                        At least 8 characters
                                    </li>
                                    <li className={validation.hasUpper ? 'valid' : ''}>
                                        One uppercase letter
                                    </li>
                                    <li className={validation.hasLower ? 'valid' : ''}>
                                        One lowercase letter
                                    </li>
                                    <li className={validation.hasNumber ? 'valid' : ''}>
                                        One number
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Lock size={16} /> Confirm Password
                            </label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                            />
                            {confirmPassword && password !== confirmPassword && (
                                <span className="form-error">Passwords do not match</span>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-block"
                            disabled={isLoading || !validation.isValid || password !== confirmPassword}
                        >
                            {isLoading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

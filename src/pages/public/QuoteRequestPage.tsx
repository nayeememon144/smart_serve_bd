/* eslint-disable @typescript-eslint/no-explicit-any */
 
/* eslint-disable react-hooks/exhaustive-deps */
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    ChevronRight, Calendar, Clock, MapPin, Upload, X,
    FileText, DollarSign, Send
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import type { Service, UserAddress } from '../../types/database';
import toast from 'react-hot-toast';
import './QuoteRequestPage.css';

export default function QuoteRequestPage() {
    const { t, i18n } = useTranslation();
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

    const [service, setService] = useState<Service | null>(null);
    const [addresses, setAddresses] = useState<UserAddress[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [requirements, setRequirements] = useState('');
    const [preferredDate, setPreferredDate] = useState('');
    const [preferredTime, setPreferredTime] = useState('');
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [minBudget, setMinBudget] = useState('');
    const [maxBudget, setMaxBudget] = useState('');
    const [images, setImages] = useState<string[]>([]);

    const currentLang = i18n.language as 'en' | 'bn';

    useEffect(() => {
        if (slug && user) {
            fetchService();
            fetchAddresses();
        }
    }, [slug, user]);

    const fetchService = async () => {
        try {
            const { data, error } = await (supabase
                .from('services') as any)
                .select('*, category:categories(name_en, name_bn)')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            setService(data as Service);
        } catch (error) {
            console.error('Error fetching service:', error);
            toast.error('Service not found');
            navigate('/services');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const { data, error } = await (supabase
                .from('user_addresses') as any)
                .select('*')
                .eq('user_id', user?.id)
                .order('is_default', { ascending: false });

            if (error) throw error;
            setAddresses(data || []);

            const defaultAddr = data?.find((a: any) => a.is_default);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
            } else if (data && data.length > 0) {
                setSelectedAddressId((data as any)[0].id);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // For now, create object URLs (in production, upload to Supabase Storage)
        const newImages = Array.from(files).map(file => URL.createObjectURL(file));
        setImages(prev => [...prev, ...newImages].slice(0, 5)); // Max 5 images
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!requirements.trim()) {
            toast.error('Please describe your requirements');
            return;
        }

        if (!preferredDate) {
            toast.error('Please select a preferred date');
            return;
        }

        if (!selectedAddressId) {
            toast.error('Please select a service address');
            return;
        }

        setIsSubmitting(true);

        try {
            const address = addresses.find(a => a.id === selectedAddressId);
            const addressText = address
                ? `${address.address_line1}, ${address.area}, ${address.city}`
                : '';

            const { data, error } = await (supabase
                .from('quotes') as any)
                .insert({
                    service_id: service?.id,
                    customer_id: user?.id,
                    requirements,
                    preferred_date: preferredDate,
                    preferred_time: preferredTime || null,
                    address_id: selectedAddressId,
                    address_text: addressText,
                    min_budget: minBudget ? parseFloat(minBudget) : null,
                    max_budget: maxBudget ? parseFloat(maxBudget) : null,
                    images: images.length > 0 ? images : null,
                    status: 'pending',
                })
                .select()
                .single();

            if (error) throw error;

            toast.success(t('quote.quoteSubmitted'));
            navigate(`/dashboard/quotes/${data.id}`);
        } catch (error) {
            console.error('Error submitting quote:', error);
            toast.error('Failed to submit quote request');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="quote-request-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={`/login?redirect=/services/${slug}/quote`} replace />;
    }

    if (isLoading) {
        return (
            <div className="quote-request-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner" />
                    </div>
                </div>
            </div>
        );
    }

    if (!service) {
        return null;
    }

    const serviceName = currentLang === 'en' ? service.title_en : service.title_bn;

    // Generate time slots
    const timeSlots = [];
    for (let hour = 8; hour <= 20; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        timeSlots.push(time);
    }

    // Get minimum date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];

    return (
        <div className="quote-request-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <a href="/">{t('nav.home')}</a>
                    <ChevronRight size={14} />
                    <a href="/services">{t('nav.services')}</a>
                    <ChevronRight size={14} />
                    <a href={`/services/${slug}`}>{serviceName}</a>
                    <ChevronRight size={14} />
                    <span>{t('quote.requestQuote')}</span>
                </nav>

                <div className="quote-layout">
                    {/* Quote Form */}
                    <div className="quote-form-section">
                        <header className="section-header">
                            <FileText size={24} />
                            <div>
                                <h1>{t('quote.requestQuote')}</h1>
                                <p>Get a custom quote from service providers</p>
                            </div>
                        </header>

                        <form onSubmit={handleSubmit} className="quote-form">
                            {/* Requirements */}
                            <div className="form-group">
                                <label className="form-label required">
                                    {t('quote.requirements')}
                                </label>
                                <textarea
                                    className="form-input"
                                    rows={5}
                                    placeholder="Describe what you need in detail. Include measurements, materials, or any specific requirements..."
                                    value={requirements}
                                    onChange={(e) => setRequirements(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Date and Time */}
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label required">
                                        <Calendar size={16} />
                                        {t('quote.preferredDate')}
                                    </label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        min={minDate}
                                        value={preferredDate}
                                        onChange={(e) => setPreferredDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">
                                        <Clock size={16} />
                                        {t('quote.preferredTime')}
                                    </label>
                                    <select
                                        className="form-input"
                                        value={preferredTime}
                                        onChange={(e) => setPreferredTime(e.target.value)}
                                    >
                                        <option value="">Any time</option>
                                        {timeSlots.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Address Selection */}
                            <div className="form-group">
                                <label className="form-label required">
                                    <MapPin size={16} />
                                    Service Location
                                </label>
                                {addresses.length > 0 ? (
                                    <div className="address-options">
                                        {addresses.map((addr) => (
                                            <label
                                                key={addr.id}
                                                className={`address-option ${selectedAddressId === addr.id ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={addr.id}
                                                    checked={selectedAddressId === addr.id}
                                                    onChange={() => setSelectedAddressId(addr.id)}
                                                />
                                                <div className="address-content">
                                                    <strong>{addr.label || 'Address'}</strong>
                                                    <span>{addr.address_line1}, {addr.area}, {addr.city}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="no-address">
                                        <p>No saved addresses</p>
                                        <a href="/dashboard/addresses" className="btn btn-outline btn-sm">
                                            Add Address
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Budget Range */}
                            <div className="form-group">
                                <label className="form-label">
                                    <DollarSign size={16} />
                                    {t('quote.budget')}
                                </label>
                                <div className="budget-inputs">
                                    <div className="budget-field">
                                        <span className="currency">৳</span>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder={t('quote.minBudget')}
                                            min="0"
                                            value={minBudget}
                                            onChange={(e) => setMinBudget(e.target.value)}
                                        />
                                    </div>
                                    <span className="to">to</span>
                                    <div className="budget-field">
                                        <span className="currency">৳</span>
                                        <input
                                            type="number"
                                            className="form-input"
                                            placeholder={t('quote.maxBudget')}
                                            min="0"
                                            value={maxBudget}
                                            onChange={(e) => setMaxBudget(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="form-group">
                                <label className="form-label">
                                    <Upload size={16} />
                                    {t('quote.uploadImages')}
                                </label>
                                <div className="image-upload-area">
                                    <input
                                        type="file"
                                        id="image-upload"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    {images.length < 5 && (
                                        <label htmlFor="image-upload" className="upload-trigger">
                                            <Upload size={24} />
                                            <span>Click to upload images</span>
                                            <small>Max 5 images</small>
                                        </label>
                                    )}
                                    {images.length > 0 && (
                                        <div className="image-previews">
                                            {images.map((img, index) => (
                                                <div key={index} className="preview-item">
                                                    <img src={img} alt={`Upload ${index + 1}`} />
                                                    <button
                                                        type="button"
                                                        className="remove-btn"
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="btn btn-primary submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    'Submitting...'
                                ) : (
                                    <>
                                        <Send size={18} />
                                        {t('quote.submitQuote')}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Service Summary */}
                    <div className="quote-sidebar">
                        <div className="service-summary">
                            <h3>Service Details</h3>
                            <div className="service-card">
                                <div className="service-image">
                                    <img
                                        src={(service as any).gallery?.[0] || '/placeholder-service.jpg'}
                                        alt={serviceName}
                                    />
                                </div>
                                <div className="service-info">
                                    <span className="category">
                                        {(service.category as any)?.[`name_${currentLang}`]}
                                    </span>
                                    <h4>{serviceName}</h4>
                                    <div className="service-price">
                                        Starting from <strong>৳{((service as any).base_price || 0).toLocaleString()}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="quote-info">
                            <h3>How It Works</h3>
                            <ol className="steps-list">
                                <li>
                                    <span className="step-num">1</span>
                                    <div>
                                        <strong>Submit Your Request</strong>
                                        <p>Describe your requirements and preferences</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="step-num">2</span>
                                    <div>
                                        <strong>Receive Quotes</strong>
                                        <p>Get quotes from qualified providers</p>
                                    </div>
                                </li>
                                <li>
                                    <span className="step-num">3</span>
                                    <div>
                                        <strong>Compare & Choose</strong>
                                        <p>Review and select the best offer</p>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    MapPin, CheckCircle, Calendar, FileText,
    ChevronRight, Plus, Minus, Tag
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import './ServiceBookingPage.css';

interface Service {
    id: string;
    title_en: string;
    title_bn: string;
    slug: string;
    images: string[] | null;
    price_display: number;
    price_basic: number | null;
    price_standard: number | null;
    price_premium: number | null;
    provider_id: string;
    provider?: {
        id: string;
        full_name: string;
        profile_photo: string | null;
    };
}

interface BookingStep {
    id: number;
    title: string;
    icon: React.ReactNode;
    completed: boolean;
}

export default function ServiceBookingPage() {
    const { slug } = useParams<{ slug: string }>();
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthStore();
    const lang = i18n.language as 'en' | 'bn';

    const [service, setService] = useState<Service | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [quantity, setQuantity] = useState(1);

    // Form data
    const [formData, setFormData] = useState({
        country: 'Bangladesh',
        city: 'Dhaka',
        area: '',
        address: '',
        bookingDate: '',
        bookingTime: '',
        notes: '',
        couponCode: '',
    });

    const [couponApplied, setCouponApplied] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const steps: BookingStep[] = [
        { id: 1, title: 'Location', icon: <MapPin size={20} />, completed: currentStep > 1 },
        { id: 2, title: 'Service', icon: <CheckCircle size={20} />, completed: currentStep > 2 },
        { id: 3, title: 'Booking Information', icon: <FileText size={20} />, completed: currentStep > 3 },
        { id: 4, title: 'Date & Time', icon: <Calendar size={20} />, completed: currentStep > 4 },
        { id: 5, title: 'Confirmation', icon: <CheckCircle size={20} />, completed: false },
    ];

    const areas = ['Mirpur', 'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mohammadpur', 'Mohakhali'];
    const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

    useEffect(() => {
        fetchService();
    }, [slug]);

    const fetchService = async () => {
        if (!slug) return;

        try {
            const { data, error } = await (supabase
                .from('services') as any)
                .select('*, provider:users!services_provider_id_fkey(id, full_name, profile_photo)')
                .eq('slug', slug)
                .single();

            if (error) throw error;
            setService(data as Service);
        } catch (error) {
            console.error('Error fetching service:', error);
            toast.error('Service not found');
        } finally {
            setIsLoading(false);
        }
    };

    const getPackageFee = () => {
        if (!service) return 0;
        return service.price_display * quantity;
    };

    const getExtraServiceFee = () => {
        return 50; // Fixed extra service fee for now
    };

    const getTax = () => {
        return 0; // 0% tax
    };

    const getTotal = () => {
        const subtotal = getPackageFee() + getExtraServiceFee();
        return subtotal - discount + getTax();
    };

    const applyCoupon = () => {
        if (formData.couponCode.toLowerCase() === 'discount10') {
            setDiscount(getPackageFee() * 0.1);
            setCouponApplied(true);
            toast.success('Coupon applied! 10% discount');
        } else {
            toast.error('Invalid coupon code');
        }
    };

    const handleNext = () => {
        if (currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Convert 12-hour time format to 24-hour format for database
    const convertTo24Hour = (time12h: string): string => {
        const [time, modifier] = time12h.split(' ');
        const [initialHours, minutes] = time.split(':');
        let hours = initialHours;

        if (hours === '12') {
            hours = modifier === 'AM' ? '00' : '12';
        } else if (modifier === 'PM') {
            hours = String(parseInt(hours, 10) + 12);
        }

        return `${hours.padStart(2, '0')}:${minutes}:00`;
    };

    const handleSubmit = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to complete booking');
            navigate('/login', { state: { from: `/book/${slug}` } });
            return;
        }

        if (!service) return;

        // Validate required fields
        if (!formData.bookingDate || !formData.bookingTime) {
            toast.error('Please select a date and time');
            return;
        }

        setIsSubmitting(true);
        try {
            const bookingCode = `BK-${Date.now().toString(36).toUpperCase()}`;
            const formattedTime = convertTo24Hour(formData.bookingTime);
            const addressText = `${formData.address}, ${formData.area}, ${formData.city}, ${formData.country}`;

            const { error } = await (supabase
                .from('bookings') as any)
                .insert({
                    booking_code: bookingCode,
                    customer_id: user?.id,
                    provider_id: service.provider_id,
                    service_id: service.id,
                    package_type: 'basic',
                    booking_date: formData.bookingDate,
                    booking_time: formattedTime,
                    address_text: addressText,
                    special_instructions: formData.notes || null,
                    service_amount: getPackageFee(),
                    addon_amount: getExtraServiceFee(),
                    discount_amount: discount,
                    tax_amount: getTax(),
                    total_amount: getTotal(),
                    status: 'pending',
                    payment_status: 'pending',
                    payment_method: 'cash',
                });

            if (error) throw error;

            toast.success('Booking confirmed!');
            navigate(`/booking-success/${bookingCode}`);
        } catch (error) {
            console.error('Booking error:', error);
            toast.error('Failed to create booking');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="booking-page">
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="booking-page">
                <div className="container">
                    <div className="error-state">
                        <h2>Service Not Found</h2>
                        <p>The service you're looking for doesn't exist.</p>
                        <Link to="/services" className="btn btn-primary">Browse Services</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="container">
                {/* Breadcrumb */}
                <div className="breadcrumb">
                    <Link to="/">Home</Link>
                    <ChevronRight size={14} />
                    <span>Book Now</span>
                </div>

                {/* Page Title */}
                <h1 className="booking-page-title">
                    {lang === 'bn' ? service.title_bn : service.title_en}
                </h1>

                <div className="booking-layout">
                    {/* Main Content */}
                    <div className="booking-main">
                        {/* Service Card */}
                        <div className="service-summary-card">
                            <div className="service-image">
                                <img
                                    src={service.images?.[0] || '/placeholder-service.jpg'}
                                    alt={service.title_en}
                                />
                            </div>
                            <div className="service-info">
                                <h3>{lang === 'bn' ? service.title_bn : service.title_en}</h3>
                                {service.provider && (
                                    <span className="provider-name">{service.provider.full_name}</span>
                                )}
                            </div>
                        </div>

                        {/* Steps Tracker */}
                        <div className="steps-tracker">
                            {steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={`step ${currentStep >= step.id ? 'active' : ''} ${step.completed ? 'completed' : ''}`}
                                    onClick={() => step.completed && setCurrentStep(step.id)}
                                >
                                    <div className="step-icon">
                                        {step.icon}
                                    </div>
                                    <span className="step-title">{step.title}</span>
                                    {index < steps.length - 1 && <div className="step-line" />}
                                </div>
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className="step-content">
                            {/* Step 1: Location */}
                            {currentStep === 1 && (
                                <div className="step-form">
                                    <h3>Your Location</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Service Country</label>
                                            <select
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            >
                                                <option value="Bangladesh">Bangladesh</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Service City</label>
                                            <select
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            >
                                                <option value="Dhaka">Dhaka</option>
                                                <option value="Chittagong">Chittagong</option>
                                                <option value="Sylhet">Sylhet</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Choose Area</label>
                                            <select
                                                value={formData.area}
                                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                            >
                                                <option value="">Select Area</option>
                                                {areas.map(area => (
                                                    <option key={area} value={area}>{area}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Full Address</label>
                                        <textarea
                                            placeholder="Enter your detailed address..."
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Service */}
                            {currentStep === 2 && (
                                <div className="step-form">
                                    <h3>Select Service Package</h3>
                                    <div className="package-options">
                                        <label className="package-option active">
                                            <input type="radio" name="package" defaultChecked />
                                            <div className="package-content">
                                                <span className="package-name">{lang === 'bn' ? service.title_bn : service.title_en}</span>
                                                <span className="package-price">৳{service.price_display}</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Booking Information */}
                            {currentStep === 3 && (
                                <div className="step-form">
                                    <h3>Additional Information</h3>
                                    <div className="form-group">
                                        <label>Special Notes (Optional)</label>
                                        <textarea
                                            placeholder="Any special requirements or instructions..."
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Date & Time */}
                            {currentStep === 4 && (
                                <div className="step-form">
                                    <h3>Select Date & Time</h3>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Booking Date</label>
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                value={formData.bookingDate}
                                                onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Available Time Slots</label>
                                        <div className="time-slots">
                                            {timeSlots.map(time => (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    className={`time-slot ${formData.bookingTime === time ? 'active' : ''}`}
                                                    onClick={() => setFormData({ ...formData, bookingTime: time })}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Confirmation */}
                            {currentStep === 5 && (
                                <div className="step-form confirmation-step">
                                    <h3>Confirm Your Booking</h3>
                                    <div className="confirmation-details">
                                        <div className="detail-row">
                                            <span>Location:</span>
                                            <span>{formData.area}, {formData.city}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>Date:</span>
                                            <span>{formData.bookingDate}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span>Time:</span>
                                            <span>{formData.bookingTime}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="step-navigation">
                            {currentStep > 1 && (
                                <button className="btn btn-outline" onClick={handleBack}>
                                    Back
                                </button>
                            )}

                            {!isAuthenticated ? (
                                <Link to="/login" state={{ from: `/book/${slug}` }} className="btn btn-primary">
                                    Sign In
                                </Link>
                            ) : currentStep < 5 ? (
                                <button className="btn btn-primary" onClick={handleNext}>
                                    Continue
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Booking Summary */}
                    <div className="booking-sidebar">
                        <div className="booking-summary-card">
                            <h3>Booking Summary</h3>

                            <div className="summary-section">
                                <h4>Appointment Package Service</h4>
                                <div className="summary-item">
                                    <div className="item-info">
                                        <span>{lang === 'bn' ? service.title_bn : service.title_en}</span>
                                        <div className="quantity-control">
                                            <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}>
                                                <Minus size={14} />
                                            </button>
                                            <span>{quantity}</span>
                                            <button onClick={() => setQuantity(quantity + 1)}>
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <span className="item-price">৳{service.price_display.toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Package Fee</span>
                                    <span>৳{getPackageFee().toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="summary-section">
                                <h4>Extra Service</h4>
                                <div className="summary-row">
                                    <span>Extra Service</span>
                                    <span>৳{getExtraServiceFee()}</span>
                                </div>
                            </div>

                            <div className="summary-totals">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>৳{(getPackageFee() + getExtraServiceFee()).toLocaleString()}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="summary-row discount">
                                        <span>Discount</span>
                                        <span>-৳{discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="summary-row">
                                    <span>Tax(+) 0%</span>
                                    <span>৳{getTax()}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total <small>(* This price inclusive vat)</small></span>
                                    <span>৳{getTotal().toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Coupon Input */}
                            <div className="coupon-section">
                                <div className="coupon-input">
                                    <Tag size={16} />
                                    <input
                                        type="text"
                                        placeholder="Enter Coupon Code"
                                        value={formData.couponCode}
                                        onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
                                        disabled={couponApplied}
                                    />
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={applyCoupon}
                                        disabled={couponApplied || !formData.couponCode}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

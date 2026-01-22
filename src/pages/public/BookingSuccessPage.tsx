import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Calendar, ArrowRight, Home } from 'lucide-react';
import './BookingSuccessPage.css';

export default function BookingSuccessPage() {
    const { bookingCode } = useParams();

    return (
        <div className="booking-success-page">
            <div className="container">
                <div className="success-card">
                    <div className="success-icon">
                        <CheckCircle size={64} />
                    </div>

                    <h1>Booking Confirmed!</h1>
                    <p className="success-message">
                        Thank you for your booking. We've received your request and will confirm it shortly.
                    </p>

                    {bookingCode && (
                        <div className="booking-info">
                            <span className="label">Booking Reference:</span>
                            <span className="booking-code">{bookingCode}</span>
                        </div>
                    )}

                    <div className="booking-details">
                        <p>
                            You will receive an email confirmation with the booking details.
                        </p>
                        <p>
                            The service provider will contact you to confirm the appointment.
                        </p>
                    </div>

                    <div className="success-actions">
                        <Link to="/dashboard" className="btn btn-primary">
                            <Calendar size={18} />
                            View My Bookings
                        </Link>
                        <Link to="/services" className="btn btn-outline">
                            Browse More Services
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="home-link">
                        <Link to="/">
                            <Home size={16} />
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

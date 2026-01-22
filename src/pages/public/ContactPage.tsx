import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

export default function ContactPage() {
    const { t } = useTranslation();
    const { settings, fetchSettings, isLoaded } = useSettingsStore();

    useEffect(() => {
        if (!isLoaded) {
            fetchSettings();
        }
    }, [isLoaded, fetchSettings]);

    return (
        <div className="contact-page container" style={{ padding: '4rem 1rem', minHeight: '60vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t('footer.contactUs')}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Get in Touch</h2>
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input type="text" className="form-input" placeholder="Your name" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input type="email" className="form-input" placeholder="your@email.com" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Message</label>
                            <textarea className="form-input" rows={4} placeholder="Your message..." />
                        </div>
                        <button type="submit" className="btn btn-primary">Send Message</button>
                    </form>
                </div>

                <div style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Contact Information</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <MapPin size={24} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                            <div>
                                <h3 style={{ marginBottom: '0.25rem' }}>Address</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>{settings.contact_address || 'Dhaka, Bangladesh'}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <Phone size={24} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                            <div>
                                <h3 style={{ marginBottom: '0.25rem' }}>Phone</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>{settings.contact_phone}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <Mail size={24} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />
                            <div>
                                <h3 style={{ marginBottom: '0.25rem' }}>Email</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>{settings.contact_email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

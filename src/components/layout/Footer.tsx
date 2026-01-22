import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useEffect } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import './Footer.css';

export default function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();
    const { settings, fetchSettings, isLoaded } = useSettingsStore();

    useEffect(() => {
        if (!isLoaded) {
            fetchSettings();
        }
    }, [isLoaded, fetchSettings]);

    return (
        <footer className="footer">
            <div className="footer-main container">
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <span className="logo-icon">🛠️</span>
                            <span className="logo-text">{settings.site_name || t('common.appName')}</span>
                        </Link>
                        <p className="footer-description">
                            {settings.site_tagline || `${t('common.appName')} - Your trusted service marketplace in Bangladesh. Book professional services for your home and business.`}
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-link" aria-label="Facebook">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <Linkedin size={20} />
                            </a>
                            <a href="#" className="social-link" aria-label="YouTube">
                                <Youtube size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4 className="footer-title">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/services">{t('nav.services')}</Link></li>
                            <li><Link to="/products">{t('nav.products')}</Link></li>
                            <li><Link to="/about">{t('footer.aboutUs')}</Link></li>
                            <li><Link to="/contact">{t('footer.contactUs')}</Link></li>
                            <li><Link to="/faq">{t('footer.faq')}</Link></li>
                        </ul>
                    </div>

                    {/* For Partners */}
                    <div className="footer-section">
                        <h4 className="footer-title">For Partners</h4>
                        <ul className="footer-links">
                            <li><Link to="/register?role=provider">{t('footer.becomeProvider')}</Link></li>
                            <li><Link to="/register?role=seller">{t('footer.becomeSeller')}</Link></li>
                            <li><Link to="/provider/dashboard">Provider Dashboard</Link></li>
                            <li><Link to="/seller/dashboard">Seller Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="footer-section">
                        <h4 className="footer-title">Legal</h4>
                        <ul className="footer-links">
                            <li><Link to="/terms">{t('footer.termsConditions')}</Link></li>
                            <li><Link to="/privacy">{t('footer.privacyPolicy')}</Link></li>
                            <li><Link to="/refund">{t('footer.refundPolicy')}</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-section">
                        <h4 className="footer-title">Contact Us</h4>
                        <ul className="footer-contact">
                            <li>
                                <MapPin size={16} />
                                <span>{settings.contact_address || 'Dhaka, Bangladesh'}</span>
                            </li>
                            <li>
                                <Phone size={16} />
                                <a href={`tel:${settings.contact_phone?.replace(/[^0-9+]/g, '')}`}>{settings.contact_phone}</a>
                            </li>
                            <li>
                                <Mail size={16} />
                                <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <div className="container footer-bottom-content">
                    <p className="copyright">
                        © {currentYear} {settings.site_name || t('common.appName')}. {t('footer.allRightsReserved')}.
                    </p>
                    <p className="trade-license">
                        {t('footer.tradeLicense')}: TRAD/DSCC/062281/2022
                    </p>
                </div>
            </div>
        </footer>
    );
}

import { useTranslation } from 'react-i18next';

export default function AboutPage() {
    const { t } = useTranslation();

    return (
        <div className="about-page container" style={{ padding: '4rem 1rem', minHeight: '60vh' }}>
            <h1>{t('footer.aboutUs')}</h1>
            <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: 1.8 }}>
                <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
                    Service Marketplace is your trusted platform for finding professional service providers in Bangladesh.
                    We connect customers with verified, skilled professionals for all home and business needs.
                </p>

                <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Our Mission</h2>
                <p>
                    To make finding and booking quality services as simple as possible,
                    while helping service providers grow their businesses.
                </p>

                <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Trade License</h2>
                <p>
                    <strong>TRAD/DSCC/062281/2022</strong>
                </p>
            </div>
        </div>
    );
}

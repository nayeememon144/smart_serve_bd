import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { FAQ } from '../../types/database';

export default function FAQPage() {
    const { t, i18n } = useTranslation();
    const lang = i18n.language as 'en' | 'bn';
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [openItems, setOpenItems] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchFaqs = async () => {
            const { data } = await supabase
                .from('faqs')
                .select('*')
                .eq('status', 'active')
                .order('display_order');

            if (data) setFaqs(data);
        };
        fetchFaqs();
    }, []);

    const toggleItem = (id: string) => {
        const newOpenItems = new Set(openItems);
        if (newOpenItems.has(id)) {
            newOpenItems.delete(id);
        } else {
            newOpenItems.add(id);
        }
        setOpenItems(newOpenItems);
    };

    return (
        <div className="faq-page container" style={{ padding: '4rem 1rem', minHeight: '60vh', maxWidth: '800px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>{t('nav.faq')}</h1>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                Find answers to commonly asked questions
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {faqs.map((faq) => (
                    <div
                        key={faq.id}
                        style={{
                            border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                        }}
                    >
                        <button
                            onClick={() => toggleItem(faq.id)}
                            style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--bg-secondary)',
                                border: 'none',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                            }}
                        >
                            <span>{lang === 'bn' ? faq.question_bn : faq.question_en}</span>
                            {openItems.has(faq.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                        {openItems.has(faq.id) && (
                            <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-primary)' }}>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                    {lang === 'bn' ? faq.answer_bn : faq.answer_en}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

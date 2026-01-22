import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import bn from '../locales/bn.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            bn: { translation: bn },
        },
        lng: localStorage.getItem('language') || 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;

export const changeLanguage = (lang: 'en' | 'bn') => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
};

export const getCurrentLanguage = () => i18n.language as 'en' | 'bn';

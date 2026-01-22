import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface SiteSettings {
    site_name: string;
    site_tagline: string;
    contact_email: string;
    contact_phone: string;
    contact_address: string;
    default_language: string;
    provider_commission_rate: number;
    seller_commission_rate: number;
    min_payout_amount: number;
    email_notifications: boolean;
    sms_notifications: boolean;
    push_notifications: boolean;
}

interface SettingsState {
    settings: SiteSettings;
    isLoaded: boolean;
    fetchSettings: () => Promise<void>;
    updateSettings: (newSettings: Partial<SiteSettings>) => void;
}

const defaultSettings: SiteSettings = {
    site_name: 'Service Marketplace BD',
    site_tagline: 'Your trusted service platform in Bangladesh',
    contact_email: 'support@marketplace.bd',
    contact_phone: '+880-1XXX-XXXXXX',
    contact_address: 'Dhaka, Bangladesh',
    default_language: 'en',
    provider_commission_rate: 10,
    seller_commission_rate: 15,
    min_payout_amount: 1000,
    email_notifications: true,
    sms_notifications: true,
    push_notifications: false,
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            settings: defaultSettings,
            isLoaded: false,

            fetchSettings: async () => {
                try {
                    const { data, error } = await supabase
                        .from('settings')
                        .select('key, value');

                    if (error) throw error;

                    if (data && data.length > 0) {
                        const settingsObj: Record<string, unknown> = {};
                        data.forEach((setting: { key: string; value: unknown }) => {
                            const val = setting.value;

                            // Handle localized values (objects with en/bn keys)
                            if (val && typeof val === 'object' && !Array.isArray(val) && 'en' in (val as object)) {
                                settingsObj[setting.key] = (val as Record<string, string>).en;
                            }
                            // Handle array values (like phone numbers)
                            else if (Array.isArray(val) && val.length > 0) {
                                settingsObj[setting.key] = val[0];
                            }
                            // Handle regular values
                            else {
                                settingsObj[setting.key] = val;
                            }
                        });

                        // Map database keys to our store keys
                        const mappedSettings: Partial<SiteSettings> = {
                            site_name: settingsObj.site_name as string || defaultSettings.site_name,
                            site_tagline: settingsObj.site_description as string || defaultSettings.site_tagline,
                            contact_email: settingsObj.contact_email as string || defaultSettings.contact_email,
                            contact_phone: settingsObj.contact_phone as string || defaultSettings.contact_phone,
                            contact_address: settingsObj.business_address as string || settingsObj.contact_address as string || defaultSettings.contact_address,
                            default_language: settingsObj.default_language as string || defaultSettings.default_language,
                            provider_commission_rate: settingsObj.default_commission_rate as number || defaultSettings.provider_commission_rate,
                            seller_commission_rate: settingsObj.product_commission_rate as number || defaultSettings.seller_commission_rate,
                        };

                        set((state) => ({
                            settings: { ...state.settings, ...mappedSettings },
                            isLoaded: true,
                        }));
                    } else {
                        set({ isLoaded: true });
                    }
                } catch (error) {
                    console.error('Error fetching settings:', error);
                    set({ isLoaded: true });
                }
            },

            updateSettings: (newSettings) => {
                set((state) => ({
                    settings: { ...state.settings, ...newSettings },
                }));
            },
        }),
        {
            name: 'site-settings',
        }
    )
);

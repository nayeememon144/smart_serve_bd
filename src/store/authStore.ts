import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserAddress, ProviderProfile, SellerProfile } from '../types/database';

interface AuthState {
    user: User | null;
    addresses: UserAddress[];
    providerProfile: ProviderProfile | null;
    sellerProfile: SellerProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setAddresses: (addresses: UserAddress[]) => void;
    setProviderProfile: (profile: ProviderProfile | null) => void;
    setSellerProfile: (profile: SellerProfile | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            addresses: [],
            providerProfile: null,
            sellerProfile: null,
            isAuthenticated: false,
            isLoading: true,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setAddresses: (addresses) => set({ addresses }),
            setProviderProfile: (providerProfile) => set({ providerProfile }),
            setSellerProfile: (sellerProfile) => set({ sellerProfile }),
            setLoading: (isLoading) => set({ isLoading }),
            logout: () => set({
                user: null,
                addresses: [],
                providerProfile: null,
                sellerProfile: null,
                isAuthenticated: false,
            }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

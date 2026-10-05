'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import { getMe } from '@/lib/api/auth/auth-api';
import {
    clearTokens,
    getAccessToken,
} from './token-storage';

import type { User } from '@/lib/api/auth/type';
import { useRouter } from 'next/router';

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext =
    createContext<AuthContextValue | undefined>(
        undefined,
    );

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const [user, setUser] =
        useState<User | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const refreshUser = async () => {
        const accessToken = getAccessToken();

        if (!accessToken) {
            setUser(null);
            return;
        }

        try {
            const currentUser = await getMe();
            setUser(currentUser);
        } catch {
            clearTokens();
            setUser(null);
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            try {
                await refreshUser();
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const logout = () => {
        clearTokens();
        setUser(null);
        //window.location.href = '/login';
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            'useAuth must be used inside AuthProvider',
        );
    }

    return context;
}
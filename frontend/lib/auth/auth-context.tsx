'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';

import { getMe, logout as logoutApi } from '@/lib/api/auth/auth-api';
import {
    clearTokens,
    getAccessToken,
} from './token-storage';

import type { User } from '@/lib/api/auth/type';
import { useRouter } from 'next/navigation';

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    setAuthenticatedUser: (user: User) => void;
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

    const setAuthenticatedUser = (user: User) => {
        setUser(user);
    }

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

    const logout = useCallback(async () => {
        try {
            await logoutApi();
        } catch(error) {
            console.error('Logout API failed: ', error);
        } finally {
            clearTokens();
            setUser(null);
            //window.location.href = '/login';
            router.replace('/login');
        }
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                logout,
                refreshUser,
                setAuthenticatedUser,
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
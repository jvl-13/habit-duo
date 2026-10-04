'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth/auth-context';

export function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const {
        isLoading,
        isAuthenticated,
    } = useAuth();

    useEffect(() => {
        if (
            !isLoading &&
            !isAuthenticated
        ) {
            router.replace('/login');
        }
    }, [
        isLoading,
        isAuthenticated,
        router,
    ]);

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <p className="text-muted-foreground">
                    Đang kiểm tra đăng nhập...
                </p>
            </main>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
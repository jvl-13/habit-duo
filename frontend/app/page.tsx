'use client';

import { useAuth } from '@/lib/auth/auth-context';

export default function HomePage() {
  const {
    user,
    isLoading,
    isAuthenticated,
    logout,
  } = useAuth();

  if (isLoading) {
    return (
      <main className="p-8">
        Đang tải...
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">
          Chưa đăng nhập
        </h1>

        <a
          href="/login"
          className="mt-4 inline-block underline"
        >
          Đăng nhập
        </a>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">
        Habit Duo
      </h1>

      <p className="mt-4">
        Xin chào, {user?.name}!
      </p>

      <p className="mt-2 text-muted-foreground">
        {user?.email}
      </p>

      <button
        onClick={logout}
        className="mt-6 rounded-md bg-black px-4 py-2 text-white"
      >
        Đăng xuất
      </button>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ProgressCard } from '@/components/dashboard/progress-card';
import { HabitCard } from '@/components/dashboard/habit-card';
import { DuoCard } from '@/components/dashboard/duo-card';

import { useHabits } from '@/lib/queries/habit-queries';
import {
    getDayKey,
    isHabitAvailableOnDay,
} from '@/lib/date/day-key';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const HABITS_PER_PAGE = 4;

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <DashboardContent />
            </DashboardLayout>
        </ProtectedRoute>
    );
}

function getGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return 'Good morning 👋';
    }

    if (hour >= 12 && hour < 18) {
        return 'Good afternoon ☀️';
    }

    return 'Good evening 🌙';
}

function DashboardContent() {
    const todayKey = getDayKey();

    const {
        data: habits,
        isLoading,
        isError,
    } = useHabits();

    const [currentPage, setCurrentPage] = useState(1);

    const todaysHabits = (habits ?? []).filter(
        (habit) =>
            habit.isActive &&
            isHabitAvailableOnDay(
                habit.startDate,
                todayKey,
            ),
    );

    const totalPages = Math.max(
        1,
        Math.ceil(todaysHabits.length / HABITS_PER_PAGE),
    );

    // Keep the current page valid when habits are added or removed.
    const safePage = Math.min(currentPage, totalPages);

    useEffect(() => {
        if (currentPage !== safePage) {
            setCurrentPage(safePage);
        }
    }, [currentPage, safePage]);

    const startIndex = (safePage - 1) * HABITS_PER_PAGE;

    const displayedHabits = todaysHabits.slice(
        startIndex,
        startIndex + HABITS_PER_PAGE,
    );

    const goToPreviousPage = () => {
        setCurrentPage((page) => Math.max(1, page - 1));
    };

    const goToNextPage = () => {
        setCurrentPage((page) => Math.min(totalPages, page + 1));
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {getGreeting()}
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Let&apos;s keep your habits going today.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <ProgressCard habits={todaysHabits} />

                    <section>
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Today
                                </p>

                                <h2 className="text-xl font-semibold">
                                    Your habits
                                </h2>

                                {!isLoading && !isError && todaysHabits.length > 0 && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Showing {startIndex + 1}–
                                        {Math.min(
                                            startIndex + HABITS_PER_PAGE,
                                            todaysHabits.length,
                                        )}{' '}
                                        of {todaysHabits.length} habits
                                    </p>
                                )}
                            </div>

                            <Link
                                href="/dashboard/habits"
                                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
                            >
                                View all
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {isLoading && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <HabitSkeleton />
                                <HabitSkeleton />
                                <HabitSkeleton />
                                <HabitSkeleton />
                            </div>
                        )}

                        {isError && (
                            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                                <p className="text-sm text-destructive">
                                    Failed to load your habits.
                                </p>
                            </div>
                        )}

                        {!isLoading &&
                            !isError &&
                            todaysHabits.length === 0 && (
                                <div className="rounded-xl border border-dashed p-8 text-center">
                                    <h3 className="font-semibold">
                                        No habits for today
                                    </h3>

                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Create a habit or check your habit schedule.
                                    </p>

                                    <Link
                                        href="/dashboard/habits"
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                                    >
                                        Manage habits
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            )}

                        {!isLoading &&
                            !isError &&
                            todaysHabits.length > 0 && (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {displayedHabits.map((habit) => (
                                            <HabitCard
                                                key={habit.id}
                                                id={habit.id}
                                                name={habit.name}
                                                description={
                                                    habit.description ??
                                                    'No description'
                                                }
                                                deadline={habit.deadline}
                                            />
                                        ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={goToPreviousPage}
                                                disabled={safePage === 1}
                                                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Previous
                                            </button>

                                            <div className="flex items-center gap-1">
                                                {Array.from(
                                                    { length: totalPages },
                                                    (_, index) => index + 1,
                                                ).map((page) => (
                                                    <button
                                                        key={page}
                                                        type="button"
                                                        onClick={() =>
                                                            setCurrentPage(page)
                                                        }
                                                        aria-label={`Go to page ${page}`}
                                                        aria-current={
                                                            safePage === page
                                                                ? 'page'
                                                                : undefined
                                                        }
                                                        className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition-colors ${
                                                            safePage === page
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'hover:bg-muted'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={goToNextPage}
                                                disabled={safePage === totalPages}
                                                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Next
                                                <ArrowRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                    </section>
                </div>

                <div className="space-y-6">
                    <DuoCard />
                    {/* <ActivityCard /> */}
                </div>
            </div>
        </div>
    );
}

function HabitSkeleton() {
    return (
        <div className="rounded-2xl border bg-background p-5">
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />

            <div className="mt-3 h-4 w-28 animate-pulse rounded bg-muted" />

            <div className="mt-8 h-8 w-full animate-pulse rounded bg-muted" />
        </div>
    );
}

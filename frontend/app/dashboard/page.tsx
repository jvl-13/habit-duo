'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ProgressCard } from '@/components/dashboard/progress-card';
import { HabitCard } from '@/components/dashboard/habit-card';
import { DuoCard } from '@/components/dashboard/duo-card';
//import { ActivityCard } from '@/components/dashboard/activity-card';
import { useHabits } from '@/lib/queries/habit-queries';
import { getDayKey, isHabitAvailableOnDay } from '@/lib/date/day-key';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

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

    const todaysHabits = (habits ?? []).filter(
        (habit) =>
            habit.isActive &&
            isHabitAvailableOnDay(
                habit.startDate,
                todayKey,
            ),
    );

    const displayedHabits = todaysHabits.slice(0, 4);

    // console.log('ALL HABITS:', habits);
    // console.log('TODAY KEY:', todayKey);
    // console.log('TODAY HABITS:', todaysHabits);

    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {getGreeting()}
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Let keep your habits going today.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <ProgressCard habits={todaysHabits} />

                    <section>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Today
                                </p>

                                <h2 className="text-xl font-semibold">
                                    Your habits
                                </h2>
                            </div>

                            {todaysHabits.length > 4 && (
                                <Link
                                    href="/dashboard/habits"
                                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                >
                                    View all
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>

                        {isLoading && (
                            <div className="grid gap-4 sm:grid-cols-2">
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
                                </div>
                            )}

                        {!isLoading &&
                            !isError &&
                            todaysHabits.length > 0 && (
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
                                            streak={0}
                                        />
                                    ))}
                                </div>
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
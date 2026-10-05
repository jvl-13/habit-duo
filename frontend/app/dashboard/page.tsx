'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { ProgressCard } from '@/components/dashboard/progress-card';
import { HabitCard } from '@/components/dashboard/habit-card';
import { DuoCard } from '@/components/dashboard/duo-card';
import { ActivityCard } from '@/components/dashboard/activity-card';

const habits = [
    {
        name: 'Morning Workout',
        description: '30 minutes of exercise',
        streak: 7,
        completed: true,
    },
    {
        name: 'Read 20 minutes',
        description: 'Read a book before bedtime',
        streak: 3,
        completed: false,
    },
    {
        name: 'Drink 2L of water',
        description: 'Stay hydrated throughout the day',
        streak: 5,
        completed: true,
    },
];

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* Welcome */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Good morning 👋
                        </h1>

                        <p className="mt-2 text-muted-foreground">
                            Let keep your habits going today.
                        </p>
                    </div>

                    {/* Main grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Left content */}
                        <div className="space-y-6 lg:col-span-2">
                            <ProgressCard />

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

                                    <button className="text-sm font-medium text-primary hover:underline">
                                        View all
                                    </button>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {habits.map((habit) => (
                                        <HabitCard
                                            key={habit.name}
                                            {...habit}
                                        />
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Right content */}
                        <div className="space-y-6">
                            <DuoCard />

                            <ActivityCard />
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
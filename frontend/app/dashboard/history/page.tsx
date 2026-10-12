
'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { HabitHistoryCalendar } from '@/components/dashboard/habit-history-calendar';
import { useHabits } from '@/lib/queries/habit-queries';

function HistoryContent() {
    const {
        data: habits = [],
        isLoading,
        isError,
        refetch,
    } = useHabits();

    return (
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <header>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Habit History
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Review your daily progress and completed habits.
                </p>
            </header>

            {isLoading && (
                <div className="rounded-xl border p-6 text-sm text-muted-foreground">
                    Loading habit history...
                </div>
            )}

            {isError && (
                <div className="rounded-xl border p-6">
                    <p className="text-sm text-destructive">
                        Failed to load habits.
                    </p>

                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-3 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                    >
                        Try again
                    </button>
                </div>
            )}

            {!isLoading && !isError && (
                <HabitHistoryCalendar habits={habits} />
            )}
        </div>
    );
}

export default function HistoryPage() {
    return (
        <ProtectedRoute>
            <DashboardLayout>
                <HistoryContent />
            </DashboardLayout>
        </ProtectedRoute>
    );
}

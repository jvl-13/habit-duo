'use-client';

import { getHabitCheckIns } from "@/lib/api/check-ins/check-in-api";
import type { Habit } from "@/lib/api/habits/habits-api";
import { useQueries } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ProgressCardProps {
    habits: Habit[];
}

export function ProgressCard({habits} : ProgressCardProps) {
    const activeHabits = habits.filter((habits) => habits.isActive);

    const todayKey = new Date().toISOString().slice(0, 10);

    const checkInQueries = useQueries({
        queries: activeHabits.map((habit) => ({
            queryKey: ['check-ins', habit.id],
            queryFn: () => getHabitCheckIns(habit.id),
            stableTime: 30_000,
        })),
    });

    const isLoading = checkInQueries.some(
        (query) => query.isLoading,
    );

    const isError = checkInQueries.some(
        (query) => query.isError,
    );

    const completed = checkInQueries.filter(
        (query) => 
            query.data?.some(
                (checkIn) =>
                    checkIn.daykey === todayKey,
            ) ?? false,
    ).length;

    const total = activeHabits.length;
    
    const percentage = total === 0
        ? 0 : Math.round((completed/total) * 100);

    return (
        <section className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Today Progress
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        {completed}
                        <span className="text-muted-foreground">
                            {' '}
                            / {total}
                        </span>
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        habits completed
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {isLoading? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <CheckCircle2 className="h-5 w-5" />
                        )}
                </div>
            </div>


            {isError ? (
                <p className="mt-6 text-sm text-destructive">
                    Failed to load today progress. 
                </p>
            ) : (
                <div className="mt-6">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all"
                        style={{
                            width: `${percentage}%`,
                        }} 
                    />
                </div>

                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>
                        {percentage} %completed
                    </span>

                    <span>
                        {Math.max(total - completed, 0)} remaining
                    </span>
                </div>
            </div>
            )}
        </section>
    )
}
'use client';

import { useMemo, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Check,
} from 'lucide-react';

import { useHabitHistory } from '@/lib/queries/history-queries';
import { getDayKey } from '@/lib/date/day-key';
import { Habit } from '@/lib/api/habits/habits-api';

interface HabitHistoryCalendarProps {
    habits: Habit[];
}

function formatMonth(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
}

function getMonthDays(date: Date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();

    const firstDay = new Date(
        Date.UTC(year, month, 1),
    );

    const lastDay = new Date(
        Date.UTC(year, month + 1, 0),
    );

    const startOffset = firstDay.getUTCDay();
    const totalDays = lastDay.getUTCDate();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i++) {
        days.push(null);
    }

    for (let day = 1; day <= totalDays; day++) {
        days.push(
            new Date(
                Date.UTC(year, month, day),
            ),
        );
    }

    return days;
}

export function HabitHistoryCalendar({
    habits,
}: HabitHistoryCalendarProps) {
    const [currentMonth, setCurrentMonth] =
        useState(() => new Date());

    const [selectedDayKey, setSelectedDayKey] =
        useState(() => getDayKey());

    const activeHabits = habits.filter(
        (habit) => habit.isActive,
    );

    const checkInQueries =
        useHabitHistory(activeHabits);

    const days = useMemo(
        () => getMonthDays(currentMonth),
        [currentMonth],
    );

    const checkInsByHabit = useMemo(() => {
        const result = new Map<
            string,
            Set<string>
        >();

        activeHabits.forEach((habit, index) => {
            const checkIns =
                checkInQueries[index]?.data ?? [];

            result.set(
                habit.id,
                new Set(
                    checkIns.map(
                        (checkIn) => checkIn.dayKey,
                    ),
                ),
            );
        });

        return result;
    }, [activeHabits, checkInQueries]);

    const previousMonth = () => {
        setCurrentMonth((current) => {
            const next = new Date(current);

            next.setUTCMonth(
                next.getUTCMonth() - 1,
            );

            return next;
        });
    };

    const nextMonth = () => {
        setCurrentMonth((current) => {
            const next = new Date(current);

            next.setUTCMonth(
                next.getUTCMonth() + 1,
            );

            return next;
        });
    };

    const selectedDate = new Date(
        `${selectedDayKey}T00:00:00Z`,
    );

    const selectedHabits = activeHabits.filter(
        (habit) =>
            habit.startDate.slice(0, 10) <=
            selectedDayKey,
    );

    return (
        <section className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Habit History
                    </p>

                    <h2 className="mt-1 text-xl font-semibold">
                        Review your progress
                    </h2>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={previousMonth}
                        className="rounded-lg p-2 hover:bg-muted"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        onClick={nextMonth}
                        className="rounded-lg p-2 hover:bg-muted"
                        aria-label="Next month"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="mt-6">
                <div className="mb-4 text-center text-lg font-semibold">
                    {formatMonth(currentMonth)}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                    {[
                        'Sun',
                        'Mon',
                        'Tue',
                        'Wed',
                        'Thu',
                        'Fri',
                        'Sat',
                    ].map((day) => (
                        <div
                            key={day}
                            className="py-2 text-xs font-medium text-muted-foreground"
                        >
                            {day}
                        </div>
                    ))}

                    {days.map((day, index) => {
                        if (!day) {
                            return (
                                <div key={`empty-${index}`} />
                            );
                        }

                        const dayKey = getDayKey(day);

                        const availableHabits =
                            activeHabits.filter(
                                (habit) =>
                                    habit.startDate.slice(0, 10) <=
                                    dayKey,
                            );

                        const completedCount =
                            availableHabits.filter(
                                (habit) =>
                                    checkInsByHabit
                                        .get(habit.id)
                                        ?.has(dayKey) ?? false,
                            ).length;

                        const isSelected =
                            dayKey === selectedDayKey;

                        const isToday =
                            dayKey === getDayKey();

                        const hasProgress =
                            completedCount > 0;

                        return (
                            <button
                                key={dayKey}
                                type="button"
                                onClick={() =>
                                    setSelectedDayKey(dayKey)
                                }
                                className={`relative min-h-14 rounded-lg border p-2 text-sm transition-colors ${isSelected
                                        ? 'border-primary bg-primary/10'
                                        : 'border-transparent hover:bg-muted'
                                    }`}
                            >
                                <span
                                    className={
                                        isToday
                                            ? 'font-bold text-primary'
                                            : 'text-foreground'
                                    }
                                >
                                    {day.getUTCDate()}
                                </span>

                                {availableHabits.length > 0 && (
                                    <span className="mt-1 block text-[10px] text-muted-foreground">
                                        {completedCount}/
                                        {availableHabits.length}
                                    </span>
                                )}

                                {hasProgress && (
                                    <span className="absolute bottom-1 right-1">
                                        <Check className="h-3 w-3 text-green-600" />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8 border-t pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Selected day
                        </p>

                        <h3 className="mt-1 font-semibold">
                            {selectedDate.toLocaleDateString(
                                'en-US',
                                {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                    timeZone: 'UTC',
                                },
                            )}
                        </h3>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                            Completed
                        </p>

                        <p className="mt-1 font-semibold">
                            {selectedHabits.filter(
                                (habit) =>
                                    checkInsByHabit
                                        .get(habit.id)
                                        ?.has(selectedDayKey) ??
                                    false,
                            ).length}{' '}
                            / {selectedHabits.length}
                        </p>
                    </div>
                </div>

                <div className="mt-5 space-y-3">
                    {selectedHabits.length === 0 && (
                        <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                            No habits were active on this day.
                        </p>
                    )}

                    {selectedHabits.map((habit) => {
                        const completed =
                            checkInsByHabit
                                .get(habit.id)
                                ?.has(selectedDayKey) ??
                            false;

                        return (
                            <div
                                key={habit.id}
                                className="flex items-center justify-between rounded-xl border p-4"
                            >
                                <div>
                                    <p className="font-medium">
                                        {habit.name}
                                    </p>

                                    {habit.description && (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {habit.description}
                                        </p>
                                    )}
                                </div>

                                <div
                                    className={`rounded-full px-3 py-1 text-xs font-medium ${completed
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    {completed
                                        ? 'Completed'
                                        : 'Not completed'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
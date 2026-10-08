'use client';

import { Check, Circle, Flame, Loader2 } from 'lucide-react';

import { useHabitCheckIns } from '@/lib/queries/check-in-queries';

interface HabitCardProps {
  id: string;
  name: string;
  description: string;
  streak: number;
}

export function HabitCard({
  id,
  name,
  description,
  streak,
}: HabitCardProps) {
  const {
    data: checkIns,
    isLoading,
    isError,
  } = useHabitCheckIns(id);

  const todayKey = new Date()
    .toISOString()
    .slice(0, 10);

  const completedToday =
    checkIns?.some(
      (checkIn) => checkIn.dayKey === todayKey,
    ) ?? false;

  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-semibold">
            {name}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            completedToday
              ? 'bg-green-100 text-green-600'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {completedToday ? (
            <Check className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Flame className="h-4 w-4 text-orange-500" />
          <span>{streak} day streak</span>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading
          </div>
        )}

        {!isLoading && isError && (
          <span className="text-sm text-destructive">
            Failed to load
          </span>
        )}

        {!isLoading && !isError && !completedToday && (
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Check in
          </button>
        )}

        {!isLoading && !isError && completedToday && (
          <span className="text-sm font-medium text-green-600">
            Completed
          </span>
        )}
      </div>
    </div>
  );
}
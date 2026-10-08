import { useQueries } from "@tanstack/react-query";
import type { Habit } from "../api/habits/habits-api";
import { getHabitCheckIns } from "../api/check-ins/check-in-api";

export function useHabitHistory(habits: Habit[]) {
    return useQueries({
        queries: habits.map((habit) => ({
            queryKey: ['check-ins', habit.id],
            queryFn: () => getHabitCheckIns(habit.id),
            staleTime: 30_000,
        })),
    });
}
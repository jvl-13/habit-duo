import { useQuery } from "@tanstack/react-query";
import { getHabitCheckIns } from "../api/check-ins/check-in-api";

export function useHabitCheckIns(habitId: string) {
    return useQuery({
        queryKey: [
            'check-ins',
            habitId,
        ],
        queryFn: () => getHabitCheckIns(habitId),
        enabled: Boolean(habitId),
    });
}
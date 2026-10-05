import { apiFetch } from "../client";

export interface CheckIn {
    id: string;
    habitId: string;
    userId: string;
    daykey: string;
    date: string;
    photoUrl: string | null;
    note: string | null;
    createdAt: string;
    user: {
        id: string;
        name: string;
        avatarUrl: string | null;
    };
}

export function getHabitCheckIns (habitId: string) {
    return apiFetch<CheckIn[]>(
        `/habits/${habitId}/check-ins`,
    );
}
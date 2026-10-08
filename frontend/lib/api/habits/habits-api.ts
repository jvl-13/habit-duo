import { apiFetch } from "../client";

export interface Habit {
    id: string;
    duoId: string;
    name:string;
    description: string | null;
    frequency: 'DAILY';
    deadline: string | null;
    startDate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export function getHabits() {
    return apiFetch<Habit[]>('/habits');
}
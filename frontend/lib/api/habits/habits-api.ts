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

export interface CreateHabitInput {
    name: string;
    description?: string;
    deadline?: string;
    startDate: string;
}

export interface UpdateHabitInput {
    name?: string;
    description? : string;
    deadline?: string;
    startDate?: string;
    isActive?: boolean;
}


export function getHabits() {
    return apiFetch<Habit[]>('/habits');
}

export function getHabit(id: string) {
    return apiFetch<Habit>(`/habits/${id}`);
}

export function createHabit(data: CreateHabitInput) {
    return apiFetch<Habit>('/habits', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function updateHabit(id: string, data: UpdateHabitInput) {
    return apiFetch<Habit>(`/habits/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    });
}

export function deleteHabit(id: string) {
    return apiFetch<Habit>(`/habits/${id}`, {
        method: 'DELETE',
    });
}
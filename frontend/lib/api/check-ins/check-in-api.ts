import { apiFetch } from "../client";

export interface CheckIn {
    id: string;
    habitId: string;
    userId: string;
    dayKey: string;
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

export function getHabitCheckIns(habitId: string) {
    return apiFetch<CheckIn[]>(
        `/habits/${habitId}/check-ins`,
    );
}

export function createCheckIn(
    habitId: string,
    data?: { note?: string },
) {
    return apiFetch<CheckIn>(
        `/habits/${habitId}/check-ins`,
        {
            method: 'POST',
            body: JSON.stringify(data ?? {}),
        },
    );
}

export function uploadCheckInPhoto(
    checkInId: string,
    photo: File,
) {
    const formData = new FormData();
    formData.append('photo', photo);

    return apiFetch<CheckIn>(
        `/check-ins/${checkInId}/photo`,
        {
            method: 'POST',
            body: formData,
        },
    );
}

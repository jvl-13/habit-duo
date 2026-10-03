import { getAccessToken } from "../auth/token-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const accessToken = getAccessToken();

    const headers = new Headers(options?.headers);

    headers.set('Content-Type', 'application/json');

    if (accessToken) {
        headers.set(
            'Authorization',
            `Bearer ${accessToken}`,
        )
    }
    
    const response = await fetch(
        `${API_URL}${path}`,
        {
            ...options,
            headers,
        },
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.message ?? 'Something went wrong',
        );
    }

    return data as T;
}

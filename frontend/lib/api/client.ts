import { refreshSession } from "../auth/refresh";
import { getAccessToken } from "../auth/token-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiFetchOprions extends RequestInit{
    skipAuth?: boolean;
    retry?: boolean;
}

export async function apiFetch<T>(path: string, options?: ApiFetchOprions): Promise<T> {
    const {
        skipAuth = false,
        retry = true,
        ...fetchOptions
    } = options ?? {};

    const accessToken = getAccessToken();

    const headers = new Headers(fetchOptions.headers);

    headers.set('Content-Type', 'application/json');

    if (accessToken && !skipAuth) {
        headers.set(
            'Authorization',
            `Bearer ${accessToken}`,
        )
    }
    
    const response = await fetch(
        `${API_URL}${path}`,
        {
            ...fetchOptions,
            headers,
        },
    );

    if (
        response.status === 401 &&
        !skipAuth &&
        retry
    ) {
        try {
            const newAccessToken = await refreshSession();

            const retryHeaders = new Headers(fetchOptions.headers);

            retryHeaders.set('Content-Type', 'application/json');

            retryHeaders.set('Authorization', `Bearer ${newAccessToken}`);

            const retryResponse = await fetch(
                `${API_URL}${path}`,
                {
                    ...fetchOptions,
                    headers: retryHeaders,
                },
            );

            const retryData = await retryResponse.json().catch(() => null);

            if (!retryResponse.ok) {
                throw new Error(retryData?.message ?? 'Something went wrong');
            }

            return retryData as T;
        } catch {
            throw new Error('Session expired. Please log in again.');
        }
    }

    // console.log('[API request]', {
    //     url: `${API_URL}${path}`,
    //     hasAccessToken: Boolean(accessToken),
    //     skipAuth,
    // });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            data?.message ?? 'Something went wrong',
        );
    }

    return data as T;
}

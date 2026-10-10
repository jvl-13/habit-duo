import { refreshSession } from "../auth/refresh";
import { getAccessToken } from "../auth/token-storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiFetchOptions extends RequestInit {
    skipAuth?: boolean;
    retry?: boolean;
}

export async function apiFetch<T>(
    path: string,
    options?: ApiFetchOptions,
): Promise<T> {
    const {
        skipAuth = false,
        retry = true,
        ...fetchOptions
    } = options ?? {};

    const accessToken = getAccessToken();

    function buildHeaders(token?: string | null) {
        const headers = new Headers(fetchOptions.headers);
        const isFormData = fetchOptions.body instanceof FormData;

        // FormData cần trình duyệt tự thiết lập multipart boundary.
        if (isFormData) {
            headers.delete("Content-Type");
        } else if (fetchOptions.body !== undefined && !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }

        if (token && !skipAuth) {
            headers.set("Authorization", `Bearer ${token}`);
        }

        return headers;
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...fetchOptions,
        headers: buildHeaders(accessToken),
    });

    if (response.status === 401 && !skipAuth && retry) {
        try {
            const newAccessToken = await refreshSession();

            const retryResponse = await fetch(`${API_URL}${path}`, {
                ...fetchOptions,
                headers: buildHeaders(newAccessToken),
            });

            const retryData = await retryResponse.json().catch(() => null);

            if (!retryResponse.ok) {
                throw new Error(
                    retryData?.message ?? "Something went wrong",
                );
            }

            return retryData as T;
        } catch (error) {
            if (
                error instanceof Error &&
                error.message !== "Session expired. Please log in again."
            ) {
                throw error;
            }

            throw new Error("Session expired. Please log in again.");
        }
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message ?? "Something went wrong");
    }

    return data as T;
}

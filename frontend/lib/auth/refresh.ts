import { refreshAccessToken } from "../api/auth/auth-api";
import { clearTokens, getRefreshToken, saveToken } from "./token-storage";

let refreshPromise:
    | Promise<string>
    | null = null;

export async function refreshSession() {
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = performRefresh();

    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
}

async function performRefresh() {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        clearTokens();

        throw new Error('No refresh token available');
    }

    try {
        const result = await refreshAccessToken(refreshToken);

        saveToken(
            result.accessToken,
            result.refreshToken,
        );

        return result.accessToken;
    } catch (error) {
        clearTokens();
        throw error;
    }


}
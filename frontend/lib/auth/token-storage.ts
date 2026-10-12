const ACCESS_TOKEN_KEY = 'habit_duo_access_token';
const REFRESH_TOKEN_KEY = 'habit_duo_refresh_token';

const AUTH_TOKEN_CHANGED_EVENT = 'habit-duo:auth-token-changed';

function notifyTokenChange() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(
            new Event(AUTH_TOKEN_CHANGED_EVENT),
        );
    }
}

export function saveToken(
    accessToken: string,
    refreshToken: string,
) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    notifyTokenChange();
}

export function getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    notifyTokenChange();
}

export function subscribeToTokenChanges(
    callback: () => void,
) {
    if (typeof window === 'undefined') {
        return () => {};
    }

    window.addEventListener(
        AUTH_TOKEN_CHANGED_EVENT,
        callback,
    );

    return () => {
        window.removeEventListener(
            AUTH_TOKEN_CHANGED_EVENT,
            callback,
        );
    };
}

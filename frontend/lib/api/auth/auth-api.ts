import { apiFetch } from '../client';
import { AuthResponse, LoginRequest, ReigsterRequest, User } from './type';

export function login (data: LoginRequest) {
    return apiFetch<AuthResponse>(
        '/auth/login',
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
    );
}

export function register (data: ReigsterRequest) {
    return apiFetch<AuthResponse>(
        '/auth/register',
        {
            method: 'POST',
            body: JSON.stringify(data),
        },
    );
}

export function getMe() {
    return apiFetch<User>('/auth/me');
}

export function refreshAccessToken(refreshToken: string) {
    return apiFetch<{
        accessToken: string;
        refreshToken: string;
    }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({
            refreshToken,
        }),
        skipAuth: true,
    });
}
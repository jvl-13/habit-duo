export interface User{
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    createAt?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface ReigsterRequest {
    email: string;
    name: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}
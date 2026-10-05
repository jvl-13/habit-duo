import { apiFetch } from "../client";

export interface DuoMember {
    userId: string;
    role: 'INVITER | INVITEE';
    joinedAt: string;
    user: {
        id: string;
        email: string;
        name: string;
        avatarUrl: string | null;
        lastSeenAt: string | null;
    };
}

export interface Duo {
    id: string;
    status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'ENDED';
    createdAt: string;
    updatedAt: string;
    members: DuoMember[];
}

export function getMyDuo() {
    return apiFetch<Duo | null>('/duos/me');
}
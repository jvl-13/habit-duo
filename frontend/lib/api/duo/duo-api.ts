
import { apiFetch } from "../client";

export type DuoRole = "INVITER" | "INVITEE";

export type DuoStatus =
    | "PENDING"
    | "ACTIVE"
    | "REJECTED"
    | "ENDED";

export interface DuoMember {
    userId: string;
    role: DuoRole;
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
    status: DuoStatus;
    createdAt: string;
    updatedAt: string;
    members: DuoMember[];
}

export interface InviteDuoInput {
    email: string;
}

export function getMyDuo() {
    return apiFetch<Duo | null>("/duos/me");
}

export function invitePartner(data: InviteDuoInput) {
    return apiFetch<Duo>("/duos/invite", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function acceptDuoInvitation(duoId: string) {
    return apiFetch<Duo>(`/duos/${duoId}/accept`, {
        method: "POST",
    });
}

export function rejectDuoInvitation(duoId: string) {
    return apiFetch<Duo>(`/duos/${duoId}/reject`, {
        method: "POST",
    });
}

export function endDuo(duoId: string) {
    return apiFetch<void>(`/duos/${duoId}`, {
        method: "DELETE",
    });
}

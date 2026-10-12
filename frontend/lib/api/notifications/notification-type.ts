export type NotificationType = 
    | 'CHECKIN_CREATED'
    | 'POKE_RECEIVED'
    | 'DUO_INVITATION';

export interface NotificationItem {
    id: string;
    userId: string;
    type: NotificationType;
    payload: Record<string, unknown>;
    read: boolean;
    createdAt: string;
}
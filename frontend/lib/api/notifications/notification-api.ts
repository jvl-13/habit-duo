import { apiFetch } from "../client";
import { NotificationItem } from "./notification-type";

export function getNotifications() {
    return apiFetch<NotificationItem[]>(
        `/notifications`);
}

export function markNotificationAsRead(notificationId: string) {
    return apiFetch<NotificationItem>(
        `/notifications/${notificationId}/read`, {
            method: 'PATCH',
        }
    );
}
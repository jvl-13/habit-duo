
import {
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';

import {
    getNotifications,
    markNotificationAsRead,
} from '@/lib/api/notifications/notification-api';

export const notificationKeys = {
    all: ['notifications'] as const,
};

export function useNotifications() {
    return useQuery({
        queryKey: notificationKeys.all,
        queryFn: getNotifications,
    });
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: markNotificationAsRead,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: notificationKeys.all,
            });
        },
    });
}

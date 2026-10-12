
'use client';

import { useState, useEffect } from 'react';
import { notificationKeys } from '@/lib/queries/notification-queries';
import { useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';

import {
    useNotifications,
    useMarkNotificationAsRead,
} from '@/lib/queries/notification-queries';

import type { NotificationItem } from '@/lib/api/notifications/notification-type';
import { error } from 'console';
import { useSocket } from '@/lib/socket/socket-provider';

function getNotificationMessage(notification: NotificationItem) {
    const payload = notification.payload;

    const habitName =
        typeof payload.habitName === 'string'
            ? payload.habitName
            : 'your habit';

    const userName =
        typeof payload.userName === 'string'
            ? payload.userName
            : typeof payload.fromUserName === 'string'
                ? payload.fromUserName
                : 'Your partner';

    switch (notification.type) {
        case 'CHECKIN_CREATED':
            return `${userName} checked in: ${habitName}`;

        case 'POKE_RECEIVED':
            return `${userName} poked you about ${habitName}`;

        case 'DUO_INVITATION':
            return 'You have a new duo invitation';

        default:
            return 'You have a new notification';
    }
}

function formatNotificationTime(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);

    const {
        data: notifications = [],
        isLoading,
        isError,
        refetch,
    } = useNotifications();

    const {
        mutate: markAsRead,
        isPending: isMarkingRead,
    } = useMarkNotificationAsRead();

    const unreadCount = notifications.filter(
        (notification) => !notification.read,
    ).length;

    const handleNotificationClick = (
        notification: NotificationItem,
    ) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
    };


    const queryClient = useQueryClient();
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) {
            return;
        }

        const handleNewNotification = (
            notification: NotificationItem,
        ) => {
            queryClient.setQueryData<NotificationItem[]>(
                notificationKeys.all,
                (currentNotifications) => {
                    const current = currentNotifications ?? [];

                    if (
                        current.some(
                            (item) => item.id === notification.id,
                        )
                    ) {
                        return current;
                    }

                    return [notification, ...current];
                },
            );
        };

        socket.on(
            'notification:new',
            handleNewNotification,
        );

        return () => {
            socket.off(
                'notification:new',
                handleNewNotification,
            );
        };
    }, [socket, queryClient]);


    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={isOpen}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
                <Bell className="h-5 w-5" />

                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-background shadow-xl">
                    <div className="flex items-center justify-between border-b px-4 py-3">
                        <div>
                            <h2 className="font-semibold">
                                Notifications
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {unreadCount} unread
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            aria-label="Refresh notifications"
                            title="Refresh"
                        >
                            <Loader2
                                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                            />
                        </button>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                        {isLoading && (
                            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                                Loading notifications...
                            </p>
                        )}

                        {isError && !isLoading && (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-red-600">
                                    Could not load notifications.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => void refetch()}
                                    className="mt-2 text-sm font-medium underline"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {!isLoading &&
                            !isError &&
                            notifications.length === 0 && (
                                <div className="px-4 py-10 text-center">
                                    <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />
                                    <p className="mt-3 text-sm font-medium">
                                        All caught up!
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        New activity will appear here.
                                    </p>
                                </div>
                            )}

                        {!isLoading &&
                            !isError &&
                            notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                    disabled={
                                        notification.read ||
                                        isMarkingRead
                                    }
                                    className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left transition last:border-b-0 ${notification.read
                                            ? 'opacity-70'
                                            : 'bg-blue-50/70 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/40'
                                        }`}
                                >
                                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                                        {notification.read ? (
                                            <CheckCheck className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Bell className="h-4 w-4 text-blue-600" />
                                        )}
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium">
                                            {getNotificationMessage(notification)}
                                        </span>
                                        <span className="mt-1 block text-xs text-muted-foreground">
                                            {formatNotificationTime(
                                                notification.createdAt,
                                            )}
                                        </span>
                                    </span>

                                    {!notification.read && (
                                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                    )}
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

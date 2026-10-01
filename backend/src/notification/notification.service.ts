import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NotificationService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async createCheckInNotification(
        recipientUserId: string,
        data: {
            habitId: string;
            habitName: string;
            checkInId: string;
            userId: string;
            userName: string;
        },
    ) {
        return this.prisma.notification.create({
            data: {
                userId: recipientUserId,
                type: 'CHECKIN_CREATED',
                payload: data,
            },
        });
    }

    async findMyNotifications(userId: string) {
        return this.prisma.notification.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async markAsRead (userId: string, notificationId: string) {
        const notification = await this.prisma.notification.findUnique({
            where: {
                id: notificationId,
            },
        });

        if (!notification) {
            throw new NotFoundException('Notification not found');
        }

        if (notification.userId !== userId) {
            throw new UnauthorizedException('You do not have access to this notification');
        }

        if (notification.read) {
            return notification;
        }

        return this.prisma.notification.update({
            where: {
                id: notificationId,
            },
            data: {
                read: true,
            },
        });
    }

    async createPokeNotification(
        recipientUserId: string, 
        data: {
            habitId: string;
            habitName: string;
            fromUserId: string;
            fromUserName: string;
            pokeId: string;
        }
    ) {
        return this.prisma.notification.create({
            data: {
                userId: recipientUserId,
                type: 'POKE_RECEIVED',
                payload: data,
            },
        });
    }
}

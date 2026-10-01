import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotificationService } from '../notification/notification.service.js';

@Injectable()
export class PokeService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationService,
    ) {}

    async create(userId: string, habitId: string) {
        const habit = await this.prisma.habit.findUnique({
            where: {
                id: habitId,
            },
            include: {
                duo: {
                    include: {
                        members: true,
                    },
                },
            },
        });

        if (!habit) {
            throw new NotFoundException('Habit not found');
        }

        if (habit.duo.status !== 'ACTIVE') {
            throw new ForbiddenException('This duo is not active');
        }

        if (!habit.isActive) {
            throw new ForbiddenException('This habit is not active');
        }

        const isMember = habit.duo.members.some(
            (member) => member.userId === userId,
        );

        if(!isMember) {
            throw new ForbiddenException('You do not have access to this habit');
        }

        const partner = habit.duo.members.find(
            (member) => member.userId !== userId,
        );

        if (!partner) {
            throw new ConflictException('This duo does not have a partner');
        }

        const today = new Date();
        const dayKey = today.toISOString().slice(0, 10);

        const existingCheckIn = await this.prisma.checkIn.findUnique({
            where: {
                habitId_userId_dayKey: {
                    habitId,
                    userId: partner.userId,
                    dayKey,
                },
            },
        });

        if (existingCheckIn) {
            throw new ConflictException('Your partner has already checked in today');
        }

        const existingPoke = await this.prisma.poke.findUnique({
            where: {
                fromUserId_habitId_dayKey: {
                    fromUserId: userId,
                    habitId,
                    dayKey,
                },
            },
        });

        if (existingPoke) {
            throw new ConflictException('You have already poked your partner today');
        }

        const fromUser = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                name: true,
            },
        });

        if (!fromUser) {
            throw new NotFoundException('User not found');
        }

        const poke = await this.prisma.poke.create({
            data: {
                fromUserId: userId,
                toUserId: partner.userId,
                habitId,
                dayKey,
            },
        });

        await this.notificationService.createPokeNotification(
            partner.userId,
            {
                habitId: habit.id,
                habitName: habit.name,
                fromUserId: fromUser.id,
                fromUserName: fromUser.name,
                pokeId: poke.id
            },
        );

        return poke;
    }
}

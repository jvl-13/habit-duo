import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateHabitDto } from './dto/create-habit.dto.js';

@Injectable()
export class HabitService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async create(userId: string, dto: CreateHabitDto) {
        const membership = await this.prisma.duoMember.findFirst({
            where: {
                userId,
                duo: {
                    status: 'ACTIVE',
                },
            },
        });

        if (!membership) {
            throw new ForbiddenException('You must be in an active duo');
        }

        const existingHabit = await this.prisma.habit.findFirst({
            where: {
                duoId: membership.duoId,
                name: dto.name,
                isActive: true,
            },
        });

        if (existingHabit) {
            throw new ConflictException('A habit with this name already exists');
        }

        return this.prisma.habit.create({
            data: {
                duoId: membership.duoId,
                name: dto.name,
                description: dto.description,
                deadline: dto.deadline,
                startDate: new Date(dto.startDate),
                frequency: 'DAILY',
            },
        });
    }

    async findAll(userId: string){
        const membership = await this.prisma.duoMember.findFirst({
            where: {
                userId,
                duo: {
                    status: 'ACTIVE',
                },
            },
        });

        if (!membership) {
            throw new ForbiddenException('You must be in an active duo');
        }

        return this.prisma.habit.findMany({
            where: {
                duoId: membership.duoId,
            },
            orderBy: {
                createdAt: 'asc',
            }
        });
    }

    async findOne(userId: string, habitId: string) {
        const habit = await this.prisma.habit.findUnique({
            where: {
                id: habitId,
            },
            include: {
                duo: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        name: true,
                                        avatarUrl: true,
                                        lastSeenAt: true
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!habit) {
            throw new NotFoundException('Habit not found');
        }

        const isMember = habit.duo.members.some(
            (member) => member.userId === userId,
        );

        if (!isMember) {
            throw new ForbiddenException('You do not have access to this habit');
        }

        if (habit.duo.status !== 'ACTIVE') {
            throw new ForbiddenException('This duo is not active');
        }

        return habit;
    }
}

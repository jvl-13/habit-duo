import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateHabitDto } from './dto/create-habit.dto.js';
import { UpdateHabitDto } from './dto/update-habit.dto.js';

@Injectable()
export class HabitService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    private async getAuthorizedHabit(userId: string, habitId: string) {
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
                                        lastSeenAt: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!habit) {
            throw new NotFoundException('Habit not found');
        }

        if (habit.duo.status !== 'ACTIVE') {
            throw new ForbiddenException('This duo is not active');
        }

        const isMember = habit.duo.members.some(
            (member) => member.userId === userId,
        );

        if (!isMember) {
            throw new ForbiddenException('You do not have access to this habit');
        }

        return habit;
    }

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

    async findAll(userId: string) {
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
        return this.getAuthorizedHabit(
            userId, habitId
        );
    }

    async update(
        userId: string,
        habitId: string,
        dto: UpdateHabitDto,
    ) {
        const habit = await this.getAuthorizedHabit(
            userId,
            habitId,
        );

        if (
            dto.name !== undefined &&
            dto.name !== habit.name
        ) {
            const existingHabit =
                await this.prisma.habit.findFirst({
                    where: {
                        duoId: habit.duoId,
                        name: dto.name,
                        isActive: true,
                        NOT: {
                            id: habitId,
                        },
                    },
                });

            if (existingHabit) {
                throw new ConflictException(
                    'A habit with this name already exists',
                );
            }
        }

        return this.prisma.habit.update({
            where: {
                id: habitId,
            },
            data: {
                ...(dto.name !== undefined && {
                    name: dto.name,
                }),

                ...(dto.description !== undefined && {
                    description: dto.description,
                }),

                ...(dto.deadline !== undefined && {
                    deadline: dto.deadline,
                }),

                ...(dto.startDate !== undefined && {
                    startDate: new Date(dto.startDate),
                }),

                ...(dto.isActive !== undefined && {
                    isActive: dto.isActive,
                }),
            },
        });
    }

    async remove(userId: string, habitId: string) {
        await this.getAuthorizedHabit(userId, habitId);

        return this.prisma.habit.update({
            where: {
                id: habitId,
            },
            data: {
                isActive: false,
            }
        });
    }


}


import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCheckInDto } from './dto/create-check-in.dto.js';
import type { Express } from 'express';

@Injectable()
export class CheckInService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async create(userId: string, habitId: string, dto: CreateCheckInDto) {
        const habit = await this.prisma.habit.findUnique({
            where: {
                id: habitId,
            },
            include: {
                duo: {
                    include: {
                        members: true,
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
            (member) => member.userId === userId
        );

        if (!isMember) {
            throw new ForbiddenException('You do not have access to this habit')
        }

        if (!habit.isActive) {
            throw new ForbiddenException('This habit is inactive');
        }

        const now = new Date();

        const dayKey = now.toISOString().slice(0, 10);

        const existingCheckin = await this.prisma.checkIn.findUnique({
            where: {
                habitId_userId_dayKey: {
                    habitId,
                    userId,
                    dayKey,
                }
            }
        });

        if (existingCheckin) {
            throw new ConflictException('You have already checked in today');
        }

        return this.prisma.checkIn.create({
            data: {
                habitId,
                userId,
                dayKey,
                date: now,
                note: dto.note,
            }
        });
    }

    async findByHabit(userId: string, habitId: string) {
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
                                        name: true,
                                        email: true,
                                        avatarUrl: true,
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!habit) {
            throw new NotFoundException(
                'Habit not found',
            );
        }

        if (habit.duo.status !== 'ACTIVE') {
            throw new ForbiddenException(
                'This duo is not active',
            );
        }

        const isMember = habit.duo.members.some(
            (member) => member.userId === userId,
        );

        if (!isMember) {
            throw new ForbiddenException(
                'You do not have access to this habit',
            );
        }

        return this.prisma.checkIn.findMany({
            where: {
                habitId,
            },
            orderBy: {
                date: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
    }

    async findOne(userId: string, checkInId: string) {
        const checkIn = await this.prisma.checkIn.findUnique({
            where: {
                id: checkInId,
            },
            include: {
                habit: {
                    include: {
                        duo: {
                            include: {
                                members: {
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true,
                                                avatarUrl: true,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    }
                }
            }
        });

        if (!checkIn) {
            throw new NotFoundException(
                'Check-in not found',
            );
        }

        if (checkIn.habit.duo.status !== 'ACTIVE') {
            throw new ForbiddenException(
                'This duo is not active',
            );
        }

        // Check current user belongs to the Duo
        const isMember =
            checkIn.habit.duo.members.some(
                (member) => member.userId === userId,
            );

        if (!isMember) {
            throw new ForbiddenException(
                'You do not have access to this check-in',
            );
        }

        return checkIn;
    }

    async uploadsPhoto(userId: string, checkinId: string, photoUrl: string) {
        const checkIn = await this.prisma.checkIn.findUnique({
            where: {
                id: checkinId,
            },
            include: {
                habit: {
                    include: {
                        duo: {
                            include: {
                                members: true,
                            }
                        }
                    }
                }
            }
        })

        if (!checkIn) {
            throw new NotFoundException(
                'Check-in not found',
            );
        }

        if (checkIn.habit.duo.status !== 'ACTIVE') {
            throw new ForbiddenException(
                'This duo is not active',
            );
        }

        if (checkIn.userId !== userId) {
            throw new ForbiddenException(
                'You can only upload a photo for your own check-in',
            );
        }

        return this.prisma.checkIn.update({
            where: {
                id: checkinId,
            },
            data: {
                photoUrl,
            },
        });
    }
}

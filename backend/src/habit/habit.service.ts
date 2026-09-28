import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
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
}

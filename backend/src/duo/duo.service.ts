import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { InviteDuoDto } from './dto/invite-duo.dto.js';

@Injectable()
export class DuoService {
    constructor(
        private readonly prisma: PrismaService,
    ) {}

    async invite(userId: string, dto: InviteDuoDto) {
        const invitee = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (!invitee) {
            throw new NotFoundException('User not found');
        }

        if (invitee.id === userId) {
            throw new BadRequestException('You cannot invite yourself');
        }

        const existingMembership = await this.prisma.duoMember.findFirst({
            where: {
                userId,
                duo: {
                    status: {
                        in: ['PENDING', 'ACTIVE'],
                    },
                },
            },
        });

        if (existingMembership) {
            throw new ConflictException('You are already in duo');
        }

        const inviteeMembership = await this.prisma.duoMember.findFirst({
            where: {
                userId: invitee.id,
                duo: {
                    status: {
                        in: ['PENDING', 'ACTIVE'],
                    },
                },
            },
        });

        if (inviteeMembership) {
            throw new ConflictException('This user is already in a duo');
        }

        const duo = await this.prisma.duo.create({
            data: {
                status: 'PENDING',
                members: {
                    create: [
                        {
                            userId,
                            role: 'INVITER',
                        },
                        {
                            userId: invitee.id,
                            role: 'INVITEE',
                        },
                    ]
                }
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });

        return duo;
    }

    async accept(userId: string, duoId: string) {
        const duo = await this.prisma.duo.findUnique({
            where: {
                id: duoId,
            },
            include: {
                members: true,
            },
        });

        if(!duo) {
            throw new NotFoundException('Duo not found');
        }

        if (duo.status !== 'PENDING') {
            throw new ConflictException('This duo invitation is no longer pending');
        }

        const isMember = duo.members.find(
            (member) => member.userId === userId,
        );

        if (!isMember) {
            throw new NotFoundException('You are not a member of this duo');
        }

        if (isMember.role !== 'INVITEE') {
            throw new BadRequestException('Only the invited user can accept this duo');
        }

        const memberCount = duo.members.length;

        if (memberCount !== 2) {
            throw new ConflictException('Invalid duo membership');
        }

        const updatedDuo = await this.prisma.duo.update({
            where: {
                id: duoId,
            },
            data: {
                status: 'ACTIVE',
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true,
                                avatarUrl: true,
                            },
                        },
                    },
                },
            },
        });

        return updatedDuo;
    }

    async getMyDuo(userId: string) {
        const membership = await this.prisma.duoMember.findFirst({
            where: {
                userId,
                duo: {
                    status: {
                        in: ['PENDING', 'ACTIVE'],
                    },
                },
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
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!membership) {
            return null;
        }

        return membership.duo;
    }

    async reject(userId: string, duoId: string) {
        const duo = await this.prisma.duo.findUnique({
            where: {
                id: duoId,
            },
            include: {
                members: true
            },
        });

        if (!duo) {
            throw new NotFoundException('Duo not found');
        }

        if (duo.status !== 'PENDING') {
            throw new ConflictException('This duo invitation is no longer pending');
        }

        const member = duo.members.find(
            (item) => item.userId === userId,
        );

        if (!member) {
            throw new NotFoundException('You are not a member of this duo');
        }

        if (member.role !== 'INVITEE') {
            throw new BadRequestException('Only the invited user can reject this duo');
        }

        const updatedDuo = await this.prisma.duo.update({
            where: {
                id: duoId,
            },
            data: {
                status: 'REJECTED',
            },
        });

        return updatedDuo;
    }

    async end(userId: string, duoId: string) {
        const duo = await this.prisma.duo.findUnique({
            where: {
                id: duoId,
            },
            include: {
                members: true
            }
        });

        if(!duo) {
            throw new NotFoundException('Duo not found');
        }

        if (duo.status !== 'PENDING' && duo.status !== 'ACTIVE') {
            throw new ConflictException('This duo is no longer active');
        }

        const member = duo.members.find(
            (item) => item.userId === userId,
        )

        if (!member) {
            throw new NotFoundException('You are not a member of this duo');
        }

        const updateDuo = await this.prisma.duo.update({
            where: {
                id: duoId,
            },
            data: {
                status: 'ENDED',
            }
        });

        return updateDuo;
    }
}

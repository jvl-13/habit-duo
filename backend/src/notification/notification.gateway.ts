import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service.js';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class NotificationGateway
    implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // userId -> số lượng socket đang kết nối
    private readonly connectedUsers = new Map<string, number>();

    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ) { }

    async handleConnection(socket: Socket) {
        try {
            const token = socket.handshake.auth?.token;

            if (!token) {
                socket.disconnect();
                return;
            }

            const payload = await this.jwtService.verifyAsync(token);

            const userId = payload.sub;

            if (!userId) {
                socket.disconnect();
                return;
            }

            socket.data.userId = userId;

            await socket.join(`user:${userId}`);

            const currentConnections =
                this.connectedUsers.get(userId) ?? 0;

            this.connectedUsers.set(
                userId,
                currentConnections + 1,
            );

            await this.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    lastSeenAt: new Date(),
                },
            });

            console.log(
                `[Presence] ${userId} connected. sockets=${currentConnections + 1
                }`,
            );

            // Chỉ phát ONLINE khi user chuyển từ offline -> online
            if (currentConnections === 0) {
                await this.emitPresenceToPartner(
                    userId,
                    true,
                );
            }
        } catch {
            socket.disconnect();
        }
    }

    async handleDisconnect(socket: Socket) {
        const userId = socket.data.userId;

        if (!userId) {
            console.log(
                '[Presence] Unknown socket disconnected',
            );
            return;
        }

        const currentConnections =
            this.connectedUsers.get(userId) ?? 0;

        const remainingConnections =
            Math.max(currentConnections - 1, 0);

        if (remainingConnections === 0) {
            this.connectedUsers.delete(userId);

            await this.prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    lastSeenAt: new Date(),
                },
            });

            console.log(
                `[Presence] ${userId} went OFFLINE`,
            );

            await this.emitPresenceToPartner(
                userId,
                false,
            );

            return;
        }

        this.connectedUsers.set(
            userId,
            remainingConnections,
        );

        console.log(
            `[Presence] ${userId} disconnected one socket. sockets=${remainingConnections
            }`,
        );
    }

    private async emitPresenceToPartner(
        userId: string,
        online: boolean,
    ) {
        const membership =
            await this.prisma.duoMember.findFirst({
                where: {
                    userId,
                    duo: {
                        status: 'ACTIVE',
                    },
                },
                include: {
                    duo: {
                        include: {
                            members: true,
                        },
                    },
                },
            });

        if (!membership) {
            return;
        }

        const partner =
            membership.duo.members.find(
                (member) => member.userId !== userId,
            );

        if (!partner) {
            return;
        }

        const partnerUser =
            await this.prisma.user.findUnique({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    name: true,
                    lastSeenAt: true,
                },
            });

        if (!partnerUser) {
            return;
        }

        this.server
            .to(`user:${partner.userId}`)
            .emit('presence:update', {
                userId: partnerUser.id,
                name: partnerUser.name,
                online,
                lastSeenAt: partnerUser.lastSeenAt,
            });

        console.log(
            `[Presence] ${online ? 'ONLINE' : 'OFFLINE'
            } event sent to partner ${partner.userId}`,
        );
    }

    emitNotification(
        userId: string,
        notification: unknown,
    ) {
        this.server
            .to(`user:${userId}`)
            .emit(
                'notification:new',
                notification,
            );
    }
}
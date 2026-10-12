import {
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  JwtService,
} from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type {
  Server,
  Socket,
} from 'socket.io';

import { PrismaService } from '../prisma/prisma.service.js';

interface JwtPayload {
  sub: string;
  email: string;
}

interface PresencePayload {
  userId: string;
  isOnline: boolean;
  lastSeenAt: string | null;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(PresenceGateway.name);

  // Một user có thể mở nhiều tab hoặc thiết bị.
  private readonly userSockets = new Map<string, Set<string>>();

  // Tra cứu user tương ứng với socket khi ngắt kết nối.
  private readonly socketUsers = new Map<string, string>();

  // Tránh đánh dấu offline trong lúc client đang reconnect.
  private readonly offlineTimers = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(socket: Socket): Promise<void> {
    try {
      const token = socket.handshake.auth?.token;

      if (typeof token !== 'string' || !token) {
        socket.disconnect(true);
        return;
      }

      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(token);

      if (!payload.sub || !socket.connected) {
        socket.disconnect(true);
        return;
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true },
      });

      if (!user || !socket.connected) {
        socket.disconnect(true);
        return;
      }

      const userId = user.id;

      socket.data.userId = userId;
      this.socketUsers.set(socket.id, userId);

      const existingSockets = this.userSockets.get(userId);
      const wasOffline = !existingSockets || existingSockets.size === 0;

      if (existingSockets) {
        existingSockets.add(socket.id);
      } else {
        this.userSockets.set(userId, new Set([socket.id]));
      }

      // Mỗi user có một room riêng để gửi presence.
      await socket.join(this.userRoom(userId));

      const timer = this.offlineTimers.get(userId);

      if (timer) {
        clearTimeout(timer);
        this.offlineTimers.delete(userId);
      }

      if (wasOffline) {
        await this.notifyPartner(userId, {
          userId,
          isOnline: true,
          lastSeenAt: null,
        });
      }

      // Gửi trạng thái hiện tại của người đồng hành
      // cho socket vừa kết nối.
      await this.sendPartnerStatus(socket, userId);

      this.logger.debug(`User connected: ${userId}`);
    } catch (error) {
      this.logger.warn(
        `Socket authentication failed: ${socket.id}`,
      );

      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket): void {
    const userId = this.socketUsers.get(socket.id);

    if (!userId) {
      return;
    }

    this.socketUsers.delete(socket.id);

    const sockets = this.userSockets.get(userId);

    sockets?.delete(socket.id);

    // User vẫn online nếu còn socket khác.
    if (sockets && sockets.size > 0) {
      return;
    }

    this.userSockets.delete(userId);

    // Chờ một chút để tránh báo offline khi reconnect nhanh.
    const previousTimer = this.offlineTimers.get(userId);

    if (previousTimer) {
      clearTimeout(previousTimer);
    }

    const timer = setTimeout(() => {
      void this.markOfflineIfDisconnected(userId);
    }, 500);

    this.offlineTimers.set(userId, timer);
  }

  private async markOfflineIfDisconnected(
    userId: string,
  ): Promise<void> {
    this.offlineTimers.delete(userId);

    // Nếu user đã reconnect, không đánh dấu offline.
    if ((this.userSockets.get(userId)?.size ?? 0) > 0) {
      return;
    }

    const lastSeenAt = new Date();

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt },
      });

      await this.notifyPartner(userId, {
        userId,
        isOnline: false,
        lastSeenAt: lastSeenAt.toISOString(),
      });

      this.logger.debug(`User offline: ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to update lastSeenAt for user ${userId}`,
      );
    }
  }

  private async sendPartnerStatus(
    socket: Socket,
    userId: string,
  ): Promise<void> {
    const partner = await this.getActivePartner(userId);

    if (!partner) {
      return;
    }

    const isOnline =
      (this.userSockets.get(partner.userId)?.size ?? 0) > 0;

    socket.emit('presence:status', {
      userId: partner.userId,
      isOnline,
      lastSeenAt: partner.lastSeenAt?.toISOString() ?? null,
    } satisfies PresencePayload);
  }

  private async notifyPartner(
    userId: string,
    payload: PresencePayload,
  ): Promise<void> {
    const partner = await this.getActivePartner(userId);

    if (!partner) {
      return;
    }

    this.server
      .to(this.userRoom(partner.userId))
      .emit('presence:update', payload);
  }

  private async getActivePartner(userId: string) {
    const membership = await this.prisma.duoMember.findFirst({
      where: {
        userId,
        duo: { status: 'ACTIVE' },
      },
      select: {
        duo: {
          select: {
            members: {
              where: {
                userId: { not: userId },
              },
              select: {
                user: {
                  select: {
                    id: true,
                    lastSeenAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const partner = membership?.duo.members[0]?.user;

    return partner
      ? {
          userId: partner.id,
          lastSeenAt: partner.lastSeenAt,
        }
      : null;
  }

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }
}
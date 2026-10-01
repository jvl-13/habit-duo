import { Controller, Get, Param, Patch, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { NotificationService } from './notification.service.js';
import type { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService
    ) {}

    @Get()
    findMyNotifications(@Req() req: Request) {
        if (!req.user){
            throw new UnauthorizedException();
        }

        return this.notificationService.findMyNotifications(
            req.user.userId,
        );
    }

    @Patch(':id/read')
    markAsRead(@Req() req: Request, @Param('id') notificationId: string) {
        if (!req.user) {
            throw new UnauthorizedException();
        }

        return this.notificationService.markAsRead(
            req.user.userId,
            notificationId,
        );
    }
}

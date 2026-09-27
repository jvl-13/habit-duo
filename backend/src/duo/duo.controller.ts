import { Body, Controller, Delete, Get, Param, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { DuoService } from './duo.service.js';
import { InviteDuoDto } from './dto/invite-duo.dto.js';
import type { Request } from 'express';


@Controller('duos')
@UseGuards(JwtAuthGuard)
export class DuoController {
    constructor(
        private readonly duoService: DuoService,
    ) {}

    @Post('invite')
    invite (
        @Req() req: Request,
        @Body() dto: InviteDuoDto,
    ) {
        if (!req.user) {
            throw new UnauthorizedException();
        }

        return this.duoService.invite(
            req.user.userId,
            dto,
        )
    }

    @Post(':id/accept')
    accept(
        @Req() req: Request,
        @Param('id') duoId: string,
    ) {
        if (!req.user){
            throw new UnauthorizedException();
        }

        return this.duoService.accept(
            req.user.userId,
            duoId,
        );
    }

    @Get('me')
    getMyDuo(@Req() req: Request) {
        if (!req.user) {
            throw new UnauthorizedException();
        }

        return this.duoService.getMyDuo(req.user.userId);
    }

    @Post(':id/reject')
    reject(@Req() req: Request, @Param('id') duoId: string){
        if (!req.user) {
            throw new UnauthorizedException();
        }

        return this.duoService.reject(req.user.userId, duoId);
    }

    @Delete(':id')
    end(@Req() req: Request, @Param('id') duoId: string) {
        if (!req.user) {
            throw new UnauthorizedException();
        }

        return this.duoService.end(req.user.userId, duoId)
    }

}

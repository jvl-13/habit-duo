import { Controller, Param, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PokeService } from './poke.service.js';

@Controller('poke')
@UseGuards(JwtAuthGuard)
export class PokeController {
    constructor(
        private readonly pokeService: PokeService,
    ) {}

    @Post(':id/poke')
    create(
        @Req() req: Request,
        @Param('id') habitId: string,
    ) {
        if (!req.user) {
            throw new UnauthorizedException();
        }

        return this.pokeService.create(
            req.user.userId,
            habitId,
        );
    }
}

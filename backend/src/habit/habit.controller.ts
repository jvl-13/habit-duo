import { Body, Controller, Get, Param, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { HabitService } from './habit.service.js';
import type { Request } from 'express';
import { CreateHabitDto } from './dto/create-habit.dto.js';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitController {
    constructor(
        private readonly habitService: HabitService,
    ) {}

    @Post()
    create(@Req() req: Request, @Body() dto: CreateHabitDto) {
        if (!req.user) {
            throw new UnauthorizedException();
        }

        return this.habitService.create(
            req.user.userId,
            dto,
        );
    }

    @Get()
    findAll(@Req() req: Request) {
        if (!req.user){
            throw new UnauthorizedException();
        }

        return this.habitService.findAll(req.user.userId);
    }

    @Get(':id')
    findOne(@Req() req: Request, @Param('id') habitId: string) {
        if (!req.user){
            throw new UnauthorizedException();
        }

        return this.habitService.findOne(req.user.userId, habitId);
    }

}

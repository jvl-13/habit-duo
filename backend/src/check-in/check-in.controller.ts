import { BadRequestException, Body, Controller, Get, Param, Post, Req, UnauthorizedException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CheckInService } from './check-in.service.js';
import type { Request } from 'express';
import { CreateCheckInDto } from './dto/create-check-in.dto.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'node:path';
import { unlink } from 'node:fs/promises';

@Controller()
@UseGuards(JwtAuthGuard)
export class CheckInController {
    constructor(
        private readonly checkInService: CheckInService,
    ) { }

    @Post('habits/:id/check-ins')
    create(@Req() req: Request, @Param('id') habitId: string, @Body() dto: CreateCheckInDto) {
        if (!req.user) {
            throw new UnauthorizedException();
        }

        return this.checkInService.create(req.user.userId, habitId, dto);
    }

    @Get('habits/:id/check-ins')
    findByHabit(@Req() req: Request, @Param('id') habitId: string) {
        if (!req.user) {
            throw new UnauthorizedException();
        }
        return this.checkInService.findByHabit(req.user.userId, habitId);
    }

    @Get('check-ins/:id')
    findOne(@Req() req: Request,
        @Param('id') checkInId: string,
    ) {
        if (!req.user) {
            throw new UnauthorizedException();
        }

        return this.checkInService.findOne(
            req.user.userId,
            checkInId,
        );
    }

    @Post('check-ins/:id/photo')
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: './uploads/check-ins',
                filename: (
                    _req,
                    file,
                    callback,
                ) => {
                    const extensionMap: Record<
                        string,
                        string
                    > = {
                        'image/jpeg': '.jpg',
                        'image/png': '.png',
                        'image/webp': '.webp',
                    };

                    const extension = extensionMap[file.mimetype];

                    const filename = `${Date.now()}-${Math.round(
                        Math.random() * 1e9,
                    )}${extension}`;

                    callback(null, filename);
                }
            }),

            fileFilter: (
                _req,
                file,
                callback,
            ) => {
                const allowedTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/webp'
                ];

                if (!allowedTypes.includes(file.mimetype)) {
                    return callback(
                        new BadRequestException('Only image files JPEG, PNG, WebP are allowed'), false,
                    );
                }

                callback(null, true);
            },

            limits: {
                fieldSize: 5 * 1024 * 1024,
            },
        }),
    )
    async uploadPhoto(@Req() req: Request, @Param('id') checkInId: string, @UploadedFile() file: Express.Multer.File) {
        if (!req.user) {
            throw new UnauthorizedException();
        }

        if (!file) {
            throw new BadRequestException('Photo is required');
        }

        const photoUrl = `/uploads/check-ins/${file.filename}`;

        try {
            return await this.checkInService.uploadsPhoto(
                req.user.userId,
                checkInId,
                photoUrl,
            )
        } catch (error) {
            const filePath = join(
                process.cwd(),
                'uploads',
                'check-ins',
                file.filename,
            );

            try {
                await unlink(filePath);
            } catch (deleteError) {
                console.error('Failed to clean up uploaded file: ',
                    deleteError,
                )
            }
            throw error;
        }

    }

}

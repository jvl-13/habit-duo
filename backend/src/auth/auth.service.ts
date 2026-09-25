import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { createHash, randomBytes } from 'crypto';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';


@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (existingUser) {
            throw new ConflictException("Email already exists");
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                passwordHash
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                createdAt: true
            }
        });

        const accessToken = await this.generateAccessToken(user.id, user.email);

        const refreshToken = await this.createRefreshToken(user.id);

        return {
            user,
            accessToken,
            refreshToken
        };
    }

    private async generateAccessToken(userId: string, email: string) {
        return this.jwtService.signAsync({
            sub: userId,
            email,
        });
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordValid = await bcrypt.compare(
            dto.password,
            user.passwordHash,
        );

        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const accessToken = await this.generateAccessToken(
            user.id,
            user.email,
        );

        const refreshToken = await this.createRefreshToken(user.id);


        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                avatarUrl: user.avatarUrl,
            },
            accessToken,
            refreshToken,
        }
    }

    private generateRefreshToken(): string {
        return randomBytes(32).toString('hex');
    }

    private hashRefreshToken(token: string): string {
        return createHash('sha256').update(token).digest('hex');
    }

    private async createRefreshToken(userId: string) {
        const token = this.generateRefreshToken();

        const tokenHash = this.hashRefreshToken(token);

        const expiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
        );

        await this.prisma.refreshToken.create({
            data: {
                tokenHash,
                userId,
                expiresAt,
            },
        });

        return token;
    }

    async refresh(dto: RefreshTokenDto) {
        const tokenHash = this.hashRefreshToken(dto.refreshToken);

        const storedToken = await this.prisma.refreshToken.findUnique({
            where: {
                tokenHash,
            },
            include: {
                user: true,
            },
        });

        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (storedToken.revokedAt) {
            throw new UnauthorizedException('Refresh token has been revoked');
        }

        if (storedToken.expiresAt <= new Date()) {
            throw new UnauthorizedException('Refresh token has expired');
        }

        const user = storedToken.user;

        const accessToken = await this.generateAccessToken(
            user.id,
            user.email,
        );

        const newRefreshToken = this.generateRefreshToken();
        const newRefreshTokenHash = this.hashRefreshToken(newRefreshToken);

        const newExpiresAt = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
        );


        await this.prisma.$transaction([
            this.prisma.refreshToken.update({
            where: {
                id: storedToken.id,
            },
            data: {
                revokedAt: new Date(),
            },
            }),

            this.prisma.refreshToken.create({
                data: {
                    tokenHash: newRefreshTokenHash,
                    userId: user.id,
                    expiresAt: newExpiresAt,
                },
            }),
        ]);



        return {
            accessToken,
            refreshToken: newRefreshToken,
        }
    }

    async logout(refreshToken: string) {
        const tokenHash = this.hashRefreshToken(refreshToken);

        const storedToken = await this.prisma.refreshToken.findUnique({
            where: {
                tokenHash,
            },
        });

        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (storedToken.revokedAt) {
            return {
                message: "Already logged out",
            };
        }

        await this.prisma.refreshToken.update({
            where: {
                id: storedToken.id,
            },
            data: {
                revokedAt: new Date(),
            },
        });

        return {
            message: 'Logged out successfully',
        }
    }
}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DuoModule } from './duo/duo.module.js';
import { HabitModule } from './habit/habit.module.js';

@Module({
  imports: [PrismaModule, AuthModule, DuoModule, HabitModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
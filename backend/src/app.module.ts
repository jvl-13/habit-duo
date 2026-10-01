import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DuoModule } from './duo/duo.module.js';
import { HabitModule } from './habit/habit.module.js';
import { CheckInModule } from './check-in/check-in.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { NotificationModule } from './notification/notification.module.js';
import { PokeModule } from './poke/poke.module.js';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: './uploads',
    }),
    
    PrismaModule, 
    AuthModule, 
    DuoModule, 
    HabitModule, 
    CheckInModule, 
    NotificationModule, 
    PokeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
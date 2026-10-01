import { Module } from '@nestjs/common';
import { PokeController } from './poke.controller.js';
import { PokeService } from './poke.service.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [PokeController],
  providers: [PokeService]
})
export class PokeModule {}

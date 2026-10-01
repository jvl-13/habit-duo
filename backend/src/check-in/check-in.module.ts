import { Module } from '@nestjs/common';
import { CheckInController } from './check-in.controller.js';
import { CheckInService } from './check-in.service.js';
import { NotificationModule } from '../notification/notification.module.js';

@Module({
  imports: [NotificationModule],
  controllers: [CheckInController],
  providers: [CheckInService]
})
export class CheckInModule {}

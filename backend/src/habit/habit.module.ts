import { Module } from '@nestjs/common';
import { HabitController } from './habit.controller.js';
import { HabitService } from './habit.service.js';

@Module({
  controllers: [HabitController],
  providers: [HabitService]
})
export class HabitModule {}

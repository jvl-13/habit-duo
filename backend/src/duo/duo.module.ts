import { Module } from '@nestjs/common';
import { DuoController } from './duo.controller.js';
import { DuoService } from './duo.service.js';

@Module({
  controllers: [DuoController],
  providers: [DuoService]
})
export class DuoModule {}

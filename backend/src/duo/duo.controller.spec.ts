import { Test, TestingModule } from '@nestjs/testing';
import { DuoController } from './duo.controller.js';

describe('DuoController', () => {
  let controller: DuoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DuoController],
    }).compile();

    controller = module.get<DuoController>(DuoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

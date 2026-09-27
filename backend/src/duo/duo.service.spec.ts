import { Test, TestingModule } from '@nestjs/testing';
import { DuoService } from './duo.service.js';

describe('DuoService', () => {
  let service: DuoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DuoService],
    }).compile();

    service = module.get<DuoService>(DuoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

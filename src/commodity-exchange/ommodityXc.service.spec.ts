import { Test, TestingModule } from '@nestjs/testing';
import { CommodityXcService } from './ommodityXc.service';

describe('CommodityXcService', () => {
  let service: CommodityXcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommodityXcService],
    }).compile();

    service = module.get<CommodityXcService>(CommodityXcService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

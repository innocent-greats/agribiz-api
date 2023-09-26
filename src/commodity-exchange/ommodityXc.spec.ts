import { Test, TestingModule } from '@nestjs/testing';
import { CommodityXcGateway } from './ommodityXc.gateway';
import { CommodityXcService } from './ommodityXc.service';

describe('CommodityGateway', () => {
  let gateway: CommodityXcGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommodityXcGateway, CommodityXcService],
    }).compile();

    gateway = module.get<CommodityXcGateway>(CommodityXcGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

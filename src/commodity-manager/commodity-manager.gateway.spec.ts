import { Test, TestingModule } from '@nestjs/testing';
import { ServiceProvidersGateway } from './commodity-manager.gateway';
import { ServiceProvidersService } from './commodity-manager.service';

describe('ServiceProvidersGateway', () => {
  let gateway: ServiceProvidersGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiceProvidersGateway, ServiceProvidersService],
    }).compile();

    gateway = module.get<ServiceProvidersGateway>(ServiceProvidersGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

import { Module, forwardRef } from '@nestjs/common';
import { CommodityXcService } from './ommodityXc.service';
import { CommodityXcGateway } from './ommodityXc.gateway';
import { SocketService } from 'src/sockets-gateway/service';
import { ServiceProvidersService } from 'src/service-providers/service-providers.service';
import SearchService from 'src/search/search.service';
import { UsersModule } from 'src/users/users.module';
import { ServiceProvidersModule } from 'src/service-providers/service-providers.module';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from 'src/common/auth.module';
import { SearchModule } from 'src/search/search.module';

@Module({ imports: [
  forwardRef(() => AuthModule),
  forwardRef(() => SearchModule),
  forwardRef(() => HttpModule),
  forwardRef(() => UsersModule),
  forwardRef(() => ServiceProvidersModule),
],
  providers: [CommodityXcGateway, CommodityXcService, SocketService, ServiceProvidersService, SearchService]
})
export class CommodityXcModule {}

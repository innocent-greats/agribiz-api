import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/common/auth.module';
import { SearchModule } from 'src/search/search.module';
import { Portfolio } from './entities/portfolio.entity';

import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { SocketService } from 'src/sockets-gateway/service';
import SearchService from 'src/search/search.service';
import { JwtService } from '@nestjs/jwt';
import { UserWalletsService } from 'src/user-wallets/user-wallets.service';
import { Commodity, CommodityImage } from './entities/commodityentity';
import { CommodityManager } from './entities/commodity-manager.entity';
import { CommodityManagerController } from './commodity-manager.controller';
import { CommodityManagerGateway } from './commodity-manager.gateway';
import { CommodityManagersService } from './commodity-manager.service';

@Module({ 
  imports: [
    forwardRef(() => AuthModule),
    forwardRef(() => SearchModule),
    forwardRef(() => HttpModule),
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([
      Portfolio,
      Commodity,
      CommodityImage,
      CommodityManager
    ]),
  ],
  exports: [
    TypeOrmModule,
  ],
  providers: [CommodityManagerGateway,CommodityManagersService, SocketService, UsersService,SearchService,JwtService ,UserWalletsService],
  controllers: [
    CommodityManagerController
  ],
})
export class CommodityManagerModule {}

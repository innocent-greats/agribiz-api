import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { ServiceProvidersModule } from './service-providers/service-providers.module';
import { UserWalletsModule } from './user-wallets/user-wallets.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { CommodityManagerModule } from './commodity-manager/commodity-manager.module';


@Module({
  imports: [CommonModule, UsersModule, ServiceProvidersModule, UserWalletsModule, SalesOrdersModule, CommodityManagerModule],
  controllers: [AppController],
  providers: [AppService, ],
})
export class AppModule {}

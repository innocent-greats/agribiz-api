import {
    Controller,
    Get,
    UseInterceptors,
    ClassSerializerInterceptor, Body, Post, Param, Res,
  } from '@nestjs/common';
import { CommodityXcService } from './ommodityXc.service';

   
  @Controller('marketplace')
  @UseInterceptors(ClassSerializerInterceptor)
  export default class MarketplceController {
    constructor(
      private readonly commodityService: CommodityXcService
    ) {}


    @Get('offerItems/:fileId')
    async serveOfferItemImage(@Param('fileId') fileId, @Res() res): Promise<any> {
      res.sendFile(fileId, { root: 'uploadedFiles/offerItems'});
    }
    
    @Get('get-marketplace-beauty-services')
    async getMarketplaceBeautyServices(@Param('fileId') fileId, @Res() res): Promise<any> {
      console.log('Get-marketplace-beauty-services')
      return this.commodityService.getMarketplaceBeautyServices(fileId);
    }
    @Post('search-for-stylists')
    async searchForOfferItems(@Body() search: string) {
      return this.commodityService.searchBeautyServiceProviders(search);
    }
  }
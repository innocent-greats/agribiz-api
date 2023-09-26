import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RequestWithNewService } from 'src/users/dto/requestWithUser.interface';
import { CommodityManagersService } from './commodity-manager.service';

@Controller('commodity-manager')
export class CommodityManagerController {
  constructor(private readonly providerAdminService: CommodityManagersService) {}
  @Get('commodities/:fileId')
  async serveOfferItemImage(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(fileId, { root: './uploadedFiles/commodities' });
  }
  @Post('create-new-commodity')
  // @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './uploadedFiles/commodities',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(
            null,
            `${randomName}${extname(file.originalname + '.jpeg')}`,
          );
        },
      }),
    }),
  )
  async createNewCommodity(
    @Req() request: RequestWithNewService,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log(
      'addNewServiceImages NewCommodity request',
      request.body['commodity-item'],
    );
    const req = JSON.parse(request.body['service-item']);
    console.log('addNewServiceImages NewCommodity', req);
    return this.providerAdminService.createNewCommodity(req, files);
  }

  @Post('create-new-portfolio')
  createNewPortfolio(@Body() CreatePortfolioDTO: any) {
    console.log('create-new-portfolio');
    return this.providerAdminService.createNewPortfolio(CreatePortfolioDTO);
  }

  @Get('get-portfolio/:catalogID')
  async getPortfolio(@Param('portfolioID') catalogID, @Res() res) {
    console.log('Get-portfolio', catalogID);
    const catalog = await this.providerAdminService.getPortfolioByID(catalogID);
    if (catalog) {
      const successData = {
        status: 200,
        data: JSON.stringify(catalog),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
      console.log('getAccountPortfolio successData', successData);

      return successData;
    }
    return null;
  }
  @Get('get-account-catalogs/:authToken')
  async getAccountPortfolio(@Param('authToken') authToken, @Res() res) {
    console.log('Get-account-catalogs', authToken);
    const accountCatalogs =
      await this.providerAdminService.getPortfoliosByAccountID(authToken);
    if (accountCatalogs) {
      const successData = {
        status: 200,
        data: JSON.stringify(accountCatalogs),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
      console.log('getAccountPortfolio successData', successData);

      return successData;
    }
    return null;
  }

  @Post('update-beauty-service')
  // @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './uploadedFiles/serviceFolder',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(
            null,
            `${randomName}${extname(file.originalname + '.jpeg')}`,
          );
        },
      }),
    }),
  )

  @Post('create-new-service')
  // @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './uploadedFiles/serviceFolder',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(
            null,
            `${randomName}${extname(file.originalname + '.jpeg')}`,
          );
        },
      }),
    }),
  )



  @Post('update-commodity')
  // @UseGuards(JwtAuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor('file', 5, {
      storage: diskStorage({
        destination: './uploadedFiles/commodities',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(
            null,
            `${randomName}${extname(file.originalname + '.jpeg')}`,
          );
        },
      }),
    }),
  )
  async updateCommodity(
    @Req() request: RequestWithNewService,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log(
      'addNewServiceImages NewService request',
      request.body['service-item'],
    );
    const req = JSON.parse(request.body['service-item']);
    console.log('addNewServiceImages NewService', req);
    return this.providerAdminService.updateCommodity(req, files);
  }

}

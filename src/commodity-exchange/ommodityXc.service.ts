import { Injectable } from '@nestjs/common';
import SearchService from 'src/search/search.service';
import { ServiceProvidersService } from 'src/service-providers/service-providers.service';

@Injectable()
export class CommodityXcService {
  constructor(
    private serviceProvidersService: ServiceProvidersService,
    private searchService: SearchService,
  ) {}

  async getMarketplaceBeautyServices(accountID: string) {
    const beautyServices = await this.serviceProvidersService.getBeautyServices(accountID);
    console.log('beautyServices', beautyServices)
    return beautyServices;
  }

 async getMarketplaceBeautyServiceProviders(accountID: string) {
    const beautyServices = await this.serviceProvidersService.getBeautyServiceProviders(accountID);
    // console.log('getBeautyServiceProviders', beautyServices)
    return beautyServices;
  }

  async searchBeautyServiceProviders(search: any) {
    const searchResult = [];
    const text = search.text;
    console.log('text', text);
    const results = await this.searchService.searchBeautyProductService(text.toString());
    const ids = results.map((result) => result['vendorID']);
    console.log('results ids', ids);

    if (!ids.length) {
      console.log('!ids.length');
      return {
        status: 200,
        data: JSON.stringify([]),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
    }
    if (ids.length > 0) {
      console.log('ids.length > 0');

      const providers = await this.serviceProvidersService.searchBeautyServiceProviders(ids)
      
      console.log('results searchResult', providers);

      return {
        status: 200,
        data: JSON.stringify(providers),
        error: null,
        errorMessage: null,
        successMessage: 'success',
      };
    }
  }
  
}

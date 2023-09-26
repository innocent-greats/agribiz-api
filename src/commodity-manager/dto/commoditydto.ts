export class NewProfessionalServiceDTO {
  authToken?: string;
  uid?: string;
  providerID?:  string;
  catalogID?: string;
  newServiceName?: string;
  newServiceDescription?: string;
  newServicePrice?: number;
}

export class CommodityRequestDTO {
  authToken: string
  portfolioID: string;
  name: string
  price: number;
  description: string;
  category: string
  tradeStatus: string;
  trendingStatus: string;
  publishStatus: string;
}

export class UpdateCommodityDTO {
  authToken: string
  id: string;
  name: string
  price: number;
  description: string;
  category: string
  tradeStatus: string;
  trendingStatus: string;
  publishStatus: string;
}
export class BeautyServiceRequestDTO {
  authToken: string
  catalogID: string;
  name: string
  price: number;
  description: string;
  category: string
  tradeStatus: string;
  trendingStatus: string;
  publishStatus: string;
}
export class UpdateBeautyServiceDTO {
  authToken: string
  id: string;
  name: string
  price: number;
  description: string;
  category: string
  tradeStatus: string;
  trendingStatus: string;
  publishStatus: string;
}
export class BeautyServiceImage {
  imageID: string;
  url: string;
}
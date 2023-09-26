import { PartialType } from '@nestjs/mapped-types';
import { CreateBeautyMarketplaceDto } from './create-beauty-marketplace.dto';

export class UpdateBeautyMarketplaceDto extends PartialType(CreateBeautyMarketplaceDto) {
  id: number;
}

import { Injectable } from '@nestjs/common';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getAdminRepository } from '@src/module/backoffice/domain/admin.entity';
import { getBrandRepository } from '@src/module/backoffice/domain/brand.entity';
import { getCampaignRepository } from '@src/module/backoffice/domain/campaign.entity';
import { getCategoryRepository } from '@src/module/backoffice/domain/category.entity';
import { getProductTemplateRepository } from '@src/module/backoffice/domain/product-template/product-template.entity';
import { getProductTemplateCategoryRepository } from '@src/module/backoffice/domain/product-template/product-template-category.entity';
import { getHotelTemplateRepository } from '@src/module/backoffice/domain/product-template/hotel-template.entity';
import { getDeliveryTemplateRepository } from '@src/module/backoffice/domain/product-template/delivery-template.entity';
import { getETicketTemplateRepository } from '@src/module/backoffice/domain/product-template/eticket-template.entity';
import { getProductRepository } from '@src/module/backoffice/domain/product/product.entity';
import { getHotelProductRepository } from '@src/module/backoffice/domain/product/hotel-product.entity';
import { getDeliveryProductRepository } from '@src/module/backoffice/domain/product/delivery-product.entity';
import { getETicketProductRepository } from '@src/module/backoffice/domain/product/eticket-product.entity';
import { getSkuRepository } from '@src/module/backoffice/domain/product/sku.entity';
import { getProductOptionRepository } from '@src/module/backoffice/domain/product/product-option.entity';
import { getInfluencerRepository } from '@src/module/backoffice/domain/influencer.entity';
import { getSocialMediaRepository } from '@src/module/backoffice/domain/social-media.entity';
import { getHotelOptionRepository } from '@src/module/backoffice/domain/product/hotel-option.entity';

@Injectable()
export class RepositoryProvider {
  constructor(private transaction: TransactionService) {}

  get AdminRepository() {
    return getAdminRepository(this.transaction);
  }

  get BrandRepository() {
    return getBrandRepository(this.transaction);
  }

  get CampaignRepository() {
    return getCampaignRepository(this.transaction);
  }

  get CategoryRepository() {
    return getCategoryRepository(this.transaction);
  }

  get ProductTemplateRepository() {
    return getProductTemplateRepository(this.transaction);
  }

  get ProductTemplateCategoryRepository() {
    return getProductTemplateCategoryRepository(this.transaction);
  }

  get HotelTemplateRepository() {
    return getHotelTemplateRepository(this.transaction);
  }

  get DeliveryTemplateRepository() {
    return getDeliveryTemplateRepository(this.transaction);
  }

  get ETicketTemplateRepository() {
    return getETicketTemplateRepository(this.transaction);
  }

  get ProductRepository() {
    return getProductRepository(this.transaction);
  }

  get HotelProductRepository() {
    return getHotelProductRepository(this.transaction);
  }

  get DeliveryProductRepository() {
    return getDeliveryProductRepository(this.transaction);
  }

  get ETicketProductRepository() {
    return getETicketProductRepository(this.transaction);
  }

  get SkuRepository() {
    return getSkuRepository(this.transaction);
  }

  get ProductOptionRepository() {
    return getProductOptionRepository(this.transaction);
  }

  get InfluencerRepository() {
    return getInfluencerRepository(this.transaction);
  }

  get SocialMediaRepository() {
    return getSocialMediaRepository(this.transaction);
  }

  get HotelOptionRepository() {
    return getHotelOptionRepository(this.transaction);
  }
}

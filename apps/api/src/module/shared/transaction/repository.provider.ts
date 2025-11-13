import { Injectable } from '@nestjs/common';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getAdminRepository } from '@src/module/backoffice/domain/admin.entity';
import { getBrandRepository } from '@src/module/backoffice/domain/brand.entity';
import { getCampaignRepository } from '@src/module/backoffice/domain/campaign.entity';
import { getCategoryRepository } from '@src/module/backoffice/domain/category.entity';
import { getProductTemplateRepository } from '@src/module/backoffice/domain/product-template.entity';
import { getProductTemplateCategoryRepository } from '@src/module/backoffice/domain/product-template-category.entity';
import { getHotelTemplateRepository } from '@src/module/backoffice/domain/hotel-template.entity';
import { getDeliveryTemplateRepository } from '@src/module/backoffice/domain/delivery-template.entity';
import { getETicketTemplateRepository } from '@src/module/backoffice/domain/eticket-template.entity';
import { getProductRepository } from '@src/module/backoffice/domain/product.entity';
import { getHotelProductRepository } from '@src/module/backoffice/domain/hotel-product.entity';
import { getDeliveryProductRepository } from '@src/module/backoffice/domain/delivery-product.entity';
import { getETicketProductRepository } from '@src/module/backoffice/domain/eticket-product.entity';

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
}

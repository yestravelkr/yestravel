import { Injectable } from '@nestjs/common';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getAdminRepository } from '@src/module/backoffice/domain/admin.entity';
import { getBrandRepository } from '@src/module/backoffice/domain/brand.entity';
import { getCampaignRepository } from '@src/module/backoffice/domain/campaign.entity';
import { getCategoryRepository } from '@src/module/backoffice/domain/category.entity';
import { getProductItemRepository } from '@src/module/backoffice/domain/product-item.entity';

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

  get ProductItemRepository() {
    return getProductItemRepository(this.transaction);
  }
}

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
import { getHotelSkuRepository } from '@src/module/backoffice/domain/product/hotel-sku.entity';
import { getProductOptionRepository } from '@src/module/backoffice/domain/product/product-option.entity';
import { getInfluencerRepository } from '@src/module/backoffice/domain/influencer.entity';
import { getSocialMediaRepository } from '@src/module/backoffice/domain/social-media.entity';
import { getHotelOptionRepository } from '@src/module/backoffice/domain/product/hotel-option.entity';
import { getCampaignProductRepository } from '@src/module/backoffice/domain/campaign-product.entity';
import { getCampaignInfluencerRepository } from '@src/module/backoffice/domain/campaign-influencer.entity';
import { getCampaignInfluencerProductRepository } from '@src/module/backoffice/domain/campaign-influencer-product.entity';
import { getCampaignInfluencerHotelOptionRepository } from '@src/module/backoffice/domain/campaign-influencer-hotel-option.entity';
import { getTmpOrderRepository } from '@src/module/backoffice/domain/order/tmp-order.entity';
import { getOrderRepository } from '@src/module/backoffice/domain/order/order.entity';
import { getHotelOrderRepository } from '@src/module/backoffice/domain/order/hotel-order.entity';
import { getPaymentRepository } from '@src/module/backoffice/domain/order/payment.entity';
import { getClaimRepository } from '@src/module/backoffice/domain/order/claim.entity';
import { getOrderHistoryRepository } from '@src/module/backoffice/domain/order/order-history.entity';
import { getMemberRepository } from '@src/module/backoffice/domain/shop/member.entity';
import { getMemberAddressRepository } from '@src/module/backoffice/domain/shop/member-address.entity';
import { getPhoneVerificationRepository } from '@src/module/backoffice/domain/shop/phone-verification.entity';
import { getSocialAccountRepository } from '@src/module/backoffice/domain/shop/social-account.entity';
import { getInfluencerSettlementRepository } from '@src/module/backoffice/domain/settlement/influencer-settlement.entity';
import { getBrandSettlementRepository } from '@src/module/backoffice/domain/settlement/brand-settlement.entity';
import { DataSource, EntityManager } from 'typeorm';
import { getEntityManager } from '@src/database/datasources';

@Injectable()
export class RepositoryProvider {
  constructor(private transaction: TransactionService) {}

  get entityManager(): EntityManager {
    const entityManager = this.transaction.getTransaction();
    if (!entityManager) {
      return (getEntityManager() as DataSource).manager;
    }
    return entityManager;
  }

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

  get HotelSkuRepository() {
    return getHotelSkuRepository(this.transaction);
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

  get CampaignProductRepository() {
    return getCampaignProductRepository(this.transaction);
  }

  get CampaignInfluencerRepository() {
    return getCampaignInfluencerRepository(this.transaction);
  }

  get CampaignInfluencerProductRepository() {
    return getCampaignInfluencerProductRepository(this.transaction);
  }

  get CampaignInfluencerHotelOptionRepository() {
    return getCampaignInfluencerHotelOptionRepository(this.transaction);
  }

  get TmpOrderRepository() {
    return getTmpOrderRepository(this.transaction);
  }

  get OrderRepository() {
    return getOrderRepository(this.transaction);
  }

  get HotelOrderRepository() {
    return getHotelOrderRepository(this.transaction);
  }

  get PaymentRepository() {
    return getPaymentRepository(this.transaction);
  }

  get MemberRepository() {
    return getMemberRepository(this.transaction);
  }

  get MemberAddressRepository() {
    return getMemberAddressRepository(this.transaction);
  }

  get PhoneVerificationRepository() {
    return getPhoneVerificationRepository(this.transaction);
  }

  get SocialAccountRepository() {
    return getSocialAccountRepository(this.transaction);
  }

  get InfluencerSettlementRepository() {
    return getInfluencerSettlementRepository(this.transaction);
  }

  get BrandSettlementRepository() {
    return getBrandSettlementRepository(this.transaction);
  }

  get ClaimRepository() {
    return getClaimRepository(this.transaction);
  }

  get OrderHistoryRepository() {
    return getOrderHistoryRepository(this.transaction);
  }
}

import { EntityManager } from 'typeorm';
import { MemberEntity } from '@src/module/backoffice/domain/shop/member.entity';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';
import { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';
import {
  TmpOrderEntity,
  TmpOrderRawData,
} from '@src/module/backoffice/domain/order/tmp-order.entity';
import { HotelProductEntity } from '@src/module/backoffice/domain/product/hotel-product.entity';
import { HotelOptionEntity } from '@src/module/backoffice/domain/product/hotel-option.entity';
import { HotelSkuEntity } from '@src/module/backoffice/domain/product/hotel-sku.entity';
import { InfluencerEntity } from '@src/module/backoffice/domain/influencer.entity';
import { CampaignEntity } from '@src/module/backoffice/domain/campaign.entity';

/**
 * 테스트용 Brand 생성
 */
export async function makeBrand(
  em: EntityManager,
  overrides: Partial<BrandEntity> = {}
): Promise<BrandEntity> {
  const brand = em.create(BrandEntity, {
    name: 'Test Brand',
    email: null,
    phoneNumber: null,
    thumbnail: null,
    businessInfo: null,
    bankInfo: null,
    brandManagers: [],
    ...overrides,
  });
  return em.save(brand);
}

/**
 * 테스트용 Member 생성
 */
export async function makeMember(
  em: EntityManager,
  overrides: Partial<MemberEntity> = {}
): Promise<MemberEntity> {
  const member = em.create(MemberEntity, {
    phone: '01012345678',
    name: null,
    addresses: [],
    socialAccounts: [],
    ...overrides,
  });
  return em.save(member);
}

/**
 * 테스트용 Product 생성
 * brandId 필수
 */
export async function makeProduct(
  em: EntityManager,
  overrides: Partial<ProductEntity> & { brandId: number }
): Promise<ProductEntity> {
  const product = em.create(ProductEntity, {
    name: 'Test Product',
    type: 'HOTEL' as const,
    productTemplateId: null,
    productTemplate: null,
    thumbnailUrls: [],
    description: '',
    detailContent: '',
    categories: [],
    useCalendar: false,
    useStock: false,
    useOptions: false,
    originalPrice: 0,
    price: 100000,
    status: 'VISIBLE' as const,
    displayOrder: null,
    ...overrides,
  });
  return em.save(product);
}

/**
 * 테스트용 TmpOrder 생성
 * productId 필수
 */
export async function makeTmpOrder(
  em: EntityManager,
  overrides: Partial<TmpOrderEntity> & { productId: number }
): Promise<TmpOrderEntity> {
  const tmpOrder = em.create(TmpOrderEntity, {
    memberId: 1,
    type: 'HOTEL',
    raw: {
      customerName: 'Test Customer',
      customerPhone: '01012345678',
      productId: overrides.productId,
      totalAmount: 100000,
      influencerId: 1,
      campaignId: 1,
      orderOptionSnapshot: {},
    },
    ...overrides,
  });
  return em.save(tmpOrder);
}

/**
 * 테스트용 HotelProduct 생성
 * brandId 필수
 */
export async function makeHotelProduct(
  em: EntityManager,
  overrides: Partial<HotelProductEntity> & { brandId: number }
): Promise<HotelProductEntity> {
  const product = em.create(HotelProductEntity, {
    name: 'Test Hotel Room',
    productTemplateId: null,
    thumbnailUrls: [],
    description: '',
    detailContent: '',
    categories: [],
    useStock: true,
    useOptions: true,
    originalPrice: 0,
    price: 100000,
    status: 'VISIBLE' as const,
    displayOrder: null,
    baseCapacity: 2,
    maxCapacity: 4,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    bedTypes: [],
    tags: [],
    ...overrides,
  });
  return em.save(product);
}

/**
 * 테스트용 HotelOption 생성
 * productId 필수
 */
export async function makeHotelOption(
  em: EntityManager,
  overrides: Partial<HotelOptionEntity> & { productId: number }
): Promise<HotelOptionEntity> {
  const option = em.create(HotelOptionEntity, {
    name: 'Standard Room',
    priceByDate: { '2026-03-01': 100000 },
    anotherPriceByDate: {},
    ...overrides,
  } as HotelOptionEntity);
  return em.save(option);
}

/**
 * 테스트용 HotelSku 생성 (날짜별 재고)
 * productId, date 필수
 */
export async function makeHotelSku(
  em: EntityManager,
  overrides: Partial<HotelSkuEntity> & { productId: number; date: string }
): Promise<HotelSkuEntity> {
  const sku = em.create(HotelSkuEntity, {
    skuCode: `SKU-${overrides.date}`,
    name: `재고 ${overrides.date}`,
    quantity: 1,
    attributes: {},
    ...overrides,
  } as HotelSkuEntity);
  return em.save(sku);
}

/**
 * 테스트용 Influencer 생성
 */
export async function makeInfluencer(
  em: EntityManager,
  overrides: Partial<InfluencerEntity> = {}
): Promise<InfluencerEntity> {
  const influencer = em.create(InfluencerEntity, {
    name: 'Test Influencer',
    email: null,
    phoneNumber: null,
    thumbnail: null,
    businessInfo: null,
    bankInfo: null,
    slug: `test-influencer-${Date.now()}`,
    ...overrides,
  });
  return em.save(influencer);
}

/**
 * 테스트용 Campaign 생성
 */
export async function makeCampaign(
  em: EntityManager,
  overrides: Partial<CampaignEntity> = {}
): Promise<CampaignEntity> {
  const campaign = em.create(CampaignEntity, {
    title: 'Test Campaign',
    startAt: new Date(),
    endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    description: null,
    thumbnail: null,
    ...overrides,
  });
  return em.save(campaign);
}

/**
 * 호텔 TmpOrder Raw 데이터 빌더
 * productId, influencerId, campaignId, hotelOptionId 필수
 */
export function buildHotelTmpOrderRaw(params: {
  productId: number;
  influencerId: number;
  campaignId: number;
  hotelOptionId: number;
  hotelOptionName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  totalAmount?: number;
  priceByDate?: Record<string, number>;
}): TmpOrderRawData {
  const checkInDate = params.checkInDate ?? '2026-03-01';
  const checkOutDate = params.checkOutDate ?? '2026-03-02';
  return {
    customerName: 'Test Customer',
    customerPhone: '01012345678',
    productId: params.productId,
    totalAmount: params.totalAmount ?? 100000,
    influencerId: params.influencerId,
    campaignId: params.campaignId,
    orderOptionSnapshot: {
      type: 'HOTEL',
      checkInDate,
      checkOutDate,
      hotelOptionId: params.hotelOptionId,
      hotelOptionName: params.hotelOptionName ?? 'Standard Room',
      priceByDate: params.priceByDate ?? { [checkInDate]: 100000 },
    },
  };
}

// TODO: 필요에 따라 추가 entity maker 구현
// - makeOrder
// - makePayment

import { EntityManager } from 'typeorm';
import { MemberEntity } from '@src/module/backoffice/domain/shop/member.entity';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';
import { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';
import { TmpOrderEntity } from '@src/module/backoffice/domain/order/tmp-order.entity';

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

// TODO: 필요에 따라 추가 entity maker 구현
// - makeInfluencer
// - makeCampaign
// - makeOrder
// - makePayment

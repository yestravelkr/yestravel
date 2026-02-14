import { DataSource, EntityManager } from 'typeorm';
import { ShopPaymentService } from './shop.payment.service';
import {
  getTestDataSource,
  destroyTestDataSource,
} from '@test-utils/test-datasource';
import { truncateAllTables } from '@test-utils/test-helpers';
import { createTestRepositoryProvider } from '@test-utils/mock-repository-provider';
import { setupPortoneMocks, clearPortoneMocks } from '@test-utils/axios-mock';
import {
  makeBrand,
  makeMember,
  makeHotelProduct,
  makeHotelOption,
  makeHotelSku,
  makeInfluencer,
  makeCampaign,
  makeTmpOrder,
  buildHotelTmpOrderRaw,
} from '@test-utils/entity-makers';
import {
  OrderEntity,
  orderNumberParser,
} from '@src/module/backoffice/domain/order/order.entity';
import { HotelSkuEntity } from '@src/module/backoffice/domain/product/hotel-sku.entity';
import axios from 'axios';

/**
 * ShopPaymentService - 재고 동시성 통합 테스트
 *
 * TDD Red Phase: 재고 차감 로직 구현 전이므로 모든 테스트가 FAIL합니다.
 *
 * 테스트 시나리오:
 * - 1개 HotelProduct + 2개 HotelOption + HotelSku(quantity=1)
 * - 결제 완료 시 HotelSku.quantity 차감 검증
 * - 2명 동시 결제 시 1명만 성공하는 동시성 제어 검증
 *
 * 동시성 테스트 방식:
 * - 별도 QueryRunner(= 별도 DB 커넥션)로 격리된 트랜잭션 생성
 * - Promise.allSettled로 동시 실행
 * - Setup 데이터는 커밋된 상태여야 두 커넥션에서 모두 조회 가능
 */
describe('ShopPaymentService - 재고 동시성 (Integration)', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await getTestDataSource();
  });

  beforeEach(() => {
    setupPortoneMocks();
  });

  afterEach(async () => {
    clearPortoneMocks();
    await truncateAllTables(dataSource.manager);
  });

  afterAll(async () => {
    await destroyTestDataSource();
  });

  /**
   * 지정된 EntityManager로 ShopPaymentService 인스턴스 생성
   */
  function createService(em: EntityManager): ShopPaymentService {
    const rp = createTestRepositoryProvider(em);
    return new ShopPaymentService(rp);
  }

  /**
   * 별도 DB 커넥션(QueryRunner)에서 격리된 트랜잭션으로 콜백 실행
   *
   * 동시성 테스트에서 각 결제 요청이 독립된 트랜잭션 컨텍스트를 가지도록 함.
   * SELECT FOR UPDATE 락이 서로 다른 커넥션 간에 올바르게 작동하는지 검증.
   */
  async function executeInIsolatedTransaction(
    callback: (service: ShopPaymentService) => Promise<any>
  ): Promise<any> {
    const qr = dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const service = createService(qr.manager);
      const result = await callback(service);
      await qr.commitTransaction();
      return result;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  /**
   * 호텔 테스트 데이터 셋업
   *
   * 데이터는 dataSource.manager(auto-commit)로 저장되어
   * 별도 QueryRunner 트랜잭션에서도 조회 가능
   */
  async function setupHotelTestData(skuQuantity = 1) {
    const em = dataSource.manager;
    const brand = await makeBrand(em);
    const product = await makeHotelProduct(em, { brandId: brand.id });
    const option = await makeHotelOption(em, {
      productId: product.id,
      name: 'Standard Room',
      priceByDate: { '2026-03-01': 100000 },
    });
    const sku = await makeHotelSku(em, {
      productId: product.id,
      date: '2026-03-01',
      quantity: skuQuantity,
    });
    const member = await makeMember(em);
    const influencer = await makeInfluencer(em);
    const campaign = await makeCampaign(em);

    return { brand, product, option, sku, member, influencer, campaign };
  }

  describe('handlePaymentComplete 재고 차감', () => {
    it('결제 완료 시 HotelSku quantity를 1 차감한다', async () => {
      const { product, option, sku, member, influencer, campaign } =
        await setupHotelTestData(1);

      const tmpOrder = await makeTmpOrder(dataSource.manager, {
        productId: product.id,
        memberId: member.id,
        raw: buildHotelTmpOrderRaw({
          productId: product.id,
          influencerId: influencer.id,
          campaignId: campaign.id,
          hotelOptionId: option.id,
          hotelOptionName: option.name,
        }),
      });

      const paymentId = orderNumberParser.encode(
        [tmpOrder.id],
        tmpOrder.createdAt
      );

      await executeInIsolatedTransaction(svc =>
        svc.handlePaymentComplete({
          paymentId,
          paymentToken: 'test-token',
          transactionType: 'PAYMENT',
          txId: 'test-tx-id',
          memberId: member.id,
        })
      );

      // Assert: HotelSku quantity가 1 → 0으로 차감됨
      const updatedSku = await dataSource.manager.findOneBy(HotelSkuEntity, {
        id: sku.id,
      });
      expect(updatedSku!.quantity).toBe(0);
    });

    it('재고 0인 날짜 결제 시 실패 + 결제 취소', async () => {
      const { product, option, member, influencer, campaign } =
        await setupHotelTestData(0); // quantity=0

      const tmpOrder = await makeTmpOrder(dataSource.manager, {
        productId: product.id,
        memberId: member.id,
        raw: buildHotelTmpOrderRaw({
          productId: product.id,
          influencerId: influencer.id,
          campaignId: campaign.id,
          hotelOptionId: option.id,
          hotelOptionName: option.name,
        }),
      });

      const paymentId = orderNumberParser.encode(
        [tmpOrder.id],
        tmpOrder.createdAt
      );

      // 재고 부족으로 에러 발생해야 함
      await expect(
        executeInIsolatedTransaction(svc =>
          svc.handlePaymentComplete({
            paymentId,
            paymentToken: 'test-token',
            transactionType: 'PAYMENT',
            txId: 'test-tx-id',
            memberId: member.id,
          })
        )
      ).rejects.toThrow();

      // Assert: Order가 생성되지 않음
      const orders = await dataSource.manager.find(OrderEntity);
      expect(orders).toHaveLength(0);
    });
  });

  describe('동시 결제 - Pessimistic Lock', () => {
    it('재고 1개, 2명 동시 결제 → 1명 성공, 1명 결제 취소', async () => {
      const { product, option, sku, influencer, campaign } =
        await setupHotelTestData(1);

      // 2명의 고객 생성
      const member1 = await makeMember(dataSource.manager, {
        phone: '01011111111',
      });
      const member2 = await makeMember(dataSource.manager, {
        phone: '01022222222',
      });

      const raw = buildHotelTmpOrderRaw({
        productId: product.id,
        influencerId: influencer.id,
        campaignId: campaign.id,
        hotelOptionId: option.id,
        hotelOptionName: option.name,
      });

      // 각 고객의 TmpOrder 생성
      const tmpOrder1 = await makeTmpOrder(dataSource.manager, {
        productId: product.id,
        memberId: member1.id,
        raw,
      });
      const tmpOrder2 = await makeTmpOrder(dataSource.manager, {
        productId: product.id,
        memberId: member2.id,
        raw,
      });

      const paymentId1 = orderNumberParser.encode(
        [tmpOrder1.id],
        tmpOrder1.createdAt
      );
      const paymentId2 = orderNumberParser.encode(
        [tmpOrder2.id],
        tmpOrder2.createdAt
      );

      // 2명이 동시에 결제 완료 요청
      const [result1, result2] = await Promise.allSettled([
        executeInIsolatedTransaction(svc =>
          svc.handlePaymentComplete({
            paymentId: paymentId1,
            paymentToken: 'test-token-1',
            transactionType: 'PAYMENT',
            txId: 'test-tx-1',
            memberId: member1.id,
          })
        ),
        executeInIsolatedTransaction(svc =>
          svc.handlePaymentComplete({
            paymentId: paymentId2,
            paymentToken: 'test-token-2',
            transactionType: 'PAYMENT',
            txId: 'test-tx-2',
            memberId: member2.id,
          })
        ),
      ]);

      // Assert: 1명 성공, 1명 실패
      const fulfilled = [result1, result2].filter(
        r => r.status === 'fulfilled'
      );
      const rejected = [result1, result2].filter(r => r.status === 'rejected');
      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);

      // Assert: 재고가 정확히 0 (마이너스가 아님)
      const updatedSku = await dataSource.manager.findOneBy(HotelSkuEntity, {
        id: sku.id,
      });
      expect(updatedSku!.quantity).toBe(0);
    });

    it('결제 취소 시 PortOne cancel API 호출됨', async () => {
      const { product, option, influencer, campaign } =
        await setupHotelTestData(1);

      const member1 = await makeMember(dataSource.manager, {
        phone: '01011111111',
      });
      const member2 = await makeMember(dataSource.manager, {
        phone: '01022222222',
      });

      const raw = buildHotelTmpOrderRaw({
        productId: product.id,
        influencerId: influencer.id,
        campaignId: campaign.id,
        hotelOptionId: option.id,
        hotelOptionName: option.name,
      });

      const tmpOrder1 = await makeTmpOrder(dataSource.manager, {
        productId: product.id,
        memberId: member1.id,
        raw,
      });
      const tmpOrder2 = await makeTmpOrder(dataSource.manager, {
        productId: product.id,
        memberId: member2.id,
        raw,
      });

      const paymentId1 = orderNumberParser.encode(
        [tmpOrder1.id],
        tmpOrder1.createdAt
      );
      const paymentId2 = orderNumberParser.encode(
        [tmpOrder2.id],
        tmpOrder2.createdAt
      );

      await Promise.allSettled([
        executeInIsolatedTransaction(svc =>
          svc.handlePaymentComplete({
            paymentId: paymentId1,
            paymentToken: 'test-token-1',
            transactionType: 'PAYMENT',
            txId: 'test-tx-1',
            memberId: member1.id,
          })
        ),
        executeInIsolatedTransaction(svc =>
          svc.handlePaymentComplete({
            paymentId: paymentId2,
            paymentToken: 'test-token-2',
            transactionType: 'PAYMENT',
            txId: 'test-tx-2',
            memberId: member2.id,
          })
        ),
      ]);

      // Assert: PortOne cancel API가 정확히 1회 호출됨
      const cancelCalls = (axios.post as jest.Mock).mock.calls.filter(
        ([url]: [string]) => url.includes('/cancel')
      );
      expect(cancelCalls).toHaveLength(1);
    });

    it('취소된 주문은 Order가 생성되지 않거나 CANCELLED 상태', async () => {
      const { product, option, influencer, campaign } =
        await setupHotelTestData(1);

      const member1 = await makeMember(dataSource.manager, {
        phone: '01011111111',
      });
      const member2 = await makeMember(dataSource.manager, {
        phone: '01022222222',
      });

      const raw = buildHotelTmpOrderRaw({
        productId: product.id,
        influencerId: influencer.id,
        campaignId: campaign.id,
        hotelOptionId: option.id,
        hotelOptionName: option.name,
      });

      const tmpOrder1 = await makeTmpOrder(dataSource.manager, {
        productId: product.id,
        memberId: member1.id,
        raw,
      });
      const tmpOrder2 = await makeTmpOrder(dataSource.manager, {
        productId: product.id,
        memberId: member2.id,
        raw,
      });

      const paymentId1 = orderNumberParser.encode(
        [tmpOrder1.id],
        tmpOrder1.createdAt
      );
      const paymentId2 = orderNumberParser.encode(
        [tmpOrder2.id],
        tmpOrder2.createdAt
      );

      await Promise.allSettled([
        executeInIsolatedTransaction(svc =>
          svc.handlePaymentComplete({
            paymentId: paymentId1,
            paymentToken: 'test-token-1',
            transactionType: 'PAYMENT',
            txId: 'test-tx-1',
            memberId: member1.id,
          })
        ),
        executeInIsolatedTransaction(svc =>
          svc.handlePaymentComplete({
            paymentId: paymentId2,
            paymentToken: 'test-token-2',
            transactionType: 'PAYMENT',
            txId: 'test-tx-2',
            memberId: member2.id,
          })
        ),
      ]);

      // Assert: PAID 상태 Order는 정확히 1개
      const orders = await dataSource.manager.find(OrderEntity);
      const paidOrders = orders.filter(o => o.status === 'PAID');
      expect(paidOrders).toHaveLength(1);

      // Assert: 나머지 Order는 없거나 CANCELLED 상태
      const nonPaidOrders = orders.filter(o => o.status !== 'PAID');
      nonPaidOrders.forEach(order => {
        expect(order.status).toBe('CANCELLED');
      });
    });
  });
});

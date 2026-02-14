import { DataSource, EntityManager } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
  OrderStatusEnum,
  orderNumberParser,
} from '@src/module/backoffice/domain/order/order.entity';
import { TmpOrderEntity } from '@src/module/backoffice/domain/order/tmp-order.entity';
import { PaymentEntity } from '@src/module/backoffice/domain/order/payment.entity';

/**
 * ShopPaymentService - 결제 완료 통합 테스트
 *
 * handlePaymentComplete 메서드의 정상/예외 흐름을 검증합니다.
 *
 * 테스트 패턴:
 * - Setup 데이터는 dataSource.manager(auto-commit)로 저장
 * - 테스트 실행은 executeInIsolatedTransaction 내에서
 * - Assertion은 dataSource.manager로 커밋된 데이터 조회
 */
describe('ShopPaymentService (Integration)', () => {
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
   */
  async function executeInIsolatedTransaction<T>(
    callback: (service: ShopPaymentService) => Promise<T>
  ): Promise<T> {
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
  async function setupHotelTestData(skuQuantity = 10) {
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

  describe('handlePaymentComplete', () => {
    describe('정상 결제', () => {
      it('should create Order with PAID status and delete TmpOrder when hotel payment completed', async () => {
        // Given
        const { product, option, member, influencer, campaign } =
          await setupHotelTestData(10);

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

        // When
        const result = await executeInIsolatedTransaction(svc =>
          svc.handlePaymentComplete({
            paymentId,
            paymentToken: 'test-token',
            transactionType: 'PAYMENT',
            txId: 'test-tx-id',
            memberId: member.id,
          })
        );

        // Then
        expect(result.success).toBe(true);
        expect(result.message).toBe('Payment completed and order created');
        expect(result.orderNumber).toBeDefined();

        const order = await dataSource.manager.findOneBy(OrderEntity, {
          id: tmpOrder.id,
        });
        expect(order).not.toBeNull();
        expect(order!.status).toBe(OrderStatusEnum.PAID);
        expect(order!.memberId).toBe(member.id);
        expect(order!.productId).toBe(product.id);
        expect(order!.totalAmount).toBe(100000);

        const deletedTmpOrder = await dataSource.manager.findOneBy(
          TmpOrderEntity,
          { id: tmpOrder.id }
        );
        expect(deletedTmpOrder).toBeNull();
      });

      it('should save Payment entity after payment confirmed', async () => {
        // Given
        const { product, option, member, influencer, campaign } =
          await setupHotelTestData(10);

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
        const txId = 'test-tx-id-payment';

        // When
        await executeInIsolatedTransaction(svc =>
          svc.handlePaymentComplete({
            paymentId,
            paymentToken: 'test-token',
            transactionType: 'PAYMENT',
            txId,
            memberId: member.id,
          })
        );

        // Then
        const payment = await dataSource.manager.findOneBy(PaymentEntity, {
          impUid: txId,
        });
        expect(payment).not.toBeNull();
        expect(payment!.orderId).toBe(tmpOrder.id);
        expect(payment!.pgProvider).toBe('portone');
        expect(payment!.paidAmount).toBe(100000);
        expect(payment!.nowAmount).toBe(100000);
        expect(payment!.paidAt).toBeDefined();
      });
    });

    describe('예외 처리', () => {
      it('should throw BadRequestException when paymentId is invalid', async () => {
        // Given
        const invalidPaymentId = 'ORD-invalid';

        // When & Then
        await expect(
          executeInIsolatedTransaction(svc =>
            svc.handlePaymentComplete({
              paymentId: invalidPaymentId,
              paymentToken: 'test-token',
              transactionType: 'PAYMENT',
              txId: 'test-tx-id',
              memberId: 1,
            })
          )
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw NotFoundException when TmpOrder does not exist', async () => {
        // Given
        const nonExistentPaymentId = orderNumberParser.encode(
          [999999],
          new Date()
        );

        // When & Then
        await expect(
          executeInIsolatedTransaction(svc =>
            svc.handlePaymentComplete({
              paymentId: nonExistentPaymentId,
              paymentToken: 'test-token',
              transactionType: 'PAYMENT',
              txId: 'test-tx-id',
              memberId: 1,
            })
          )
        ).rejects.toThrow(NotFoundException);
      });

      it('should not create duplicate order when same paymentId called twice', async () => {
        // Given
        const { product, option, member, influencer, campaign } =
          await setupHotelTestData(10);

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

        // When - 첫 번째 호출은 성공
        await executeInIsolatedTransaction(svc =>
          svc.handlePaymentComplete({
            paymentId,
            paymentToken: 'test-token',
            transactionType: 'PAYMENT',
            txId: 'test-tx-id',
            memberId: member.id,
          })
        );

        // When - 두 번째 호출은 TmpOrder가 삭제되어 실패
        await expect(
          executeInIsolatedTransaction(svc =>
            svc.handlePaymentComplete({
              paymentId,
              paymentToken: 'test-token',
              transactionType: 'PAYMENT',
              txId: 'test-tx-id-2',
              memberId: member.id,
            })
          )
        ).rejects.toThrow(NotFoundException);

        // Then - Order는 1개만 존재
        const orders = await dataSource.manager.find(OrderEntity);
        expect(orders).toHaveLength(1);
        expect(orders[0].status).toBe(OrderStatusEnum.PAID);
      });
    });
  });
});

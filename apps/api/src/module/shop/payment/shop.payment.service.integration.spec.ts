import { DataSource, EntityManager } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ShopPaymentService } from './shop.payment.service';
import { OrderHistoryService } from '@src/module/backoffice/order/order-history.service';
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
    const orderHistoryService = new OrderHistoryService(rp);
    return new ShopPaymentService(rp, orderHistoryService);
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
    describe('GIVEN: 유효한 호텔 결제 데이터(SKU 재고 10)와 TmpOrder가 존재할 때', () => {
      let product: Awaited<ReturnType<typeof setupHotelTestData>>['product'];
      let option: Awaited<ReturnType<typeof setupHotelTestData>>['option'];
      let member: Awaited<ReturnType<typeof setupHotelTestData>>['member'];
      let tmpOrder: TmpOrderEntity;
      let paymentId: string;

      beforeEach(async () => {
        const data = await setupHotelTestData(10);
        product = data.product;
        option = data.option;
        member = data.member;

        tmpOrder = await makeTmpOrder(dataSource.manager, {
          productId: product.id,
          memberId: member.id,
          raw: buildHotelTmpOrderRaw({
            productId: product.id,
            influencerId: data.influencer.id,
            campaignId: data.campaign.id,
            hotelOptionId: option.id,
            hotelOptionName: option.name,
          }),
        });

        paymentId = orderNumberParser.encode([tmpOrder.id], tmpOrder.createdAt);
      });

      describe('WHEN: handlePaymentComplete를 호출하면', () => {
        it('THEN: PAID 상태의 Order를 생성하고 TmpOrder를 삭제한다', async () => {
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

        it('THEN: Payment 엔티티를 저장한다', async () => {
          // When
          const txId = 'test-tx-id-payment';
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
    });

    describe('GIVEN: 파싱 불가능한 paymentId일 때', () => {
      describe('WHEN: handlePaymentComplete를 호출하면', () => {
        it('THEN: BadRequestException을 던진다', async () => {
          const invalidPaymentId = 'ORD-invalid';

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
      });
    });

    describe('GIVEN: 존재하지 않는 TmpOrder ID일 때', () => {
      describe('WHEN: handlePaymentComplete를 호출하면', () => {
        it('THEN: NotFoundException을 던진다', async () => {
          const nonExistentPaymentId = orderNumberParser.encode(
            [999999],
            new Date()
          );

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
      });
    });

    describe('GIVEN: 이미 1차 결제가 완료된 상태일 때', () => {
      describe('WHEN: 동일 paymentId로 2차 호출하면', () => {
        it('THEN: NotFoundException을 던지고 Order는 1개만 존재한다', async () => {
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
});

import { DataSource, EntityManager } from 'typeorm';
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
  orderNumberParser,
} from '@src/module/backoffice/domain/order/order.entity';
import { HotelSkuEntity } from '@src/module/backoffice/domain/product/hotel-sku.entity';
import axios from 'axios';

/**
 * ShopPaymentService - 재고 동시성 통합 테스트
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
    const orderHistoryService = new OrderHistoryService(rp);
    return new ShopPaymentService(rp, orderHistoryService);
  }

  /**
   * 별도 DB 커넥션(QueryRunner)에서 격리된 트랜잭션으로 콜백 실행
   *
   * 동시성 테스트에서 각 결제 요청이 독립된 트랜잭션 컨텍스트를 가지도록 함.
   * SELECT FOR UPDATE 락이 서로 다른 커넥션 간에 올바르게 작동하는지 검증.
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

  describe('deductHotelSkuQuantity', () => {
    describe('GIVEN: SKU 재고 1과 TmpOrder가 존재할 때', () => {
      describe('WHEN: handlePaymentComplete를 호출하면', () => {
        it('THEN: HotelSku quantity를 1 차감한다', async () => {
          // Given
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

          // When
          await executeInIsolatedTransaction(svc =>
            svc.handlePaymentComplete({
              paymentId,
              paymentToken: 'test-token',
              transactionType: 'PAYMENT',
              txId: 'test-tx-id',
              memberId: member.id,
            })
          );

          // Then
          const updatedSku = await dataSource.manager.findOneBy(
            HotelSkuEntity,
            {
              id: sku.id,
            }
          );
          expect(updatedSku!.quantity).toBe(0);
        });
      });
    });

    describe('GIVEN: SKU 재고 0과 TmpOrder가 존재할 때', () => {
      describe('WHEN: handlePaymentComplete를 호출하면', () => {
        it('THEN: 에러를 던지고 Order를 생성하지 않는다', async () => {
          // Given
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

          // When & Then
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

          // Then
          const orders = await dataSource.manager.find(OrderEntity);
          expect(orders).toHaveLength(0);
        });
      });
    });

    describe('GIVEN: SKU 재고 1, 2명이 동시 결제할 때', () => {
      let skuId: number;
      let paymentId1: string;
      let paymentId2: string;
      let member1Id: number;
      let member2Id: number;

      beforeEach(async () => {
        const { product, option, sku, influencer, campaign } =
          await setupHotelTestData(1);
        skuId = sku.id;

        const member1 = await makeMember(dataSource.manager, {
          phone: '01011111111',
        });
        const member2 = await makeMember(dataSource.manager, {
          phone: '01022222222',
        });
        member1Id = member1.id;
        member2Id = member2.id;

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

        paymentId1 = orderNumberParser.encode(
          [tmpOrder1.id],
          tmpOrder1.createdAt
        );
        paymentId2 = orderNumberParser.encode(
          [tmpOrder2.id],
          tmpOrder2.createdAt
        );
      });

      describe('WHEN: 2건을 동시 실행하면', () => {
        let results: PromiseSettledResult<unknown>[];

        beforeEach(async () => {
          results = await Promise.allSettled([
            executeInIsolatedTransaction(svc =>
              svc.handlePaymentComplete({
                paymentId: paymentId1,
                paymentToken: 'test-token-1',
                transactionType: 'PAYMENT',
                txId: 'test-tx-1',
                memberId: member1Id,
              })
            ),
            executeInIsolatedTransaction(svc =>
              svc.handlePaymentComplete({
                paymentId: paymentId2,
                paymentToken: 'test-token-2',
                transactionType: 'PAYMENT',
                txId: 'test-tx-2',
                memberId: member2Id,
              })
            ),
          ]);
        });

        it('THEN: 1건 성공, 1건 실패한다', async () => {
          const fulfilled = results.filter(r => r.status === 'fulfilled');
          const rejected = results.filter(r => r.status === 'rejected');
          expect(fulfilled).toHaveLength(1);
          expect(rejected).toHaveLength(1);

          const updatedSku = await dataSource.manager.findOneBy(
            HotelSkuEntity,
            {
              id: skuId,
            }
          );
          expect(updatedSku!.quantity).toBe(0);
        });

        it('THEN: PortOne 취소 API를 호출한다', () => {
          const cancelCalls = (axios.post as jest.Mock).mock.calls.filter(
            ([url]: [string]) => url.includes('/cancel')
          );
          expect(cancelCalls).toHaveLength(1);
        });

        it('THEN: 실패한 결제는 CANCELLED 상태이다', async () => {
          const orders = await dataSource.manager.find(OrderEntity);
          const paidOrders = orders.filter(o => o.status === 'PAID');
          expect(paidOrders).toHaveLength(1);

          const nonPaidOrders = orders.filter(o => o.status !== 'PAID');
          nonPaidOrders.forEach(order => {
            expect(order.status).toBe('CANCELLED');
          });
        });
      });
    });

    describe('GIVEN: SKU 재고 2, 3명이 동시 결제할 때', () => {
      describe('WHEN: 3건을 동시 실행하면', () => {
        it('THEN: 2건 성공, 1건 실패, quantity=0', async () => {
          // Given
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
            quantity: 2,
          });
          const influencer = await makeInfluencer(em);
          const campaign = await makeCampaign(em);
          const member1 = await makeMember(em, { phone: '01011111111' });
          const member2 = await makeMember(em, { phone: '01022222222' });
          const member3 = await makeMember(em, { phone: '01033333333' });

          const raw = buildHotelTmpOrderRaw({
            productId: product.id,
            influencerId: influencer.id,
            campaignId: campaign.id,
            hotelOptionId: option.id,
            hotelOptionName: option.name,
          });

          const tmpOrder1 = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member1.id,
            raw,
          });
          const tmpOrder2 = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member2.id,
            raw,
          });
          const tmpOrder3 = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member3.id,
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
          const paymentId3 = orderNumberParser.encode(
            [tmpOrder3.id],
            tmpOrder3.createdAt
          );

          // When
          const threeResults = await Promise.allSettled([
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
            executeInIsolatedTransaction(svc =>
              svc.handlePaymentComplete({
                paymentId: paymentId3,
                paymentToken: 'test-token-3',
                transactionType: 'PAYMENT',
                txId: 'test-tx-3',
                memberId: member3.id,
              })
            ),
          ]);

          // Then
          const fulfilled = threeResults.filter(r => r.status === 'fulfilled');
          const rejected = threeResults.filter(r => r.status === 'rejected');
          expect(fulfilled).toHaveLength(2);
          expect(rejected).toHaveLength(1);

          const updatedSku = await em.findOneBy(HotelSkuEntity, {
            id: sku.id,
          });
          expect(updatedSku!.quantity).toBe(0);
        });
      });
    });

    describe('GIVEN: SKU 재고 0이고 취소 API가 실패할 때', () => {
      describe('WHEN: handlePaymentComplete를 호출하면', () => {
        it('THEN: 취소 API 실패 에러를 전파한다', async () => {
          // Given
          const em = dataSource.manager;
          const brand = await makeBrand(em);
          const product = await makeHotelProduct(em, { brandId: brand.id });
          const option = await makeHotelOption(em, {
            productId: product.id,
            name: 'Standard Room',
            priceByDate: { '2026-03-01': 100000 },
          });
          await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-01',
            quantity: 0,
          });
          const member = await makeMember(em);
          const influencer = await makeInfluencer(em);
          const campaign = await makeCampaign(em);

          const tmpOrder = await makeTmpOrder(em, {
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

          // Override cancel mock to throw an error
          const postSpy = axios.post as jest.Mock;
          const originalImpl = postSpy.getMockImplementation()!;
          postSpy.mockImplementation(
            async (url: string, data?: unknown, config?: unknown) => {
              if (url.includes('/cancel')) {
                throw {
                  response: {
                    data: {
                      type: 'CANCEL_FAILED',
                      message: '취소 API 실패',
                    },
                  },
                };
              }
              return originalImpl(url, data, config);
            }
          );

          // When & Then
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
          ).rejects.toThrow('취소 API 실패');
        });
      });
    });

    describe('GIVEN: 멀티 날짜 주문에서 1개 날짜만 재고 부족일 때', () => {
      describe('WHEN: handlePaymentComplete를 호출하면', () => {
        it('THEN: 전체 결제 실패, 취소 API 호출, SKU 롤백', async () => {
          // Given - 2개 날짜 SKU: 3/1은 재고 1, 3/2는 재고 0
          const em = dataSource.manager;
          const brand = await makeBrand(em);
          const product = await makeHotelProduct(em, { brandId: brand.id });
          const option = await makeHotelOption(em, {
            productId: product.id,
            name: 'Standard Room',
            priceByDate: { '2026-03-01': 100000, '2026-03-02': 100000 },
          });
          const sku1 = await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-01',
            quantity: 1,
          });
          await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-02',
            quantity: 0,
          });
          const member = await makeMember(em);
          const influencer = await makeInfluencer(em);
          const campaign = await makeCampaign(em);

          const tmpOrder = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member.id,
            raw: buildHotelTmpOrderRaw({
              productId: product.id,
              influencerId: influencer.id,
              campaignId: campaign.id,
              hotelOptionId: option.id,
              hotelOptionName: option.name,
              checkInDate: '2026-03-01',
              checkOutDate: '2026-03-03',
              priceByDate: { '2026-03-01': 100000, '2026-03-02': 100000 },
              totalAmount: 200000,
            }),
          });

          const paymentId = orderNumberParser.encode(
            [tmpOrder.id],
            tmpOrder.createdAt
          );

          // When & Then
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
          ).rejects.toThrow('재고 부족');

          // Then - 결제 취소 API 호출됨
          const cancelCalls = (axios.post as jest.Mock).mock.calls.filter(
            ([url]: [string]) => url.includes('/cancel')
          );
          expect(cancelCalls).toHaveLength(1);

          // Then - quantity=1인 SKU는 차감되지 않음 (트랜잭션 롤백)
          const unchangedSku = await em.findOneBy(HotelSkuEntity, {
            id: sku1.id,
          });
          expect(unchangedSku!.quantity).toBe(1);

          // Then - Order 생성되지 않음
          const orders = await em.find(OrderEntity);
          expect(orders).toHaveLength(0);
        });
      });
    });

    describe('GIVEN: 주문 날짜에 SKU가 존재하지 않을 때', () => {
      describe('WHEN: handlePaymentComplete를 호출하면', () => {
        it('THEN: SKU not found 에러, 취소 API 호출', async () => {
          // Given - SKU가 존재하지 않는 날짜로 tmpOrder 생성
          const em = dataSource.manager;
          const brand = await makeBrand(em);
          const product = await makeHotelProduct(em, { brandId: brand.id });
          const option = await makeHotelOption(em, {
            productId: product.id,
            name: 'Standard Room',
            priceByDate: { '2026-04-01': 100000 },
          });
          // SKU는 3/1에만 생성, 하지만 주문은 4/1로
          await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-01',
            quantity: 5,
          });
          const member = await makeMember(em);
          const influencer = await makeInfluencer(em);
          const campaign = await makeCampaign(em);

          const tmpOrder = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member.id,
            raw: buildHotelTmpOrderRaw({
              productId: product.id,
              influencerId: influencer.id,
              campaignId: campaign.id,
              hotelOptionId: option.id,
              hotelOptionName: option.name,
              checkInDate: '2026-04-01',
              checkOutDate: '2026-04-02',
              priceByDate: { '2026-04-01': 100000 },
            }),
          });

          const paymentId = orderNumberParser.encode(
            [tmpOrder.id],
            tmpOrder.createdAt
          );

          // When & Then
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
          ).rejects.toThrow('SKU not found: expected 1 SKUs but found 0');

          // Then - 결제 취소 API 호출됨
          const cancelCalls = (axios.post as jest.Mock).mock.calls.filter(
            ([url]: [string]) => url.includes('/cancel')
          );
          expect(cancelCalls).toHaveLength(1);
        });
      });
    });

    describe('GIVEN: 3개 날짜(재고 충분) 멀티 날짜 주문일 때', () => {
      describe('WHEN: handlePaymentComplete를 호출하면', () => {
        it('THEN: 3개 SKU 모두 1씩 차감한다', async () => {
          // Given - 3개 날짜 SKU 생성 (재고 충분)
          const em = dataSource.manager;
          const brand = await makeBrand(em);
          const product = await makeHotelProduct(em, { brandId: brand.id });
          const option = await makeHotelOption(em, {
            productId: product.id,
            name: 'Standard Room',
            priceByDate: {
              '2026-03-01': 100000,
              '2026-03-02': 100000,
              '2026-03-03': 100000,
            },
          });
          const sku1 = await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-01',
            quantity: 5,
          });
          const sku2 = await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-02',
            quantity: 5,
          });
          const sku3 = await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-03',
            quantity: 5,
          });
          const member = await makeMember(em);
          const influencer = await makeInfluencer(em);
          const campaign = await makeCampaign(em);

          const tmpOrder = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member.id,
            raw: buildHotelTmpOrderRaw({
              productId: product.id,
              influencerId: influencer.id,
              campaignId: campaign.id,
              hotelOptionId: option.id,
              hotelOptionName: option.name,
              checkInDate: '2026-03-01',
              checkOutDate: '2026-03-04',
              priceByDate: {
                '2026-03-01': 100000,
                '2026-03-02': 100000,
                '2026-03-03': 100000,
              },
              totalAmount: 300000,
            }),
          });

          const paymentId = orderNumberParser.encode(
            [tmpOrder.id],
            tmpOrder.createdAt
          );

          // When
          await executeInIsolatedTransaction(svc =>
            svc.handlePaymentComplete({
              paymentId,
              paymentToken: 'test-token',
              transactionType: 'PAYMENT',
              txId: 'test-tx-id',
              memberId: member.id,
            })
          );

          // Then - 3개 날짜 모두 재고 차감됨
          const updatedSku1 = await em.findOneBy(HotelSkuEntity, {
            id: sku1.id,
          });
          const updatedSku2 = await em.findOneBy(HotelSkuEntity, {
            id: sku2.id,
          });
          const updatedSku3 = await em.findOneBy(HotelSkuEntity, {
            id: sku3.id,
          });
          expect(updatedSku1!.quantity).toBe(4);
          expect(updatedSku2!.quantity).toBe(4);
          expect(updatedSku3!.quantity).toBe(4);
        });
      });
    });
  });

  describe('restoreHotelSkuQuantity', () => {
    describe('GIVEN: SKU 재고 0 (결제로 차감된 상태)일 때', () => {
      describe('WHEN: restoreHotelSkuQuantity를 호출하면', () => {
        it('THEN: HotelSku quantity를 1 복구한다', async () => {
          // Given - 결제 완료로 재고 0 상태
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

          // 결제 → 재고 차감 (qty 1→0)
          await executeInIsolatedTransaction(svc =>
            svc.handlePaymentComplete({
              paymentId,
              paymentToken: 'test-token',
              transactionType: 'PAYMENT',
              txId: 'test-tx-id',
              memberId: member.id,
            })
          );

          const skuAfterDeduct = await dataSource.manager.findOneBy(
            HotelSkuEntity,
            { id: sku.id }
          );
          expect(skuAfterDeduct!.quantity).toBe(0);

          // When - 재고 복구
          await executeInIsolatedTransaction(svc =>
            svc.restoreHotelSkuQuantity(product.id, ['2026-03-01'])
          );

          // Then
          const skuAfterRestore = await dataSource.manager.findOneBy(
            HotelSkuEntity,
            { id: sku.id }
          );
          expect(skuAfterRestore!.quantity).toBe(1);
        });
      });
    });

    describe('GIVEN: 3일 멀티 날짜 결제 후 재고 차감 상태일 때', () => {
      describe('WHEN: restoreHotelSkuQuantity를 3일치 호출하면', () => {
        it('THEN: 3개 SKU 모두 quantity를 1씩 복구한다', async () => {
          // Given - 3개 날짜 SKU 생성 + 결제로 차감
          const em = dataSource.manager;
          const brand = await makeBrand(em);
          const product = await makeHotelProduct(em, { brandId: brand.id });
          const option = await makeHotelOption(em, {
            productId: product.id,
            name: 'Standard Room',
            priceByDate: {
              '2026-03-01': 100000,
              '2026-03-02': 100000,
              '2026-03-03': 100000,
            },
          });
          const sku1 = await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-01',
            quantity: 5,
          });
          const sku2 = await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-02',
            quantity: 5,
          });
          const sku3 = await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-03',
            quantity: 5,
          });
          const member = await makeMember(em);
          const influencer = await makeInfluencer(em);
          const campaign = await makeCampaign(em);

          const tmpOrder = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member.id,
            raw: buildHotelTmpOrderRaw({
              productId: product.id,
              influencerId: influencer.id,
              campaignId: campaign.id,
              hotelOptionId: option.id,
              hotelOptionName: option.name,
              checkInDate: '2026-03-01',
              checkOutDate: '2026-03-04',
              priceByDate: {
                '2026-03-01': 100000,
                '2026-03-02': 100000,
                '2026-03-03': 100000,
              },
              totalAmount: 300000,
            }),
          });

          const paymentId = orderNumberParser.encode(
            [tmpOrder.id],
            tmpOrder.createdAt
          );

          // 결제 → 3일 재고 차감 (각 5→4)
          await executeInIsolatedTransaction(svc =>
            svc.handlePaymentComplete({
              paymentId,
              paymentToken: 'test-token',
              transactionType: 'PAYMENT',
              txId: 'test-tx-id',
              memberId: member.id,
            })
          );

          // When - 3일 재고 복구
          await executeInIsolatedTransaction(svc =>
            svc.restoreHotelSkuQuantity(product.id, [
              '2026-03-01',
              '2026-03-02',
              '2026-03-03',
            ])
          );

          // Then - 3일 모두 원래 수량 복구
          const updatedSku1 = await em.findOneBy(HotelSkuEntity, {
            id: sku1.id,
          });
          const updatedSku2 = await em.findOneBy(HotelSkuEntity, {
            id: sku2.id,
          });
          const updatedSku3 = await em.findOneBy(HotelSkuEntity, {
            id: sku3.id,
          });
          expect(updatedSku1!.quantity).toBe(5);
          expect(updatedSku2!.quantity).toBe(5);
          expect(updatedSku3!.quantity).toBe(5);
        });
      });
    });

    describe('GIVEN: SKU 재고 0, 취소 1건 + 새 결제 1건 동시 발생 시', () => {
      describe('WHEN: restoreHotelSkuQuantity와 handlePaymentComplete를 동시 실행하면', () => {
        it('THEN: 둘 다 성공하고 최종 quantity가 정확하다', async () => {
          // Given - 결제 완료로 재고 1→0 상태
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
            quantity: 1,
          });
          const member1 = await makeMember(em, { phone: '01011111111' });
          const member2 = await makeMember(em, { phone: '01022222222' });
          const influencer = await makeInfluencer(em);
          const campaign = await makeCampaign(em);

          const raw = buildHotelTmpOrderRaw({
            productId: product.id,
            influencerId: influencer.id,
            campaignId: campaign.id,
            hotelOptionId: option.id,
            hotelOptionName: option.name,
          });

          // member1 결제 → 재고 1→0
          const tmpOrder1 = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member1.id,
            raw,
          });
          const paymentId1 = orderNumberParser.encode(
            [tmpOrder1.id],
            tmpOrder1.createdAt
          );

          await executeInIsolatedTransaction(svc =>
            svc.handlePaymentComplete({
              paymentId: paymentId1,
              paymentToken: 'test-token-1',
              transactionType: 'PAYMENT',
              txId: 'test-tx-1',
              memberId: member1.id,
            })
          );

          const skuAfterDeduct = await em.findOneBy(HotelSkuEntity, {
            id: sku.id,
          });
          expect(skuAfterDeduct!.quantity).toBe(0);

          // member2 새 결제 준비
          const tmpOrder2 = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member2.id,
            raw,
          });
          const paymentId2 = orderNumberParser.encode(
            [tmpOrder2.id],
            tmpOrder2.createdAt
          );

          // When - 취소(복구)와 새 결제 동시 실행
          const [restoreResult, paymentResult] = await Promise.allSettled([
            executeInIsolatedTransaction(svc =>
              svc.restoreHotelSkuQuantity(product.id, ['2026-03-01'])
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

          // Then - 복구는 항상 성공
          expect(restoreResult.status).toBe('fulfilled');

          // Then - 순서에 따라:
          //   복구 먼저 → qty 0→1 → 결제 성공 → qty 1→0 (최종 0)
          //   결제 먼저 → qty 0이라 실패 → 복구 → qty 0→1 (최종 1)
          const finalSku = await em.findOneBy(HotelSkuEntity, {
            id: sku.id,
          });

          if (paymentResult.status === 'fulfilled') {
            // 복구 먼저 실행된 경우: qty 0→1→0
            expect(finalSku!.quantity).toBe(0);
          } else {
            // 결제 먼저 실행된 경우: qty 0(결제실패)→1
            expect(finalSku!.quantity).toBe(1);
          }
        });
      });
    });
  });

  describe('재고 공유 조건', () => {
    describe('GIVEN: 같은 날짜, 같은 숙소, 같은 옵션 (재고 1)', () => {
      describe('WHEN: 2명이 동시 결제하면', () => {
        it('THEN: 재고 공유하여 1명만 성공', async () => {
          // Given
          const em = dataSource.manager;
          const brand = await makeBrand(em);
          const product = await makeHotelProduct(em, { brandId: brand.id });
          const option = await makeHotelOption(em, {
            productId: product.id,
            name: 'Standard Room',
            priceByDate: { '2026-03-01': 100000 },
          });
          await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-01',
            quantity: 1,
          });

          const influencer = await makeInfluencer(em);
          const campaign = await makeCampaign(em);
          const member1 = await makeMember(em, { phone: '01099999991' });
          const member2 = await makeMember(em, { phone: '01099999992' });

          const raw = buildHotelTmpOrderRaw({
            productId: product.id,
            influencerId: influencer.id,
            campaignId: campaign.id,
            hotelOptionId: option.id,
            hotelOptionName: option.name,
          });

          const tmpOrder1 = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member1.id,
            raw,
          });
          const tmpOrder2 = await makeTmpOrder(em, {
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

          // When
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

          // Then
          const fulfilled = [result1, result2].filter(
            r => r.status === 'fulfilled'
          );
          const rejected = [result1, result2].filter(
            r => r.status === 'rejected'
          );
          expect(fulfilled).toHaveLength(1);
          expect(rejected).toHaveLength(1);
        });
      });
    });

    describe('GIVEN: 같은 날짜, 같은 숙소, 다른 옵션 (재고 1)', () => {
      describe('WHEN: 2명이 동시 결제하면', () => {
        it('THEN: 재고 공유하여 1명만 성공', async () => {
          // Given
          const em = dataSource.manager;
          const brand = await makeBrand(em);
          const product = await makeHotelProduct(em, { brandId: brand.id });
          const option1 = await makeHotelOption(em, {
            productId: product.id,
            name: 'Standard Room',
            priceByDate: { '2026-03-01': 100000 },
          });
          const option2 = await makeHotelOption(em, {
            productId: product.id,
            name: 'Deluxe Room',
            priceByDate: { '2026-03-01': 150000 },
          });
          await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-01',
            quantity: 1,
          });

          const influencer = await makeInfluencer(em);
          const campaign = await makeCampaign(em);
          const member1 = await makeMember(em, { phone: '01099999991' });
          const member2 = await makeMember(em, { phone: '01099999992' });

          const raw1 = buildHotelTmpOrderRaw({
            productId: product.id,
            influencerId: influencer.id,
            campaignId: campaign.id,
            hotelOptionId: option1.id,
            hotelOptionName: option1.name,
          });
          const raw2 = buildHotelTmpOrderRaw({
            productId: product.id,
            influencerId: influencer.id,
            campaignId: campaign.id,
            hotelOptionId: option2.id,
            hotelOptionName: option2.name,
            priceByDate: { '2026-03-01': 150000 },
          });

          const tmpOrder1 = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member1.id,
            raw: raw1,
          });
          const tmpOrder2 = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member2.id,
            raw: raw2,
          });

          const paymentId1 = orderNumberParser.encode(
            [tmpOrder1.id],
            tmpOrder1.createdAt
          );
          const paymentId2 = orderNumberParser.encode(
            [tmpOrder2.id],
            tmpOrder2.createdAt
          );

          // When
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

          // Then
          const fulfilled = [result1, result2].filter(
            r => r.status === 'fulfilled'
          );
          const rejected = [result1, result2].filter(
            r => r.status === 'rejected'
          );
          expect(fulfilled).toHaveLength(1);
          expect(rejected).toHaveLength(1);
        });
      });
    });

    describe('GIVEN: 다른 날짜, 같은 숙소, 같은 옵션 (각 재고 1)', () => {
      describe('WHEN: 2명이 동시 결제하면', () => {
        it('THEN: 재고 비공유로 둘 다 성공', async () => {
          // Given
          const em = dataSource.manager;
          const brand = await makeBrand(em);
          const product = await makeHotelProduct(em, { brandId: brand.id });
          const option = await makeHotelOption(em, {
            productId: product.id,
            name: 'Standard Room',
            priceByDate: { '2026-03-01': 100000, '2026-03-02': 100000 },
          });
          await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-01',
            quantity: 1,
          });
          await makeHotelSku(em, {
            productId: product.id,
            date: '2026-03-02',
            quantity: 1,
          });

          const influencer = await makeInfluencer(em);
          const campaign = await makeCampaign(em);
          const member1 = await makeMember(em, { phone: '01099999991' });
          const member2 = await makeMember(em, { phone: '01099999992' });

          const raw1 = buildHotelTmpOrderRaw({
            productId: product.id,
            influencerId: influencer.id,
            campaignId: campaign.id,
            hotelOptionId: option.id,
            hotelOptionName: option.name,
            checkInDate: '2026-03-01',
            checkOutDate: '2026-03-02',
            priceByDate: { '2026-03-01': 100000 },
          });
          const raw2 = buildHotelTmpOrderRaw({
            productId: product.id,
            influencerId: influencer.id,
            campaignId: campaign.id,
            hotelOptionId: option.id,
            hotelOptionName: option.name,
            checkInDate: '2026-03-02',
            checkOutDate: '2026-03-03',
            priceByDate: { '2026-03-02': 100000 },
          });

          const tmpOrder1 = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member1.id,
            raw: raw1,
          });
          const tmpOrder2 = await makeTmpOrder(em, {
            productId: product.id,
            memberId: member2.id,
            raw: raw2,
          });

          const paymentId1 = orderNumberParser.encode(
            [tmpOrder1.id],
            tmpOrder1.createdAt
          );
          const paymentId2 = orderNumberParser.encode(
            [tmpOrder2.id],
            tmpOrder2.createdAt
          );

          // When
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

          // Then
          expect(result1.status).toBe('fulfilled');
          expect(result2.status).toBe('fulfilled');
        });
      });
    });

    describe('GIVEN: 같은 날짜, 다른 숙소, 같은 옵션명 (각 재고 1)', () => {
      describe('WHEN: 2명이 동시 결제하면', () => {
        it('THEN: 재고 비공유로 둘 다 성공', async () => {
          // Given
          const em = dataSource.manager;
          const brand = await makeBrand(em);
          const product1 = await makeHotelProduct(em, { brandId: brand.id });
          const product2 = await makeHotelProduct(em, { brandId: brand.id });
          const option1 = await makeHotelOption(em, {
            productId: product1.id,
            name: 'Standard Room',
            priceByDate: { '2026-03-01': 100000 },
          });
          const option2 = await makeHotelOption(em, {
            productId: product2.id,
            name: 'Standard Room',
            priceByDate: { '2026-03-01': 100000 },
          });
          await makeHotelSku(em, {
            productId: product1.id,
            date: '2026-03-01',
            quantity: 1,
          });
          await makeHotelSku(em, {
            productId: product2.id,
            date: '2026-03-01',
            quantity: 1,
          });

          const influencer = await makeInfluencer(em);
          const campaign = await makeCampaign(em);
          const member1 = await makeMember(em, { phone: '01099999991' });
          const member2 = await makeMember(em, { phone: '01099999992' });

          const raw1 = buildHotelTmpOrderRaw({
            productId: product1.id,
            influencerId: influencer.id,
            campaignId: campaign.id,
            hotelOptionId: option1.id,
            hotelOptionName: option1.name,
          });
          const raw2 = buildHotelTmpOrderRaw({
            productId: product2.id,
            influencerId: influencer.id,
            campaignId: campaign.id,
            hotelOptionId: option2.id,
            hotelOptionName: option2.name,
          });

          const tmpOrder1 = await makeTmpOrder(em, {
            productId: product1.id,
            memberId: member1.id,
            raw: raw1,
          });
          const tmpOrder2 = await makeTmpOrder(em, {
            productId: product2.id,
            memberId: member2.id,
            raw: raw2,
          });

          const paymentId1 = orderNumberParser.encode(
            [tmpOrder1.id],
            tmpOrder1.createdAt
          );
          const paymentId2 = orderNumberParser.encode(
            [tmpOrder2.id],
            tmpOrder2.createdAt
          );

          // When
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

          // Then
          expect(result1.status).toBe('fulfilled');
          expect(result2.status).toBe('fulfilled');
        });
      });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ShopPaymentService } from './shop.payment.service';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import {
  getTestingEntityManager,
  releaseTestContext,
  TestContext,
} from '@src/test-utils/test-helpers';
import { createTestRepositoryProvider } from '@src/test-utils/mock-repository-provider';
import { destroyTestDataSource } from '@src/test-utils/test-datasource';
import {
  setupPortoneMocks,
  clearPortoneMocks,
} from '@src/test-utils/axios-mock';
// import { makeBrand, makeProduct, makeMember, makeTmpOrder } from '@src/test-utils/entity-makers';
// import { orderNumberParser } from '@src/module/backoffice/domain/order/order.entity';

describe('ShopPaymentService (Integration)', () => {
  let service: ShopPaymentService;
  let testCtx: TestContext;
  let repositoryProvider: RepositoryProvider;

  beforeEach(async () => {
    // 이 테스트를 위한 새 트랜잭션 시작
    testCtx = await getTestingEntityManager();
    repositoryProvider = createTestRepositoryProvider(testCtx.entityManager);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopPaymentService,
        { provide: RepositoryProvider, useValue: repositoryProvider },
      ],
    }).compile();

    service = module.get<ShopPaymentService>(ShopPaymentService);
    setupPortoneMocks();
  });

  afterEach(async () => {
    clearPortoneMocks();
    await releaseTestContext(testCtx); // 트랜잭션 rollback
  });

  afterAll(async () => {
    await destroyTestDataSource();
  });

  describe('handlePaymentComplete', () => {
    it('기본 테스트 케이스 (placeholder)', async () => {
      // TODO: entity maker 준비 후 실제 테스트 구현
      // 1. Setup: 테스트 트랜잭션에 entity 생성
      // const brand = await makeBrand(testCtx.entityManager);
      // const product = await makeProduct(testCtx.entityManager, { brandId: brand.id });
      // const member = await makeMember(testCtx.entityManager);
      // const tmpOrder = await makeTmpOrder(testCtx.entityManager, { productId: product.id });

      // 2. paymentId 생성
      // const paymentId = orderNumberParser.encode([tmpOrder.id], tmpOrder.createdAt);

      // 3. Act
      // const result = await service.handlePaymentComplete({
      //   paymentId,
      //   paymentToken: 'test-token',
      //   transactionType: 'PAYMENT',
      //   txId: 'test-tx-id',
      //   memberId: member.id,
      // });

      // 4. Assert
      // expect(result.success).toBe(true);

      expect(true).toBe(true); // entity maker 준비될 때까지 placeholder
    });
  });
});

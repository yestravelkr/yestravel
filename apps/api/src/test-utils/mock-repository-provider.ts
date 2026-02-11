import { EntityManager } from 'typeorm';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';

/**
 * 테스트 EntityManager를 감싸는 TransactionService 생성
 * 테스트 EntityManager는 rollback될 트랜잭션 내부에 있음
 */
export function createTestTransactionService(
  testEntityManager: EntityManager
): TransactionService {
  const txService = new TransactionService();
  txService.startTransaction(testEntityManager);
  return txService;
}

/**
 * 테스트 EntityManager에 연결된 RepositoryProvider 생성
 * 모든 repository getter가 테스트 트랜잭션을 사용함
 */
export function createTestRepositoryProvider(
  testEntityManager: EntityManager
): RepositoryProvider {
  const txService = createTestTransactionService(testEntityManager);
  return new RepositoryProvider(txService);
}

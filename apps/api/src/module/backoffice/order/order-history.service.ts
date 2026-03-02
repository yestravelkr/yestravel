/**
 * OrderHistoryService - 주문 이력 기록 서비스
 *
 * 주문 상태 변경, 클레임 처리 등 이벤트 발생 시
 * 이력을 기록하는 헬퍼 서비스입니다.
 */

import { Injectable, Logger } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { OrderHistoryEntity } from '@src/module/backoffice/domain/order/order-history.entity';
import type { OrderStatusEnumType } from '@src/module/backoffice/domain/order/order-status';
import type { OrderHistoryAction } from '@src/module/backoffice/domain/order/order-history-action';
import type { OrderHistoryMetadata } from '@src/module/backoffice/domain/order/order-history-metadata.type';

interface RecordParams {
  orderId: number;
  previousStatus: OrderStatusEnumType | null;
  newStatus: OrderStatusEnumType;
  actorType: 'SYSTEM' | 'USER' | 'ADMIN';
  actorId?: number | null;
  actorName?: string | null;
  action: OrderHistoryAction;
  description?: string | null;
  claimId?: number | null;
  optionId?: number | null;
  optionName?: string | null;
  metadata?: OrderHistoryMetadata | null;
}

@Injectable()
export class OrderHistoryService {
  private readonly logger = new Logger(OrderHistoryService.name);

  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  /**
   * 주문 이력 기록
   *
   * 기록 실패가 기존 비즈니스 로직에 영향을 주지 않도록
   * 에러 발생 시 로깅만 수행합니다.
   */
  async record(params: RecordParams): Promise<OrderHistoryEntity | null> {
    try {
      const history = new OrderHistoryEntity();
      history.orderId = params.orderId;
      history.previousStatus = params.previousStatus ?? null;
      history.newStatus = params.newStatus;
      history.actorType = params.actorType;
      history.actorId = params.actorId ?? null;
      history.actorName = params.actorName ?? null;
      history.action = params.action;
      history.description = params.description ?? null;
      history.claimId = params.claimId ?? null;
      history.optionId = params.optionId ?? null;
      history.optionName = params.optionName ?? null;
      history.metadata = params.metadata ?? null;

      return await this.repositoryProvider.OrderHistoryRepository.save(history);
    } catch (error) {
      this.logger.error(
        `주문 이력 기록 실패 - orderId=${params.orderId}, action=${params.action}`,
        error
      );
      return null;
    }
  }

  /**
   * 주문 ID로 이력 조회 (시간순 ASC)
   */
  async findByOrderId(orderId: number): Promise<OrderHistoryEntity[]> {
    return this.repositoryProvider.OrderHistoryRepository.find({
      where: { orderId },
      order: { createdAt: 'ASC' },
    });
  }
}

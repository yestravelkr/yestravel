import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { ClaimEntity } from '@src/module/backoffice/domain/order/claim.entity';
import type { ClaimDetail } from '@src/module/backoffice/domain/order/claim-detail.type';
import type { OrderStatusEnumType } from '@src/module/backoffice/domain/order/order-status';
import type {
  CreateClaimInput,
  CreateClaimOutput,
  GetClaimByOrderIdInput,
  GetClaimByOrderIdOutput,
} from './shop.claim.dto';

/** 취소 가능한 주문 상태 (HOTEL) */
const HOTEL_CANCELLABLE_STATUSES: OrderStatusEnumType[] = [
  'PAID',
  'PENDING_RESERVATION',
  'RESERVATION_CONFIRMED',
];

/** 취소 가능한 주문 상태 (DELIVERY) */
const DELIVERY_CANCELLABLE_STATUSES: OrderStatusEnumType[] = [
  'PAID',
  'PREPARING_SHIPMENT',
];

/** 반품 가능한 주문 상태 (DELIVERY only) */
const DELIVERY_RETURNABLE_STATUSES: OrderStatusEnumType[] = ['DELIVERED'];

@Injectable()
export class ShopClaimService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  /**
   * 클레임 생성 (취소/반품 요청)
   *
   * TODO: 부분 환불 지원
   * - 현재: 주문 전체 금액 기준으로 클레임 생성
   * - 추후: 관리자가 승인 시 환불 금액 조정 가능하도록 구현
   *
   * TODO: 부분 옵션 반품 지원 (배송 상품)
   * - 현재: 주문 전체 반품만 가능
   * - 추후: returnItems 입력받아 특정 옵션/수량만 반품 가능하도록 구현
   *   - CreateClaimInput에 returnItems?: { optionId: number; quantity: number; }[] 추가
   *   - 부분 반품 시 환불 금액 계산 로직 추가
   */
  async create(input: CreateClaimInput): Promise<CreateClaimOutput> {
    const {
      orderId,
      memberId,
      type,
      reasonCategory,
      reasonDetail,
      evidenceUrls,
    } = input;

    // 1. 주문 조회 및 권한 확인
    const order = await this.repositoryProvider.OrderRepository.findOneOrFail({
      where: { id: orderId },
    }).catch(() => {
      throw new NotFoundException(`주문을 찾을 수 없습니다. (id: ${orderId})`);
    });

    if (order.memberId !== memberId) {
      throw new BadRequestException(
        '본인의 주문만 취소/반품 요청할 수 있습니다.'
      );
    }

    // 2. 이미 처리 중인 클레임 있는지 확인
    const existingClaim = await this.repositoryProvider.ClaimRepository.findOne(
      {
        where: {
          orderId,
          status: 'REQUESTED',
        },
      }
    );

    if (existingClaim) {
      throw new BadRequestException('이미 처리 중인 클레임이 있습니다.');
    }

    // 3. 주문 상태별 클레임 가능 여부 검증
    this.validateClaimable(order.type, order.status, type);

    // 4. 취소 수수료 계산
    const { cancelFee, detail } = await this.calculateCancelFee(order, type);

    // 5. 환불 금액 계산
    const originalAmount = order.totalAmount;
    const refundAmount = originalAmount - cancelFee;

    // 6. 클레임 생성
    const claim = new ClaimEntity();
    claim.type = type;
    claim.productType = order.type;
    claim.status = 'REQUESTED';
    claim.orderId = orderId;
    claim.memberId = memberId;
    claim.previousOrderStatus = order.status; // 이전 상태 저장 (거절 시 복원용)
    claim.reason = {
      category: reasonCategory,
      detail: reasonDetail ?? null,
      evidenceUrls: evidenceUrls ?? null,
    };
    claim.amount = {
      original: originalAmount,
      refund: refundAmount,
    };
    claim.detail = detail;

    const savedClaim =
      await this.repositoryProvider.ClaimRepository.save(claim);

    // 7. 주문 상태 변경
    const newOrderStatus: OrderStatusEnumType =
      type === 'CANCEL' ? 'CANCEL_REQUESTED' : 'RETURN_REQUESTED';
    await this.repositoryProvider.OrderRepository.update(
      { id: orderId },
      { status: newOrderStatus }
    );

    return {
      claimId: savedClaim.id,
      status: savedClaim.status,
      estimatedRefundAmount: refundAmount,
      cancelFee,
      originalAmount,
    };
  }

  /**
   * 주문 ID로 클레임 조회
   */
  async findByOrderId(
    input: GetClaimByOrderIdInput
  ): Promise<GetClaimByOrderIdOutput> {
    const { orderId, memberId } = input;

    // 주문 권한 확인
    const order = await this.repositoryProvider.OrderRepository.findOne({
      where: { id: orderId, memberId },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    // 클레임 조회 (가장 최근 것)
    const claim = await this.repositoryProvider.ClaimRepository.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });

    if (!claim) {
      return null;
    }

    return {
      id: claim.id,
      type: claim.type,
      status: claim.status,
      reasonCategory: claim.reason.category,
      reasonDetail: claim.reason.detail,
      evidenceUrls: claim.reason.evidenceUrls,
      originalAmount: claim.amount.original,
      refundAmount: claim.amount.refund,
      createdAt: claim.createdAt,
    };
  }

  /**
   * 클레임 가능 여부 검증
   */
  private validateClaimable(
    productType: string,
    orderStatus: OrderStatusEnumType,
    claimType: 'CANCEL' | 'RETURN'
  ): void {
    if (claimType === 'CANCEL') {
      // 취소 요청
      if (productType === 'HOTEL') {
        if (!HOTEL_CANCELLABLE_STATUSES.includes(orderStatus)) {
          throw new BadRequestException(
            `현재 주문 상태에서는 취소할 수 없습니다. (상태: ${orderStatus})`
          );
        }
      } else if (productType === 'DELIVERY') {
        if (!DELIVERY_CANCELLABLE_STATUSES.includes(orderStatus)) {
          throw new BadRequestException(
            `현재 주문 상태에서는 취소할 수 없습니다. (상태: ${orderStatus})`
          );
        }
      } else {
        // E-TICKET 등 기타
        throw new BadRequestException(
          '해당 상품 유형은 취소를 지원하지 않습니다.'
        );
      }
    } else {
      // 반품 요청
      if (productType !== 'DELIVERY') {
        throw new BadRequestException('반품은 배송 상품만 가능합니다.');
      }
      if (!DELIVERY_RETURNABLE_STATUSES.includes(orderStatus)) {
        throw new BadRequestException(
          `현재 주문 상태에서는 반품할 수 없습니다. (상태: ${orderStatus})`
        );
      }
    }
  }

  /**
   * 취소 수수료 계산
   *
   * TODO: 호텔 취소 수수료 계산
   * - 상품의 취소 정책(cancelPolicy) 조회
   * - 체크인 날짜 기준 D-day 계산
   * - 해당하는 정책 구간의 수수료율 적용
   * - 예: { daysBeforeCheckIn: 7, feePercentage: 0 } → 7일 전까지 무료
   * - appliedPolicy: 적용된 정책 항목 저장
   * - cancelPolicySnapshot: 당시 전체 정책 저장 (정책 변경 시 기록 유지)
   *
   * TODO: 배송 반품 배송비 계산
   * - 고객 귀책: 고객 부담 (returnShippingFee 설정)
   * - 판매자 귀책: 판매자 부담 (returnShippingFee = 0)
   * - 반품비 설정 데이터 필요
   *
   * TODO: E-TICKET 취소 수수료
   * - 사용 전/후 여부 확인 필요
   * - 일부 사용 시 부분 환불 로직
   */
  private async calculateCancelFee(
    order: { type: string; totalAmount: number },
    claimType: 'CANCEL' | 'RETURN'
  ): Promise<{ cancelFee: number; detail: ClaimDetail }> {
    // TODO: 실제 취소 정책 적용 필요 (현재는 수수료 0원)
    const cancelFee = 0;

    if (order.type === 'HOTEL') {
      // TODO: 호텔 상품의 취소 정책 조회 및 적용
      // const product = await this.repositoryProvider.ProductRepository.findOne({ where: { id: order.productId } });
      // const cancelPolicy = product.cancelPolicy;
      // const checkInDate = order.checkInDate;
      // const { fee, appliedPolicy } = this.calculateHotelCancelFee(cancelPolicy, checkInDate);
      return {
        cancelFee,
        detail: {
          type: 'HOTEL',
          cancelFee,
          appliedPolicy: undefined, // TODO: 적용된 정책 항목
          cancelPolicySnapshot: undefined, // TODO: 전체 정책 스냅샷
        },
      };
    } else if (order.type === 'DELIVERY') {
      // TODO: 반품 배송비 계산 로직
      // const returnShippingFee = claimType === 'RETURN' ? this.getReturnShippingFee(order) : 0;
      return {
        cancelFee,
        detail: {
          type: 'DELIVERY',
          cancelFee,
          returnShippingFee: 0, // TODO: 반품 배송비 계산
        },
      };
    } else {
      // E-TICKET
      // TODO: 이티켓 취소 수수료 계산 (사용 여부 확인 필요)
      return {
        cancelFee,
        detail: {
          type: 'E-TICKET',
          cancelFee,
        },
      };
    }
  }
}

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { ClaimEntity } from '@src/module/backoffice/domain/order/claim.entity';
import {
  OrderEntity,
  orderNumberParser,
} from '@src/module/backoffice/domain/order/order.entity';
import { ShopPaymentService } from '@src/module/shop/payment/shop.payment.service';
import type { ClaimDetail } from '@src/module/backoffice/domain/order/claim-detail.type';
import { OrderHistoryService } from '@src/module/backoffice/order/order-history.service';
import { SmtntService } from '@src/module/shared/notification/smtnt/smtnt.service';
import { ConfigProvider } from '@src/config';
import {
  calculateHotelCancelFee,
  buildCancelFeePreviewResult,
} from '@src/module/shared/cancel-fee/hotel-cancel-fee.util';
import type {
  CreateClaimInput,
  CreateClaimOutput,
  GetClaimByOrderIdInput,
  GetCancelFeePreviewInput,
  WithdrawClaimInput,
  WithdrawClaimOutput,
} from './shop.claim.dto';

/** 취소 가능한 주문 상태 (HOTEL) */
const HOTEL_CANCELLABLE_STATUSES = [
  'PAID',
  'PENDING_RESERVATION',
  'RESERVATION_CONFIRMED',
] as const;

/** 취소 가능한 주문 상태 (DELIVERY) */
const DELIVERY_CANCELLABLE_STATUSES = ['PAID', 'PREPARING_SHIPMENT'] as const;

/** 반품 가능한 주문 상태 (DELIVERY only) */
const DELIVERY_RETURNABLE_STATUSES = ['DELIVERED'] as const;

@Injectable()
export class ShopClaimService {
  private readonly logger = new Logger(ShopClaimService.name);
  private readonly CS_LINK = 'https://travelcs.channel.io/home';
  private readonly SHOP_URL = ConfigProvider.shopUrl;

  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly shopPaymentService: ShopPaymentService,
    private readonly orderHistoryService: OrderHistoryService,
    private readonly smtntService: SmtntService
  ) {}

  /**
   * 클레임 생성 (취소/반품 요청)
   *
   * TODO: 부분 환불 지원
   * - 현재: 주문 전체 금액 기준으로 클레임 생성
   * - 추후: 관리자가 승인 시 환불 금액 조정 가능하도록 구현
   */
  async create(input: CreateClaimInput): Promise<CreateClaimOutput> {
    const { orderId, memberId, type, reason, evidenceUrls, claimOptionItems } =
      input;

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
    const originalAmount = claimOptionItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const refundAmount = originalAmount - cancelFee;

    // 6. 클레임 생성 (Order.status는 변경하지 않음 - Claim.status로 상태 관리)
    const claim = new ClaimEntity();
    claim.type = type;
    claim.productType = order.type;
    claim.status = 'REQUESTED';
    claim.orderId = orderId;
    claim.memberId = memberId;
    claim.reason = {
      text: reason,
      evidenceUrls: evidenceUrls ?? null,
    };
    claim.claimOptionItems = claimOptionItems;
    claim.detail = detail;

    const savedClaim =
      await this.repositoryProvider.ClaimRepository.save(claim);

    // 6-1. 주문 이력: CANCEL_REQUESTED 또는 RETURN_REQUESTED
    await this.orderHistoryService.record({
      orderId,
      previousStatus: order.status,
      newStatus: order.status,
      actorType: 'USER',
      action: type === 'CANCEL' ? 'CANCEL_REQUESTED' : 'RETURN_REQUESTED',
      description:
        type === 'CANCEL'
          ? `고객이 취소를 요청했습니다. 사유: ${reason}`
          : `고객이 반품을 요청했습니다. 사유: ${reason}`,
      claimId: savedClaim.id,
      metadata: {
        claimType: type,
        claimReason: reason,
        claimOptionItems: claimOptionItems,
      },
    });

    // 7. PAID 상태이고 취소 요청인 경우 → 자동 승인 + 포트원 환불
    if (order.status === 'PAID' && type === 'CANCEL') {
      savedClaim.status = 'APPROVED';
      await this.repositoryProvider.ClaimRepository.save(savedClaim);

      // 포트원 결제 취소 (실패 시 @Transactional이 DB 롤백)
      const paymentId = orderNumberParser.encode([orderId], order.createdAt);
      await this.shopPaymentService.cancelPayment(
        paymentId,
        `고객 직접 취소 - 주문 ${orderId}`,
        refundAmount
      );

      // 주문 상태 CANCELLED로 변경
      order.status = 'CANCELLED';
      await this.repositoryProvider.OrderRepository.save(order);

      await this.shopPaymentService.restoreHotelSkuQuantityFromOrder(order);

      // Payment nowAmount 차감
      const payment = await this.repositoryProvider.PaymentRepository.findOne({
        where: { orderId },
      });
      if (payment) {
        payment.nowAmount = payment.paidAmount - refundAmount;
        await this.repositoryProvider.PaymentRepository.save(payment);
      }

      // 주문 이력: CANCEL_AUTO_APPROVED
      await this.orderHistoryService.record({
        orderId,
        previousStatus: 'PAID',
        newStatus: 'CANCELLED',
        actorType: 'SYSTEM',
        action: 'CANCEL_AUTO_APPROVED',
        description: '결제완료 상태에서의 취소 요청이 자동 승인되었습니다.',
        claimId: savedClaim.id,
      });

      // 주문 이력: REFUND_PROCESSED
      await this.orderHistoryService.record({
        orderId,
        previousStatus: 'CANCELLED',
        newStatus: 'CANCELLED',
        actorType: 'SYSTEM',
        action: 'REFUND_PROCESSED',
        description: `환불이 처리되었습니다. 환불금액: ${refundAmount.toLocaleString()}원`,
        claimId: savedClaim.id,
        metadata: { refundAmount, cancelFee },
      });

      // 알림톡 발송: 취소 안내 + 환불 완료
      await this.sendCancelledAlimtalk(order, refundAmount);
      await this.sendRefundedAlimtalk(order, refundAmount);

      return {
        claimId: savedClaim.id,
        status: 'APPROVED' as const,
        estimatedRefundAmount: refundAmount,
        cancelFee,
        originalAmount,
      };
    }

    return {
      claimId: savedClaim.id,
      status: savedClaim.status,
      estimatedRefundAmount: refundAmount,
      cancelFee,
      originalAmount,
    };
  }

  /**
   * 주문 ID로 클레임 조회 (가장 최근 것)
   */
  async findByOrderId(
    input: GetClaimByOrderIdInput
  ): Promise<ClaimEntity | null> {
    const { orderId, memberId } = input;

    // 주문 권한 확인
    const order = await this.repositoryProvider.OrderRepository.findOne({
      where: { id: orderId, memberId },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    // 클레임 조회 (가장 최근 것)
    return this.repositoryProvider.ClaimRepository.findOne({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 취소 철회
   * - REQUESTED 상태의 클레임만 철회 가능
   * - 클레임 상태: REQUESTED → WITHDRAWN
   * - Order.status는 변경하지 않음 (클레임 생성 시에도 변경하지 않았으므로)
   */
  async withdraw(input: WithdrawClaimInput): Promise<WithdrawClaimOutput> {
    const { orderId, memberId } = input;

    // 1. 주문 권한 확인
    const order = await this.repositoryProvider.OrderRepository.findOne({
      where: { id: orderId, memberId },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    // 2. REQUESTED 상태인 클레임 조회
    const claim = await this.repositoryProvider.ClaimRepository.findOne({
      where: { orderId, status: 'REQUESTED' },
      order: { createdAt: 'DESC' },
    });

    if (!claim) {
      throw new NotFoundException('철회할 취소 요청을 찾을 수 없습니다.');
    }

    // 3. 클레임 상태 업데이트: WITHDRAWN
    claim.status = 'WITHDRAWN';
    await this.repositoryProvider.ClaimRepository.save(claim);

    // 주문 이력: CANCEL_WITHDRAWN
    await this.orderHistoryService.record({
      orderId,
      previousStatus: order.status,
      newStatus: order.status,
      actorType: 'USER',
      action: 'CANCEL_WITHDRAWN',
      description: '고객이 취소 요청을 철회했습니다.',
      claimId: claim.id,
    });

    // Order.status는 변경하지 않음 (기존 상태 유지)
    return {
      success: true,
      orderId,
      newOrderStatus: order.status,
    };
  }

  /**
   * 클레임 가능 여부 검증
   */
  private validateClaimable(
    productType: string,
    orderStatus: string,
    claimType: 'CANCEL' | 'RETURN'
  ): void {
    if (claimType === 'CANCEL') {
      // 취소 요청
      if (productType === 'HOTEL') {
        if (
          !HOTEL_CANCELLABLE_STATUSES.includes(
            orderStatus as (typeof HOTEL_CANCELLABLE_STATUSES)[number]
          )
        ) {
          throw new BadRequestException(
            `현재 주문 상태에서는 취소할 수 없습니다. (상태: ${orderStatus})`
          );
        }
      } else if (productType === 'DELIVERY') {
        if (
          !DELIVERY_CANCELLABLE_STATUSES.includes(
            orderStatus as (typeof DELIVERY_CANCELLABLE_STATUSES)[number]
          )
        ) {
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
      if (
        !DELIVERY_RETURNABLE_STATUSES.includes(
          orderStatus as (typeof DELIVERY_RETURNABLE_STATUSES)[number]
        )
      ) {
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
    order: { id: number; type: string; productId: number; totalAmount: number },
    _claimType: 'CANCEL' | 'RETURN'
  ): Promise<{ cancelFee: number; detail: ClaimDetail }> {
    if (order.type === 'HOTEL') {
      // 호텔 주문의 체크인 날짜 조회
      const hotelOrder =
        await this.repositoryProvider.HotelOrderRepository.findOne({
          where: { id: order.id },
        });

      if (!hotelOrder?.checkInDate) {
        throw new BadRequestException('체크인 날짜 정보가 없습니다.');
      }

      // 호텔 상품의 취소 정책 조회
      const hotelProduct =
        await this.repositoryProvider.HotelProductRepository.findOne({
          where: { id: order.productId },
        });

      if (!hotelProduct) {
        throw new NotFoundException('호텔 상품 정보를 찾을 수 없습니다.');
      }

      const cancellationFees = hotelProduct.cancellationFees ?? [];

      const result = calculateHotelCancelFee({
        totalAmount: order.totalAmount,
        checkInDate: hotelOrder.checkInDate,
        cancellationFees,
      });

      // Shop: 당일/과거 취소 차단
      if (result.isSameDayOrPast) {
        throw new BadRequestException(
          '숙박 당일 또는 체크인 이후에는 취소할 수 없습니다.'
        );
      }

      return {
        cancelFee: result.cancelFee,
        detail: {
          type: 'HOTEL' as const,
          cancelFee: result.cancelFee,
          appliedPolicy: result.appliedPolicy,
          cancelPolicySnapshot: result.cancelPolicySnapshot,
        },
      };
    } else if (order.type === 'DELIVERY') {
      // TODO: 반품 배송비 계산 로직
      // const returnShippingFee = claimType === 'RETURN' ? this.getReturnShippingFee(order) : 0;
      return {
        cancelFee: 0,
        detail: {
          type: 'DELIVERY',
          cancelFee: 0,
          returnShippingFee: 0, // TODO: 반품 배송비 계산
        },
      };
    } else {
      // E-TICKET
      // TODO: 이티켓 취소 수수료 계산 (사용 여부 확인 필요)
      return {
        cancelFee: 0,
        detail: {
          type: 'E-TICKET',
          cancelFee: 0,
        },
      };
    }
  }

  /**
   * 취소 수수료 미리보기 (Shop용)
   *
   * - 주문 조회 + 권한 확인
   * - HOTEL 타입만 수수료 계산 (다른 타입은 cancelFee=0)
   * - isSameDayOrPast를 에러 대신 플래그로 반환
   */
  async getCancelFeePreview(input: GetCancelFeePreviewInput) {
    const { orderId, memberId } = input;

    // 주문 조회
    const order = await this.repositoryProvider.OrderRepository.findOneOrFail({
      where: { id: orderId },
    }).catch(() => {
      throw new NotFoundException(`주문을 찾을 수 없습니다. (id: ${orderId})`);
    });

    // 권한 확인
    if (order.memberId !== memberId) {
      throw new BadRequestException('본인의 주문만 조회할 수 있습니다.');
    }

    // HOTEL 타입이 아니면 수수료 0 반환
    if (order.type !== 'HOTEL') {
      return {
        cancelFee: 0,
        feePercentage: 0,
        daysBeforeCheckIn: 0,
        totalAmount: order.totalAmount,
        refundAmount: order.totalAmount,
        isSameDayCancelBlocked: false,
        appliedPolicy: undefined,
        cancelPolicySnapshot: [],
      };
    }

    // 호텔 주문의 체크인 날짜 조회
    const hotelOrder =
      await this.repositoryProvider.HotelOrderRepository.findOne({
        where: { id: orderId },
      });

    if (!hotelOrder?.checkInDate) {
      throw new BadRequestException('체크인 날짜 정보가 없습니다.');
    }

    // 호텔 상품의 취소 정책 조회
    const hotelProduct =
      await this.repositoryProvider.HotelProductRepository.findOne({
        where: { id: order.productId },
      });

    if (!hotelProduct) {
      throw new NotFoundException('호텔 상품 정보를 찾을 수 없습니다.');
    }

    const cancellationFees = hotelProduct.cancellationFees ?? [];

    const result = calculateHotelCancelFee({
      totalAmount: order.totalAmount,
      checkInDate: hotelOrder.checkInDate,
      cancellationFees,
    });

    return buildCancelFeePreviewResult(order.totalAmount, result);
  }

  // ===== 알림톡 발송 =====

  /**
   * 주문 취소 알림톡 발송 (호텔/배송 분기)
   */
  private async sendCancelledAlimtalk(
    order: OrderEntity,
    refundAmount: number
  ): Promise<void> {
    if (order.type === 'HOTEL') {
      await this.sendHotelOrderCancelledAlimtalk(order, refundAmount);
    } else {
      await this.sendDeliveryOrderCancelledAlimtalk(order, refundAmount);
    }
  }

  /**
   * 호텔 예약 취소 알림톡 (SHOP_HOTEL_ORDER_CANCELLED)
   */
  private async sendHotelOrderCancelledAlimtalk(
    order: OrderEntity,
    refundAmount: number
  ): Promise<void> {
    try {
      const snapshot = order.orderOptionSnapshot;
      const product = await this.repositoryProvider.ProductRepository.findOne({
        where: { id: order.productId },
        select: ['id', 'name'],
      });
      const productName = product?.name ?? '상품명 없음';
      const quantity = `${Object.keys(snapshot.priceByDate).length}박`;
      const confirmLink = `${this.SHOP_URL}/orders/${order.orderNumber}`;

      const message =
        `[예스트래블] 예약 취소 안내\n\n` +
        `안녕하세요, ${order.customerName} 고객님.\n\n` +
        `예약번호 ${order.orderNumber}의 취소가 정상적으로 완료되었습니다.\n` +
        `환불은 영업일 기준 3~5일 내 처리됩니다.\n\n` +
        `★ 예약 취소 정보\n` +
        `주문번호: ${order.orderNumber}\n` +
        `상품명: ${productName}\n` +
        `선택옵션: ${snapshot.hotelOptionName}\n` +
        `구매수량: ${quantity}\n` +
        `이용 날짜: ${snapshot.checkInDate}\n` +
        `결제금액: ${order.totalAmount.toLocaleString()}원\n` +
        `예약 상태 확인: ${confirmLink}\n\n` +
        `★ 고객센터 안내\n` +
        `궁금한 사항이 있으시면 고객센터로 문의해 주세요.\n` +
        `고객센터: ${this.CS_LINK}\n\n` +
        `감사합니다.`;

      await this.smtntService.sendAlimtalk({
        phone: order.customerPhone,
        message,
        templateCode: 'SHOP_HOTEL_ORDER_CANCELLED',
        failedType: 'LMS',
        failedMessage: message,
      });

      this.logger.log(`호텔 예약 취소 알림톡 발송 성공: orderId=${order.id}`);
    } catch (error) {
      this.logger.error(
        `호텔 예약 취소 알림톡 발송 실패: orderId=${order.id}`,
        error
      );
    }
  }

  /**
   * 배송상품 주문 취소 알림톡 (SHOP_DELIVERY_ORDER_CANCELLED)
   */
  private async sendDeliveryOrderCancelledAlimtalk(
    order: OrderEntity,
    refundAmount: number
  ): Promise<void> {
    try {
      const snapshot = order.orderOptionSnapshot;
      const product = await this.repositoryProvider.ProductRepository.findOne({
        where: { id: order.productId },
        select: ['id', 'name'],
      });
      const productName = product?.name ?? '상품명 없음';
      const confirmLink = `${this.SHOP_URL}/orders/${order.orderNumber}`;

      const message =
        `[예스트래블] 주문 취소 안내\n\n` +
        `안녕하세요, ${order.customerName} 고객님.\n\n` +
        `주문하신 상품의 취소가 정상적으로 완료되었습니다.\n` +
        `환불은 영업일 기준 3~5일 내 처리됩니다.\n\n` +
        `★ 주문 취소 정보\n` +
        `주문번호: ${order.orderNumber}\n` +
        `상품명: ${productName}\n` +
        `선택옵션: ${snapshot.hotelOptionName ?? '-'}\n` +
        `구매수량: 1개\n` +
        `취소금액: ${refundAmount.toLocaleString()}원\n` +
        `주문 상태 확인: ${confirmLink}\n\n` +
        `★ 고객센터 안내\n` +
        `궁금한 사항이 있으시면 고객센터로 문의해 주세요.\n` +
        `고객센터: ${this.CS_LINK}\n\n` +
        `감사합니다.`;

      await this.smtntService.sendAlimtalk({
        phone: order.customerPhone,
        message,
        templateCode: 'SHOP_DELIVERY_ORDER_CANCELLED',
        failedType: 'LMS',
        failedMessage: message,
      });

      this.logger.log(`배송 주문 취소 알림톡 발송 성공: orderId=${order.id}`);
    } catch (error) {
      this.logger.error(
        `배송 주문 취소 알림톡 발송 실패: orderId=${order.id}`,
        error
      );
    }
  }

  /**
   * 환불 완료 알림톡 (SHOP_ORDER_REFUNDED) - 호텔/배송 공통
   */
  private async sendRefundedAlimtalk(
    order: OrderEntity,
    refundAmount: number
  ): Promise<void> {
    try {
      const product = await this.repositoryProvider.ProductRepository.findOne({
        where: { id: order.productId },
        select: ['id', 'name'],
      });
      const productName = product?.name ?? '상품명 없음';

      const message =
        `[예스트래블] 환불 완료 안내\n\n` +
        `안녕하세요, ${order.customerName} 고객님.\n\n` +
        `환불이 정상적으로 완료되었습니다.\n\n` +
        `★ 환불 정보\n` +
        `상품명: ${productName}\n` +
        `주문번호: ${order.orderNumber}\n` +
        `환불금액: ${refundAmount.toLocaleString()}원\n\n` +
        `카드사에 따라 영업일 기준 3~5일 소요될 수 있습니다.\n\n` +
        `★ 고객센터 안내\n` +
        `궁금한 사항이 있으시면 고객센터로 문의해 주세요.\n` +
        `고객센터: ${this.CS_LINK}\n\n` +
        `감사합니다.`;

      await this.smtntService.sendAlimtalk({
        phone: order.customerPhone,
        message,
        templateCode: 'SHOP_ORDER_REFUNDED',
        failedType: 'LMS',
        failedMessage: message,
      });

      this.logger.log(`환불 완료 알림톡 발송 성공: orderId=${order.id}`);
    } catch (error) {
      this.logger.error(
        `환불 완료 알림톡 발송 실패: orderId=${order.id}`,
        error
      );
    }
  }
}

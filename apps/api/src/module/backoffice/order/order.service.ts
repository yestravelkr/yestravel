import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Between, FindOptionsWhere, ILike, In } from 'typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import type { PartnerScope } from '@src/shared/auth/partner-scope';
import * as ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { S3Service } from '@src/module/shared/aws/s3.service';
import { ShopPaymentService } from '@src/module/shop/payment/shop.payment.service';
import {
  ORDER_STATUS_ENUM_VALUE,
  OrderEntity,
  orderNumberParser,
} from '@src/module/backoffice/domain/order/order.entity';
import {
  ORDER_STATUS_LABELS,
  canTransition,
  type OrderStatusEnumType,
} from '@src/module/backoffice/domain/order/order-status';
import type { HotelOrderOptionData } from '@src/module/backoffice/domain/order/hotel-order.entity';
import type {
  FindAllOrdersInput,
  GetStatusCountsInput,
  OrderListResponse,
  OrderListItem,
  StatusCounts,
  FilterOptionsResponse,
  FindByIdInput,
  OrderDetailResponse,
  UpdateStatusInput,
  UpdateStatusResponse,
  RevertStatusInput,
  RevertStatusResponse,
  ExportToExcelInput,
  ExportToExcelResponse,
  CancelOrderInput,
  CancelOrderResponse,
} from './order.dto';
import { OrderHistoryService } from './order-history.service';
import { SmtntService } from '@src/module/shared/notification/smtnt/smtnt.service';

import type { Nullish } from '@src/types/utility.type';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  /** Shop 고객센터 URL */
  private readonly CS_LINK = 'https://travelcs.channel.io/home';

  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly s3Service: S3Service,
    private readonly shopPaymentService: ShopPaymentService,
    private readonly orderHistoryService: OrderHistoryService,
    private readonly smtntService: SmtntService
  ) {}

  /**
   * 주문 목록 조회 (필터링 + 페이지네이션)
   */
  async findAll(input: FindAllOrdersInput): Promise<OrderListResponse> {
    const {
      page = 1,
      limit = 50,
      orderBy = 'createdAt',
      order = 'DESC',
      type,
      status,
      periodFilterType,
      startDate,
      endDate,
      campaignId,
      influencerIds,
      productId,
      searchQuery,
      partnerScope,
    } = input;

    // Where 조건 생성 (OrderEntity는 soft delete 없음)
    const baseWhere: FindOptionsWhere<OrderEntity> = {};

    if (type) baseWhere.type = type;
    // 클레임 기반 상태 필터 (CANCEL_REQUESTED, RETURN_REQUESTED)
    const isClaimStatus =
      status === 'CANCEL_REQUESTED' || status === 'RETURN_REQUESTED';
    if (status && !isClaimStatus)
      baseWhere.status = status as OrderEntity['status'];
    if (campaignId) baseWhere.campaignId = campaignId;
    if (productId) baseWhere.productId = productId;
    if (influencerIds && influencerIds.length > 0) {
      baseWhere.influencerId = In(influencerIds);
    }

    // 기간 필터
    if (startDate && endDate) {
      const dateColumn = this.getDateColumn(periodFilterType);
      (baseWhere as Record<string, unknown>)[dateColumn] = Between(
        new Date(startDate),
        new Date(endDate)
      );
    }

    // 검색어 필터 (OR 조건이므로 배열로 처리)
    let whereConditions: FindOptionsWhere<OrderEntity>[];
    if (searchQuery) {
      whereConditions = [
        { ...baseWhere, customerName: ILike(`%${searchQuery}%`) },
        { ...baseWhere, customerPhone: ILike(`%${searchQuery}%`) },
      ];
    } else {
      whereConditions = [baseWhere];
    }

    // 데이터 조회
    let orders: OrderEntity[];
    let total: number;

    if (isClaimStatus) {
      // 클레임 기반 필터: QueryBuilder + INNER JOIN
      const claimType = status === 'CANCEL_REQUESTED' ? 'CANCEL' : 'RETURN';
      const qb = this.repositoryProvider.OrderRepository.createQueryBuilder(
        'ord'
      )
        .innerJoin(
          'ord.claims',
          'claim',
          'claim.status = :claimStatus AND claim.type = :claimType',
          {
            claimStatus: 'REQUESTED',
            claimType,
          }
        )
        .leftJoinAndSelect('ord.product', 'product')
        .leftJoinAndSelect('ord.campaign', 'campaign')
        .leftJoinAndSelect('ord.influencer', 'influencer')
        .leftJoinAndSelect('ord.claims', 'allClaims');

      // Partner scope 적용 (product는 이미 'product' alias로 JOIN됨)
      this.applyPartnerScope(qb, partnerScope, 'ord', 'product');

      // 기본 필터 적용
      if (type) qb.andWhere('ord.type = :type', { type });
      if (campaignId)
        qb.andWhere('ord.campaignId = :campaignId', { campaignId });
      if (productId) qb.andWhere('ord.productId = :productId', { productId });
      if (influencerIds && influencerIds.length > 0) {
        qb.andWhere('ord.influencerId IN (:...influencerIds)', {
          influencerIds,
        });
      }
      if (startDate && endDate) {
        const dateColumn = this.getDateColumn(periodFilterType);
        qb.andWhere(`ord.${dateColumn} BETWEEN :startDate AND :endDate`, {
          startDate,
          endDate,
        });
      }
      if (searchQuery) {
        qb.andWhere(
          '(ord.customerName ILIKE :searchQuery OR ord.customerPhone ILIKE :searchQuery)',
          {
            searchQuery: `%${searchQuery}%`,
          }
        );
      }

      qb.orderBy(`ord.${this.getSortColumn(orderBy)}`, order)
        .skip((page - 1) * limit)
        .take(limit);

      [orders, total] = await qb.getManyAndCount();
    } else if (partnerScope && partnerScope.authType === 'BRAND') {
      // BRAND 스코핑: Product JOIN 필요 → QueryBuilder 사용
      const qb = this.repositoryProvider.OrderRepository.createQueryBuilder(
        'ord'
      )
        .leftJoinAndSelect('ord.product', 'product')
        .leftJoinAndSelect('ord.campaign', 'campaign')
        .leftJoinAndSelect('ord.influencer', 'influencer')
        .leftJoinAndSelect('ord.claims', 'claims');

      // Partner scope 적용 (product는 이미 'product' alias로 JOIN됨)
      this.applyPartnerScope(qb, partnerScope, 'ord', 'product');

      // 기본 필터 적용
      if (type) qb.andWhere('ord.type = :type', { type });
      if (status) qb.andWhere('ord.status = :status', { status });
      if (campaignId)
        qb.andWhere('ord.campaignId = :campaignId', { campaignId });
      if (productId) qb.andWhere('ord.productId = :productId', { productId });
      if (influencerIds && influencerIds.length > 0) {
        qb.andWhere('ord.influencerId IN (:...influencerIds)', {
          influencerIds,
        });
      }
      if (startDate && endDate) {
        const dateColumn = this.getDateColumn(periodFilterType);
        qb.andWhere(`ord.${dateColumn} BETWEEN :startDate AND :endDate`, {
          startDate,
          endDate,
        });
      }
      if (searchQuery) {
        qb.andWhere(
          '(ord.customerName ILIKE :searchQuery OR ord.customerPhone ILIKE :searchQuery)',
          { searchQuery: `%${searchQuery}%` }
        );
      }

      qb.orderBy(`ord.${this.getSortColumn(orderBy)}`, order)
        .skip((page - 1) * limit)
        .take(limit);

      [orders, total] = await qb.getManyAndCount();
    } else {
      // 일반 필터 (ADMIN / INFLUENCER): 기존 로직 + claims relation 추가
      // INFLUENCER 스코핑: influencerId를 where 조건에 추가
      if (partnerScope && partnerScope.authType === 'INFLUENCER') {
        for (const condition of whereConditions) {
          condition.influencerId = partnerScope.influencerId;
        }
      }

      [orders, total] =
        await this.repositoryProvider.OrderRepository.findAndCount({
          where: whereConditions,
          relations: ['product', 'campaign', 'influencer', 'claims'],
          order: { [this.getSortColumn(orderBy)]: order },
          skip: (page - 1) * limit,
          take: limit,
        });
    }

    // Response 포맷팅
    const data: OrderListItem[] = orders.map(order => {
      const orderOptionSnapshot =
        order.orderOptionSnapshot as HotelOrderOptionData;

      return {
        id: order.id,
        orderNumber: orderNumberParser.encode([order.id], order.createdAt),
        type: order.type,
        status: order.status,
        displayStatus: this.computeDisplayStatus(order),
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalAmount: order.totalAmount,

        // 관계 데이터 (모두 NOT NULL)
        productId: order.productId,
        productName: order.product.name,
        campaignId: order.campaignId,
        campaignName: order.campaign.title,
        influencerId: order.influencerId,
        influencerName: order.influencer.name,

        // 호텔 전용 필드
        checkInDate:
          order.type === 'HOTEL' ? orderOptionSnapshot?.checkInDate : null,
        checkOutDate:
          order.type === 'HOTEL' ? orderOptionSnapshot?.checkOutDate : null,
        hotelOptionName:
          order.type === 'HOTEL' ? orderOptionSnapshot?.hotelOptionName : null,

        // 타임스탬프
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 상태별 카운트 조회
   */
  async getStatusCounts(input: GetStatusCountsInput): Promise<StatusCounts> {
    const {
      type,
      periodFilterType,
      startDate,
      endDate,
      campaignId,
      influencerIds,
      productId,
      searchQuery,
      partnerScope,
    } = input;

    // QueryBuilder 사용 (GROUP BY 필요)
    const qb = this.repositoryProvider.OrderRepository.createQueryBuilder('ord')
      .select('ord.status', 'status')
      .addSelect('COUNT(*)', 'count');

    // Partner scope 적용
    this.applyPartnerScope(qb, partnerScope);

    // 필터 적용
    if (type) qb.andWhere('ord.type = :type', { type });
    if (startDate && endDate) {
      const dateColumn = this.getDateColumn(periodFilterType);
      qb.andWhere(`ord.${dateColumn} BETWEEN :startDate AND :endDate`, {
        startDate,
        endDate,
      });
    }
    if (campaignId) qb.andWhere('ord.campaignId = :campaignId', { campaignId });
    if (influencerIds && influencerIds.length > 0) {
      qb.andWhere('ord.influencerId IN (:...influencerIds)', { influencerIds });
    }
    if (productId) qb.andWhere('ord.productId = :productId', { productId });
    if (searchQuery) {
      qb.andWhere(
        '(ord.customerName ILIKE :searchQuery OR ord.customerPhone ILIKE :searchQuery)',
        { searchQuery: `%${searchQuery}%` }
      );
    }

    qb.groupBy('ord.status');

    const results = await qb.getRawMany<{ status: string; count: string }>();

    // 초기값 설정 (취소/반품 요청 상태는 Claim.status로 관리)
    const counts: StatusCounts = {
      ALL: 0,
      PENDING: 0,
      PAID: 0,
      PENDING_RESERVATION: 0,
      RESERVATION_CONFIRMED: 0,
      COMPLETED: 0,
      PREPARING_SHIPMENT: 0,
      SHIPPING: 0,
      DELIVERED: 0,
      PURCHASE_CONFIRMED: 0,
      CANCEL_REQUESTED: 0,
      RETURN_REQUESTED: 0,
      CANCELLED: 0,
      RETURNING: 0,
      RETURNED: 0,
    };

    // 결과 매핑
    let totalCount = 0;
    for (const result of results) {
      const status = result.status as keyof Omit<
        StatusCounts,
        'ALL' | 'CANCEL_REQUESTED' | 'RETURN_REQUESTED'
      >;
      const count = parseInt(result.count, 10);
      if (ORDER_STATUS_ENUM_VALUE.includes(status as any)) {
        counts[status] = count;
        totalCount += count;
      }
    }
    counts.ALL = totalCount;

    // 클레임 기반 카운트 (CANCEL_REQUESTED, RETURN_REQUESTED)
    const claimQb = this.repositoryProvider.ClaimRepository.createQueryBuilder(
      'claim'
    )
      .innerJoin('claim.order', 'ord')
      .select('claim.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('claim.status = :claimStatus', { claimStatus: 'REQUESTED' });

    // Partner scope 적용 (claimQb는 ord alias로 order를 JOIN)
    this.applyPartnerScope(
      claimQb as unknown as SelectQueryBuilder<OrderEntity>,
      partnerScope
    );

    // 동일 필터 적용
    if (type) claimQb.andWhere('ord.type = :type', { type });
    if (startDate && endDate) {
      const dateColumn = this.getDateColumn(periodFilterType);
      claimQb.andWhere(`ord.${dateColumn} BETWEEN :startDate AND :endDate`, {
        startDate,
        endDate,
      });
    }
    if (campaignId)
      claimQb.andWhere('ord.campaignId = :campaignId', { campaignId });
    if (influencerIds && influencerIds.length > 0) {
      claimQb.andWhere('ord.influencerId IN (:...influencerIds)', {
        influencerIds,
      });
    }
    if (productId)
      claimQb.andWhere('ord.productId = :productId', { productId });
    if (searchQuery) {
      claimQb.andWhere(
        '(ord.customerName ILIKE :searchQuery OR ord.customerPhone ILIKE :searchQuery)',
        { searchQuery: `%${searchQuery}%` }
      );
    }

    claimQb.groupBy('claim.type');

    const claimResults = await claimQb.getRawMany<{
      type: string;
      count: string;
    }>();
    for (const result of claimResults) {
      const count = parseInt(result.count, 10);
      if (result.type === 'CANCEL') {
        counts.CANCEL_REQUESTED = count;
      } else if (result.type === 'RETURN') {
        counts.RETURN_REQUESTED = count;
      }
    }

    return counts;
  }

  /**
   * 필터 옵션 조회 (캠페인, 인플루언서, 상품 - 최근 100개씩)
   *
   * soft delete는 TypeORM이 자동 처리 (@DeleteDateColumn)
   * Partner 스코핑: BRAND는 자사 상품 기반, INFLUENCER는 자신 기반
   */
  async getFilterOptions(input?: {
    partnerScope?: PartnerScope;
  }): Promise<FilterOptionsResponse> {
    const partnerScope = input?.partnerScope;

    if (partnerScope?.authType === 'BRAND') {
      // BRAND: 자사 상품 → 해당 상품의 캠페인/인플루언서
      const products = await this.repositoryProvider.ProductRepository.find({
        select: ['id', 'name'],
        where: { brandId: partnerScope.brandId },
        order: { createdAt: 'DESC' },
        take: 100,
      });

      const productIds = products.map(p => p.id);

      if (productIds.length === 0) {
        return { campaigns: [], influencers: [], products: [] };
      }

      // 해당 상품의 주문에서 캠페인/인플루언서 추출
      const orders = await this.repositoryProvider.OrderRepository.find({
        select: ['campaignId', 'influencerId'],
        where: { productId: In(productIds) },
      });

      const campaignIds = [...new Set(orders.map(o => o.campaignId))];
      const influencerIds = [...new Set(orders.map(o => o.influencerId))];

      const [campaigns, influencers] = await Promise.all([
        campaignIds.length > 0
          ? this.repositoryProvider.CampaignRepository.find({
              select: ['id', 'title'],
              where: { id: In(campaignIds) },
            })
          : [],
        influencerIds.length > 0
          ? this.repositoryProvider.InfluencerRepository.find({
              select: ['id', 'name'],
              where: { id: In(influencerIds) },
            })
          : [],
      ]);

      return {
        campaigns: campaigns.map(c => ({ id: c.id, name: c.title })),
        influencers: influencers.map(i => ({ id: i.id, name: i.name })),
        products: products.map(p => ({ id: p.id, name: p.name })),
      };
    }

    if (partnerScope?.authType === 'INFLUENCER') {
      // INFLUENCER: 자신의 주문에서 캠페인/상품 추출
      const orders = await this.repositoryProvider.OrderRepository.find({
        select: ['campaignId', 'productId'],
        where: { influencerId: partnerScope.influencerId },
      });

      const campaignIds = [...new Set(orders.map(o => o.campaignId))];
      const productIds = [...new Set(orders.map(o => o.productId))];

      const [campaigns, products] = await Promise.all([
        campaignIds.length > 0
          ? this.repositoryProvider.CampaignRepository.find({
              select: ['id', 'title'],
              where: { id: In(campaignIds) },
            })
          : [],
        productIds.length > 0
          ? this.repositoryProvider.ProductRepository.find({
              select: ['id', 'name'],
              where: { id: In(productIds) },
            })
          : [],
      ]);

      // 인플루언서 자신만 반환
      const influencer =
        await this.repositoryProvider.InfluencerRepository.findOne({
          select: ['id', 'name'],
          where: { id: partnerScope.influencerId },
        });

      return {
        campaigns: campaigns.map(c => ({ id: c.id, name: c.title })),
        influencers: influencer
          ? [{ id: influencer.id, name: influencer.name }]
          : [],
        products: products.map(p => ({ id: p.id, name: p.name })),
      };
    }

    // ADMIN: 전체 조회 (기존 로직)
    const [campaigns, influencers, products] = await Promise.all([
      this.repositoryProvider.CampaignRepository.find({
        select: ['id', 'title'],
        order: { createdAt: 'DESC' },
        take: 100,
      }),
      this.repositoryProvider.InfluencerRepository.find({
        select: ['id', 'name'],
        order: { createdAt: 'DESC' },
        take: 100,
      }),
      this.repositoryProvider.ProductRepository.find({
        select: ['id', 'name'],
        order: { createdAt: 'DESC' },
        take: 100,
      }),
    ]);

    return {
      campaigns: campaigns.map(c => ({ id: c.id, name: c.title })),
      influencers: influencers.map(i => ({ id: i.id, name: i.name })),
      products: products.map(p => ({ id: p.id, name: p.name })),
    };
  }

  /**
   * Order + Claims 기반 displayStatus 합성
   * REQUESTED 상태의 클레임이 있으면 CANCEL_REQUESTED / RETURN_REQUESTED
   */
  private computeDisplayStatus(
    order: OrderEntity
  ): OrderListItem['displayStatus'] {
    const activeClaim = order.claims?.find(c => c.status === 'REQUESTED');
    if (activeClaim) {
      return activeClaim.type === 'CANCEL'
        ? 'CANCEL_REQUESTED'
        : 'RETURN_REQUESTED';
    }
    return order.status;
  }

  /**
   * 기간 필터 타입에 따른 컬럼명 반환
   */
  private getDateColumn(periodFilterType: Nullish<string>): string {
    switch (periodFilterType) {
      case 'PAYMENT_DATE':
        return 'createdAt'; // TODO: 결제일 컬럼 추가 시 변경
      case 'USAGE_DATE':
        return 'checkInDate'; // 호텔 전용
      case 'ORDER_DATE':
      default:
        return 'createdAt';
    }
  }

  /**
   * 정렬 컬럼 유효성 검사
   */
  private getSortColumn(orderBy: string): string {
    const allowedColumns = [
      'createdAt',
      'updatedAt',
      'status',
      'totalAmount',
      'customerName',
    ];
    return allowedColumns.includes(orderBy) ? orderBy : 'createdAt';
  }

  /**
   * 주문 상태 변경
   * 상태 전이 규칙에 따라 유효한 상태 변경만 허용
   */
  async updateStatus(input: UpdateStatusInput): Promise<UpdateStatusResponse> {
    const { orderId, status: newStatus } = input;

    const order = await this.repositoryProvider.OrderRepository.findOneOrFail({
      where: { id: orderId },
    }).catch(() => {
      throw new NotFoundException(`주문을 찾을 수 없습니다. (id: ${orderId})`);
    });

    const previousStatus = order.status;

    // 상태 전이 가능 여부 검증
    if (!canTransition(order.type, previousStatus, newStatus)) {
      throw new BadRequestException(
        `${ORDER_STATUS_LABELS[previousStatus]} 상태에서 ${ORDER_STATUS_LABELS[newStatus]} 상태로 변경할 수 없습니다.`
      );
    }

    // 상태 업데이트
    order.status = newStatus;
    await this.repositoryProvider.OrderRepository.save(order);

    // 주문 이력: STATUS_CHANGED
    await this.orderHistoryService.record({
      orderId: order.id,
      previousStatus,
      newStatus,
      actorType: 'ADMIN',
      action: 'STATUS_CHANGED',
      description: `${ORDER_STATUS_LABELS[previousStatus]} 에서 ${ORDER_STATUS_LABELS[newStatus]} 상태로 변경되었습니다.`,
    });

    // 호텔 주문 예약 확정 시 알림톡 발송
    if (newStatus === 'RESERVATION_CONFIRMED' && order.type === 'HOTEL') {
      await this.sendReservationConfirmedAlimtalk(order);
    }

    return {
      success: true,
      orderId: order.id,
      previousStatus,
      newStatus,
    };
  }

  /**
   * 호텔 예약 확정 알림톡 발송
   * 발송 실패 시 에러 로깅만 하고 상태 변경 프로세스에 영향을 주지 않음
   */
  private async sendReservationConfirmedAlimtalk(
    order: OrderEntity
  ): Promise<void> {
    try {
      const snapshot = order.orderOptionSnapshot as HotelOrderOptionData;

      // 호텔 상품 조회 - 취소 정책 포함
      const hotelProduct =
        await this.repositoryProvider.HotelProductRepository.findOne({
          where: { id: order.productId },
          select: ['id', 'name', 'cancellationFees'],
        });
      const productName = hotelProduct?.name ?? '상품명 없음';

      const checkInDate = snapshot.checkInDate;
      const optionName = snapshot.hotelOptionName;

      // 취소 정책 메시지 조합
      const cancellationFees = hotelProduct?.cancellationFees ?? [];
      // daysBeforeCheckIn 내림차순 정렬 (먼 날짜부터)
      const sortedFees = [...cancellationFees].sort(
        (a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn
      );

      let refundPolicyText = '';
      for (const fee of sortedFees) {
        const refundRate = 100 - fee.feePercentage;
        if (fee.feePercentage === 0) {
          refundPolicyText += `- ${fee.daysBeforeCheckIn}일 전까지: 전액 환불\n`;
        } else if (refundRate > 0) {
          refundPolicyText += `- ${fee.daysBeforeCheckIn}일 전: ${refundRate}% 환불\n`;
        } else {
          refundPolicyText += `- ${fee.daysBeforeCheckIn}일 전: 환불 불가\n`;
        }
      }
      refundPolicyText += '- 당일 및 NO-SHOW: 환불 불가';

      const message =
        `[예스트래블] 예약 확정 안내\n\n` +
        `안녕하세요, ${order.customerName} 고객님.\n\n` +
        `${order.customerName} 고객님의 ${productName} 예약이 아래와 같이 확정되었습니다.\n\n` +
        `★ 예약 확정 정보\n` +
        `투숙일: ${checkInDate}\n` +
        `객실 타입: ${optionName}\n` +
        `선택옵션: ${optionName}\n` +
        `주문번호: ${order.orderNumber}\n` +
        `예약번호: ${order.orderNumber}\n\n` +
        `★ 취소 및 변경 규정\n` +
        `이용일 기준\n` +
        `${refundPolicyText}\n\n` +
        `취소/변경은 공휴일, 주말 제외 영업일 기준 17시 이전 접수분에 적용됩니다.\n\n` +
        `★ 고객센터 안내\n` +
        `궁금한 사항이 있으시면 고객센터로 문의해 주세요.\n` +
        `고객센터: ${this.CS_LINK}\n\n` +
        `즐거운 여행 되시길 바랍니다.\n` +
        `감사합니다.`;

      await this.smtntService.sendAlimtalk({
        phone: order.customerPhone,
        message,
        templateCode: 'SHOP_HOTEL_RESERVATION_CONFIRMED',
        failedType: 'LMS',
        failedMessage: message,
      });

      this.logger.log(`호텔 예약 확정 알림톡 발송 성공: orderId=${order.id}`);
    } catch (error) {
      this.logger.error(
        `호텔 예약 확정 알림톡 발송 실패: orderId=${order.id}`,
        error
      );
    }
  }

  /**
   * 주문 상태 되돌리기
   * 이전 단계로 상태를 되돌림 (Hotel만 지원)
   */
  async revertStatus(input: RevertStatusInput): Promise<RevertStatusResponse> {
    const { orderId } = input;

    const order = await this.repositoryProvider.OrderRepository.findOneOrFail({
      where: { id: orderId },
    }).catch(() => {
      throw new NotFoundException(`주문을 찾을 수 없습니다. (id: ${orderId})`);
    });

    const HOTEL_REVERT_MAP: Partial<
      Record<OrderStatusEnumType, OrderStatusEnumType>
    > = {
      PENDING_RESERVATION: 'PAID',
      RESERVATION_CONFIRMED: 'PENDING_RESERVATION',
    };

    // Delivery는 아직 미지원
    const revertMap = order.type === 'HOTEL' ? HOTEL_REVERT_MAP : {};

    const previousStatus = order.status;
    const revertedStatus = revertMap[previousStatus];

    if (!revertedStatus) {
      throw new BadRequestException(
        `${ORDER_STATUS_LABELS[previousStatus]} 상태에서 이전 상태로 되돌릴 수 없습니다.`
      );
    }

    order.status = revertedStatus;
    await this.repositoryProvider.OrderRepository.save(order);

    // 주문 이력: STATUS_REVERTED
    await this.orderHistoryService.record({
      orderId: order.id,
      previousStatus,
      newStatus: revertedStatus,
      actorType: 'ADMIN',
      action: 'STATUS_REVERTED',
      description: `${ORDER_STATUS_LABELS[previousStatus]} 에서 ${ORDER_STATUS_LABELS[revertedStatus]} 상태로 되돌렸습니다.`,
    });

    return {
      success: true,
      orderId: order.id,
    };
  }

  /**
   * 어드민 직접 주문 취소 (Claim 없이)
   * - 포트원 환불 API 호출
   * - Order 상태: (현재 상태) → CANCELLED
   * - Payment nowAmount 차감
   */
  async cancelOrder(input: CancelOrderInput): Promise<CancelOrderResponse> {
    const { orderId, reason, refundAmount } = input;

    // 1. 주문 조회
    const order = await this.repositoryProvider.OrderRepository.findOneOrFail({
      where: { id: orderId },
    }).catch(() => {
      throw new NotFoundException(`주문을 찾을 수 없습니다. (id: ${orderId})`);
    });

    // CANCELLED 상태에서는 취소 불가
    if (order.status === 'CANCELLED') {
      throw new BadRequestException('이미 취소된 주문입니다.');
    }

    // 2. Payment 조회
    const payment = await this.repositoryProvider.PaymentRepository.findOne({
      where: { orderId },
    });

    if (!payment) {
      throw new BadRequestException('결제 정보를 찾을 수 없습니다.');
    }

    // 3. 포트원 결제 취소 (실패 시 @Transactional이 DB 롤백)
    const paymentId = orderNumberParser.encode([orderId], order.createdAt);
    await this.shopPaymentService.cancelPayment(
      paymentId,
      `어드민 직접 취소 - ${reason}`,
      refundAmount
    );

    // 4. 주문 상태 변경
    const previousStatus = order.status;
    order.status = 'CANCELLED';
    await this.repositoryProvider.OrderRepository.save(order);

    await this.shopPaymentService.restoreHotelSkuQuantityFromOrder(order);

    // 5. Payment nowAmount 차감
    payment.nowAmount = payment.paidAmount - refundAmount;
    await this.repositoryProvider.PaymentRepository.save(payment);

    // 주문 이력: ADMIN_CANCELLED
    await this.orderHistoryService.record({
      orderId,
      previousStatus,
      newStatus: 'CANCELLED',
      actorType: 'ADMIN',
      action: 'ADMIN_CANCELLED',
      description: `관리자가 주문을 직접 취소했습니다. 사유: ${reason}`,
    });

    // 주문 이력: REFUND_PROCESSED
    await this.orderHistoryService.record({
      orderId,
      previousStatus: 'CANCELLED',
      newStatus: 'CANCELLED',
      actorType: 'ADMIN',
      action: 'REFUND_PROCESSED',
      description: `환불이 처리되었습니다. 환불금액: ${refundAmount.toLocaleString()}원`,
      metadata: { refundAmount },
    });

    return {
      success: true,
      orderId,
      refundAmount,
    };
  }

  /**
   * 주문 상세 조회
   */
  async findById(input: FindByIdInput): Promise<OrderDetailResponse> {
    const { id, partnerScope } = input;

    const order = await this.repositoryProvider.OrderRepository.findOneOrFail({
      where: { id },
      relations: ['product', 'campaign', 'influencer', 'payments'],
    }).catch(() => {
      throw new NotFoundException(`주문을 찾을 수 없습니다. (id: ${id})`);
    });

    this.verifyPartnerOwnership(order, partnerScope);

    const orderOptionSnapshot =
      order.orderOptionSnapshot as HotelOrderOptionData;

    // 결제 정보 계산
    const latestPayment = order.payments?.[0];
    const productAmount = order.totalAmount;
    const refundAmount = latestPayment
      ? latestPayment.paidAmount - latestPayment.nowAmount
      : 0;

    return {
      id: order.id,
      orderNumber: orderNumberParser.encode([order.id], order.createdAt),
      type: order.type,
      status: order.status,
      statusLabel: ORDER_STATUS_LABELS[order.status],
      statusDate: latestPayment?.paidAt ?? order.updatedAt,

      // 캠페인/인플루언서 정보
      campaignId: order.campaignId,
      campaignName: order.campaign.title,
      influencerId: order.influencerId,
      influencerName: order.influencer.name,

      // 주문 일시
      orderedAt: order.createdAt,

      // 주문 아이템 목록 (현재는 단일 아이템)
      items: [
        {
          id: order.id,
          productName: order.product.name,
          optionName: orderOptionSnapshot?.hotelOptionName ?? '',
          checkInDate: orderOptionSnapshot?.checkInDate,
          checkOutDate: orderOptionSnapshot?.checkOutDate,
          amount: order.totalAmount,
        },
      ],

      // 결제 정보
      payment: {
        paymentMethod: this.getPaymentMethod(latestPayment?.pgRawData),
        productAmount,
        refundAmount,
        totalAmount: productAmount - refundAmount,
        paidAt: latestPayment?.paidAt,
      },

      // 회원 정보
      member: {
        name: order.customerName,
        phone: order.customerPhone,
      },
    };
  }

  private getPaymentMethod(
    pgRawData: Record<string, any> | null | undefined
  ): string {
    if (!pgRawData?.method) return '미결제';

    const method = pgRawData.method;

    if (method.provider) {
      const easyPayMap: Record<string, string> = {
        KAKAOPAY: '카카오페이',
        NAVERPAY: '네이버페이',
        TOSSPAY: '토스페이',
        PAYCO: '페이코',
        SAMSUNGPAY: '삼성페이',
        APPLEPAY: '애플페이',
      };
      return easyPayMap[method.provider] ?? method.provider;
    }

    const methodTypeMap: Record<string, string> = {
      PaymentMethodCard: '신용카드',
      PaymentMethodVirtualAccount: '무통장입금',
      PaymentMethodTransfer: '계좌이체',
      PaymentMethodMobile: '휴대폰결제',
      PaymentMethodEasyPay: '간편결제',
    };
    return methodTypeMap[method.type] ?? '카드결제';
  }

  /**
   * 주문 데이터를 엑셀 파일로 내보내기
   * - 필터 조건으로 전체 데이터 조회 (pagination 없이)
   * - 엑셀 파일 생성 후 S3 업로드
   * - presigned URL 반환
   */
  async exportToExcel(
    input: ExportToExcelInput
  ): Promise<ExportToExcelResponse> {
    const {
      type,
      status,
      periodFilterType,
      startDate,
      endDate,
      campaignId,
      influencerIds,
      productId,
      searchQuery,
      partnerScope,
    } = input;

    // Where 조건 생성
    const baseWhere: FindOptionsWhere<OrderEntity> = {};

    if (type) baseWhere.type = type;
    // 클레임 기반 상태는 엑셀에서는 기본 상태로만 필터
    if (
      status &&
      status !== 'CANCEL_REQUESTED' &&
      status !== 'RETURN_REQUESTED'
    ) {
      baseWhere.status = status as OrderEntity['status'];
    }
    if (campaignId) baseWhere.campaignId = campaignId;
    if (productId) baseWhere.productId = productId;
    if (influencerIds && influencerIds.length > 0) {
      baseWhere.influencerId = In(influencerIds);
    }

    // 기간 필터
    if (startDate && endDate) {
      const dateColumn = this.getDateColumn(periodFilterType);
      (baseWhere as Record<string, unknown>)[dateColumn] = Between(
        new Date(startDate),
        new Date(endDate)
      );
    }

    // 검색어 필터
    let whereConditions: FindOptionsWhere<OrderEntity>[];
    if (searchQuery) {
      whereConditions = [
        { ...baseWhere, customerName: ILike(`%${searchQuery}%`) },
        { ...baseWhere, customerPhone: ILike(`%${searchQuery}%`) },
      ];
    } else {
      whereConditions = [baseWhere];
    }

    // INFLUENCER 스코핑: where 조건에 추가
    if (partnerScope && partnerScope.authType === 'INFLUENCER') {
      for (const condition of whereConditions) {
        condition.influencerId = partnerScope.influencerId;
      }
    }

    // 전체 데이터 조회 (pagination 없이, payments 포함)
    let orders: OrderEntity[];

    if (partnerScope && partnerScope.authType === 'BRAND') {
      // BRAND 스코핑: Product JOIN 필요 → QueryBuilder 사용
      const qb = this.repositoryProvider.OrderRepository.createQueryBuilder(
        'ord'
      )
        .leftJoinAndSelect('ord.product', 'product')
        .leftJoinAndSelect('ord.campaign', 'campaign')
        .leftJoinAndSelect('ord.influencer', 'influencer')
        .leftJoinAndSelect('ord.payments', 'payments');

      // Partner scope 적용 (product는 이미 'product' alias로 JOIN됨)
      this.applyPartnerScope(qb, partnerScope, 'ord', 'product');

      if (type) qb.andWhere('ord.type = :type', { type });
      if (
        status &&
        status !== 'CANCEL_REQUESTED' &&
        status !== 'RETURN_REQUESTED'
      ) {
        qb.andWhere('ord.status = :status', { status });
      }
      if (campaignId)
        qb.andWhere('ord.campaignId = :campaignId', { campaignId });
      if (productId) qb.andWhere('ord.productId = :productId', { productId });
      if (influencerIds && influencerIds.length > 0) {
        qb.andWhere('ord.influencerId IN (:...influencerIds)', {
          influencerIds,
        });
      }
      if (startDate && endDate) {
        const dateColumn = this.getDateColumn(periodFilterType);
        qb.andWhere(`ord.${dateColumn} BETWEEN :startDate AND :endDate`, {
          startDate,
          endDate,
        });
      }
      if (searchQuery) {
        qb.andWhere(
          '(ord.customerName ILIKE :searchQuery OR ord.customerPhone ILIKE :searchQuery)',
          { searchQuery: `%${searchQuery}%` }
        );
      }

      qb.orderBy('ord.createdAt', 'DESC');

      orders = await qb.getMany();
    } else {
      orders = await this.repositoryProvider.OrderRepository.find({
        where: whereConditions,
        relations: ['product', 'campaign', 'influencer', 'payments'],
        order: { createdAt: 'DESC' },
      });
    }

    // 엑셀 워크북 생성
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('주문목록');

    // 컬럼 정의 (헤더 + 너비)
    worksheet.columns = [
      { header: '주문번호', key: 'orderNumber', width: 15 },
      { header: '타입', key: 'type', width: 10 },
      { header: '주문상태', key: 'status', width: 12 },
      { header: '주문일시', key: 'orderedAt', width: 18 },
      { header: '결제일시', key: 'paidAt', width: 18 },
      { header: '캠페인', key: 'campaign', width: 20 },
      { header: '인플루언서', key: 'influencer', width: 15 },
      { header: '상품', key: 'product', width: 25 },
      { header: '옵션', key: 'option', width: 15 },
      { header: '이용일', key: 'usageDate', width: 25 },
      { header: '주문수량', key: 'orderQty', width: 10 },
      { header: '환불수량', key: 'refundQty', width: 10 },
      { header: '총 수량', key: 'totalQty', width: 10 },
      { header: '상품금액', key: 'productPrice', width: 12 },
      { header: '상품 결제금액', key: 'productAmount', width: 14 },
      { header: '총 배송비', key: 'shippingFee', width: 12 },
      { header: '총 결제금액', key: 'totalAmount', width: 14 },
      { header: '상품 환불금액', key: 'productRefund', width: 14 },
      { header: '총 환불금액', key: 'totalRefund', width: 14 },
      { header: '최종 주문금액', key: 'finalAmount', width: 14 },
      { header: '결제수단', key: 'paymentMethod', width: 12 },
      { header: '요청사항', key: 'request', width: 20 },
      { header: 'imp_uid', key: 'impUid', width: 20 },
      { header: '구매자', key: 'buyerName', width: 10 },
      { header: '구매자 연락처', key: 'buyerPhone', width: 15 },
      { header: '수령인 (이용자)', key: 'recipientName', width: 12 },
      { header: '수령인 연락처', key: 'recipientPhone', width: 15 },
    ];

    // 데이터 추가
    for (const order of orders) {
      const orderOptionSnapshot =
        order.orderOptionSnapshot as HotelOrderOptionData;
      const latestPayment = order.payments?.[0];

      // 환불금액 계산
      const paidAmount = latestPayment?.paidAmount ?? order.totalAmount;
      const nowAmount = latestPayment?.nowAmount ?? order.totalAmount;
      const refundAmount = paidAmount - nowAmount;

      // 이용일 (체크인 ~ 체크아웃)
      const usageDate =
        order.type === 'HOTEL' && orderOptionSnapshot?.checkInDate
          ? `${orderOptionSnapshot.checkInDate} ~ ${orderOptionSnapshot.checkOutDate ?? ''}`
          : '-';

      worksheet.addRow([
        orderNumberParser.encode([order.id], order.createdAt),
        order.type,
        ORDER_STATUS_LABELS[order.status],
        dayjs(order.createdAt).format('YYYY-MM-DD HH:mm'),
        latestPayment?.paidAt
          ? dayjs(latestPayment.paidAt).format('YYYY-MM-DD HH:mm')
          : '-',
        order.campaign.title,
        order.influencer.name,
        order.product.name,
        order.type === 'HOTEL'
          ? (orderOptionSnapshot?.hotelOptionName ?? '-')
          : '-',
        usageDate,
        '-', // 주문수량 - 호텔은 수량 개념 없음
        '-', // 환불수량
        '-', // 총 수량
        order.product.price,
        order.totalAmount,
        '-', // 총 배송비 - 호텔은 배송비 없음
        order.totalAmount,
        refundAmount > 0 ? refundAmount : '-',
        refundAmount > 0 ? refundAmount : '-',
        nowAmount,
        latestPayment?.pgRawData
          ? this.getPaymentMethod(latestPayment.pgRawData)
          : '-',
        '-', // 요청사항 - 스키마에 없음
        latestPayment?.impUid ?? '-',
        order.customerName,
        order.customerPhone,
        order.customerName, // 수령인 - 호텔은 구매자=이용자
        order.customerPhone,
      ]);
    }

    // 버퍼로 변환
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());

    // 파일명 생성 (타임스탬프 포함)
    const timestamp = dayjs().format('YYYYMMDD_HHmmss');
    const fileName = `orders_${timestamp}.xlsx`;

    // S3 업로드
    const { fileKey } = await this.s3Service.uploadBuffer({
      buffer,
      fileName,
      path: 'exports/orders',
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // presigned URL 생성 (1시간 유효)
    const downloadUrl = await this.s3Service.generateDownloadUrl(fileKey, 3600);

    return {
      downloadUrl,
      fileName,
      totalCount: orders.length,
    };
  }

  /**
   * applyPartnerScope - QueryBuilder에 partner scope 조건 추가
   * @param productAlias 이미 JOIN된 product alias가 있으면 전달 (이중 JOIN 방지)
   */
  private applyPartnerScope(
    qb: SelectQueryBuilder<OrderEntity>,
    partnerScope?: PartnerScope,
    alias = 'ord',
    productAlias?: string
  ): void {
    if (!partnerScope || partnerScope.authType === 'ADMIN') return;

    if (partnerScope.authType === 'INFLUENCER') {
      qb.andWhere(`${alias}.influencerId = :scopeInfluencerId`, {
        scopeInfluencerId: partnerScope.influencerId,
      });
    } else if (partnerScope.authType === 'BRAND') {
      if (productAlias) {
        // 이미 JOIN된 경우 WHERE만 추가
        qb.andWhere(`${productAlias}.brandId = :scopeBrandId`, {
          scopeBrandId: partnerScope.brandId,
        });
      } else {
        // JOIN이 없는 경우 새로 JOIN
        qb.innerJoin(
          `${alias}.product`,
          'scopeProduct',
          'scopeProduct.brandId = :scopeBrandId',
          { scopeBrandId: partnerScope.brandId }
        );
      }
    }
  }

  /**
   * verifyPartnerOwnership - 단건 조회 결과의 partner 소유권 검증
   */
  private verifyPartnerOwnership(
    order: OrderEntity,
    partnerScope?: PartnerScope
  ): void {
    if (!partnerScope || partnerScope.authType === 'ADMIN') return;

    if (partnerScope.authType === 'INFLUENCER') {
      if (order.influencerId !== partnerScope.influencerId) {
        throw new NotFoundException('주문을 찾을 수 없습니다');
      }
    } else if (partnerScope.authType === 'BRAND') {
      if (order.product?.brandId !== partnerScope.brandId) {
        throw new NotFoundException('주문을 찾을 수 없습니다');
      }
    }
  }
}

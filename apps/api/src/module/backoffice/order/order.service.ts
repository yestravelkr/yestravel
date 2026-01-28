import { Injectable, NotFoundException } from '@nestjs/common';
import { Between, FindOptionsWhere, ILike, In } from 'typeorm';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import {
  ORDER_STATUS_ENUM_VALUE,
  OrderEntity,
  orderNumberParser,
} from '@src/module/backoffice/domain/order/order.entity';
import { ORDER_STATUS_LABELS } from '@src/module/backoffice/domain/order/order-status';
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
} from './order.dto';
import type { Nullish } from '@src/types/utility.type';

@Injectable()
export class OrderService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

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
    } = input;

    // Where 조건 생성 (OrderEntity는 soft delete 없음)
    const baseWhere: FindOptionsWhere<OrderEntity> = {};

    if (type) baseWhere.type = type;
    if (status) baseWhere.status = status;
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

    // 데이터 조회 (find + relations 사용)
    const [orders, total] =
      await this.repositoryProvider.OrderRepository.findAndCount({
        where: whereConditions,
        relations: ['product', 'campaign', 'influencer'],
        order: { [this.getSortColumn(orderBy)]: order },
        skip: (page - 1) * limit,
        take: limit,
      });

    // Response 포맷팅
    const data: OrderListItem[] = orders.map(order => {
      const orderOptionSnapshot =
        order.orderOptionSnapshot as HotelOrderOptionData;

      return {
        id: order.id,
        orderNumber: orderNumberParser.encode([order.id], order.createdAt),
        type: order.type,
        status: order.status,
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
    } = input;

    // QueryBuilder 사용 (GROUP BY 필요)
    const qb = this.repositoryProvider.OrderRepository.createQueryBuilder('ord')
      .select('ord.status', 'status')
      .addSelect('COUNT(*)', 'count');

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

    // 초기값 설정
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
      CANCELLED: 0,
      RETURN_REQUESTED: 0,
      RETURNING: 0,
      RETURNED: 0,
    };

    // 결과 매핑
    let totalCount = 0;
    for (const result of results) {
      const status = result.status as keyof Omit<StatusCounts, 'ALL'>;
      const count = parseInt(result.count, 10);
      if (ORDER_STATUS_ENUM_VALUE.includes(status as any)) {
        counts[status] = count;
        totalCount += count;
      }
    }
    counts.ALL = totalCount;

    return counts;
  }

  /**
   * 필터 옵션 조회 (캠페인, 인플루언서, 상품 - 최근 100개씩)
   *
   * soft delete는 TypeORM이 자동 처리 (@DeleteDateColumn)
   */
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    const [campaigns, influencers, products] = await Promise.all([
      // 캠페인 최근 100개
      this.repositoryProvider.CampaignRepository.find({
        select: ['id', 'title'],
        order: { createdAt: 'DESC' },
        take: 100,
      }),
      // 인플루언서 최근 100개 (soft delete 자동 적용)
      this.repositoryProvider.InfluencerRepository.find({
        select: ['id', 'name'],
        order: { createdAt: 'DESC' },
        take: 100,
      }),
      // 상품 최근 100개 (soft delete 자동 적용)
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
   * 주문 상세 조회
   */
  async findById(input: FindByIdInput): Promise<OrderDetailResponse> {
    const { id } = input;

    const order = await this.repositoryProvider.OrderRepository.findOneOrFail({
      where: { id },
      relations: ['product', 'campaign', 'influencer', 'payments'],
    }).catch(() => {
      throw new NotFoundException(`주문을 찾을 수 없습니다. (id: ${id})`);
    });

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
        paymentMethod: latestPayment?.pgProvider ?? '미결제',
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
}

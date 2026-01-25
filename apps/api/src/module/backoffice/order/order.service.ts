import { Injectable } from '@nestjs/common';
import { Between, FindOptionsWhere, ILike, In } from 'typeorm';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import {
  ORDER_STATUS_ENUM_VALUE,
  OrderEntity,
  orderNumberParser,
} from '@src/module/backoffice/domain/order/order.entity';
import type { HotelOrderOptionData } from '@src/module/backoffice/domain/order/hotel-order.entity';
import type {
  FindAllOrdersInput,
  OrderListResponse,
  OrderListItem,
  StatusCounts,
  FilterOptionsResponse,
} from './order.dto';

@Injectable()
export class OrderService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  /**
   * 주문 목록 조회 (필터링 + 페이지네이션 + 상태별 카운트)
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

    // 상태별 카운트 조회 (같은 필터 조건 적용, 상태 필터 제외)
    const statusCounts = await this.getStatusCounts(input);

    // Response 포맷팅
    const data: OrderListItem[] = orders.map(order => {
      const orderOptionSnapshot =
        order.orderOptionSnapshot as HotelOrderOptionData;

      return {
        id: order.id,
        orderNumber: orderNumberParser.encode([order.id])[0],
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
      statusCounts,
    };
  }

  /**
   * 상태별 카운트 조회
   */
  private async getStatusCounts(
    input: FindAllOrdersInput
  ): Promise<StatusCounts> {
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
      COMPLETED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
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
   */
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    const [campaigns, influencers, products] = await Promise.all([
      // 캠페인 최근 100개 (deletedAt 없음)
      this.repositoryProvider.CampaignRepository.find({
        select: ['id', 'title'],
        order: { createdAt: 'DESC' },
        take: 100,
      }),
      // 인플루언서 최근 100개 (soft delete 적용)
      this.repositoryProvider.InfluencerRepository.createQueryBuilder(
        'influencer'
      )
        .select(['influencer.id', 'influencer.name'])
        .where('influencer.deletedAt IS NULL')
        .orderBy('influencer.createdAt', 'DESC')
        .take(100)
        .getMany(),
      // 상품 최근 100개 (soft delete 적용)
      this.repositoryProvider.ProductRepository.createQueryBuilder('product')
        .select(['product.id', 'product.name'])
        .where('product.deletedAt IS NULL')
        .orderBy('product.createdAt', 'DESC')
        .take(100)
        .getMany(),
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
  private getDateColumn(periodFilterType: string | null | undefined): string {
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
}

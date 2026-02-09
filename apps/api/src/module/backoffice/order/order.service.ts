import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Between, FindOptionsWhere, ILike, In } from 'typeorm';
import * as ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { S3Service } from '@src/module/shared/aws/s3.service';
import {
  ORDER_STATUS_ENUM_VALUE,
  OrderEntity,
  orderNumberParser,
} from '@src/module/backoffice/domain/order/order.entity';
import {
  ORDER_STATUS_LABELS,
  canTransition,
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
  ExportToExcelInput,
  ExportToExcelResponse,
} from './order.dto';
import type { Nullish } from '@src/types/utility.type';

@Injectable()
export class OrderService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly s3Service: S3Service
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
    } else {
      // 일반 필터: 기존 로직 + claims relation 추가
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

    return {
      success: true,
      orderId: order.id,
      previousStatus,
      newStatus,
    };
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

    // 전체 데이터 조회 (pagination 없이, payments 포함)
    const orders = await this.repositoryProvider.OrderRepository.find({
      where: whereConditions,
      relations: ['product', 'campaign', 'influencer', 'payments'],
      order: { createdAt: 'DESC' },
    });

    // 엑셀 워크북 생성
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('주문목록');

    // 컬럼 정의 (27개)
    worksheet.columns = [
      { header: '주문번호', key: 'orderNumber', width: 15 },
      { header: '타입', key: 'type', width: 10 },
      { header: '주문상태', key: 'status', width: 12 },
      { header: '주문일시', key: 'createdAt', width: 18 },
      { header: '결제일시', key: 'paidAt', width: 18 },
      { header: '캠페인', key: 'campaignName', width: 20 },
      { header: '인플루언서', key: 'influencerName', width: 15 },
      { header: '상품', key: 'productName', width: 25 },
      { header: '옵션', key: 'optionName', width: 15 },
      { header: '이용일', key: 'usageDate', width: 25 },
      { header: '주문수량', key: 'orderQuantity', width: 10 },
      { header: '환불수량', key: 'refundQuantity', width: 10 },
      { header: '총 수량', key: 'totalQuantity', width: 10 },
      { header: '상품금액', key: 'productAmount', width: 12 },
      { header: '상품 결제금액', key: 'productPaidAmount', width: 14 },
      { header: '총 배송비', key: 'shippingFee', width: 12 },
      { header: '총 결제금액', key: 'totalPaidAmount', width: 14 },
      { header: '상품 환불금액', key: 'productRefundAmount', width: 14 },
      { header: '총 환불금액', key: 'totalRefundAmount', width: 14 },
      { header: '최종 주문금액', key: 'finalAmount', width: 14 },
      { header: '결제수단', key: 'paymentMethod', width: 12 },
      { header: '요청사항', key: 'requestNote', width: 20 },
      { header: 'imp_uid', key: 'impUid', width: 20 },
      { header: '구매자', key: 'customerName', width: 10 },
      { header: '구매자 연락처', key: 'customerPhone', width: 15 },
      { header: '수령인 (이용자)', key: 'recipientName', width: 12 },
      { header: '수령인 연락처', key: 'recipientPhone', width: 15 },
    ];

    // 헤더 스타일 적용
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

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

      worksheet.addRow({
        orderNumber: orderNumberParser.encode([order.id], order.createdAt),
        type: order.type,
        status: ORDER_STATUS_LABELS[order.status],
        createdAt: dayjs(order.createdAt).format('YYYY-MM-DD HH:mm'),
        paidAt: latestPayment?.paidAt
          ? dayjs(latestPayment.paidAt).format('YYYY-MM-DD HH:mm')
          : '-',
        campaignName: order.campaign.title,
        influencerName: order.influencer.name,
        productName: order.product.name,
        optionName:
          order.type === 'HOTEL'
            ? (orderOptionSnapshot?.hotelOptionName ?? '-')
            : '-',
        usageDate,
        orderQuantity: '-', // 호텔은 수량 개념 없음
        refundQuantity: '-',
        totalQuantity: '-',
        productAmount: order.product.price,
        productPaidAmount: order.totalAmount,
        shippingFee: '-', // 호텔은 배송비 없음
        totalPaidAmount: order.totalAmount,
        productRefundAmount: refundAmount > 0 ? refundAmount : '-',
        totalRefundAmount: refundAmount > 0 ? refundAmount : '-',
        finalAmount: nowAmount,
        paymentMethod: latestPayment?.pgRawData
          ? this.getPaymentMethod(latestPayment.pgRawData)
          : '-',
        requestNote: '-', // 스키마에 없음
        impUid: latestPayment?.impUid ?? '-',
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        recipientName: order.customerName, // 호텔은 구매자=이용자
        recipientPhone: order.customerPhone,
      });
    }

    // 버퍼로 변환
    const buffer = await workbook.xlsx.writeBuffer();

    // 파일명 생성 (타임스탬프 포함)
    const timestamp = dayjs().format('YYYYMMDD_HHmmss');
    const fileName = `orders_${timestamp}.xlsx`;

    // S3 업로드
    const { fileKey } = await this.s3Service.uploadBuffer({
      buffer: Buffer.from(buffer),
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
}

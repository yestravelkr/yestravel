import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Between, FindOptionsWhere, In, IsNull } from 'typeorm';
import * as ExcelJS from 'exceljs';
import dayjs from 'dayjs';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { S3Service } from '@src/module/shared/aws/s3.service';
import {
  InfluencerSettlementEntity,
  getInfluencerSettlementRepository,
} from '@src/module/backoffice/domain/settlement/influencer-settlement.entity';
import {
  BrandSettlementEntity,
  getBrandSettlementRepository,
} from '@src/module/backoffice/domain/settlement/brand-settlement.entity';
import { SETTLEMENT_STATUS } from '@src/module/backoffice/domain/settlement/settlement.entity';
import { OrderEntity } from '@src/module/backoffice/domain/order/order.entity';
import type { HotelOrderOptionData } from '@src/module/backoffice/domain/order/hotel-order.entity';
import { SettlementCalculatorFactory } from './calculator/settlement-calculator.factory';
import type {
  FindAllSettlementsInput,
  FindInfluencerSettlementByIdInput,
  FindBrandSettlementByIdInput,
  CreateInfluencerSettlementInput,
  CreateBrandSettlementInput,
  CompleteSettlementsInput,
  ExportSettlementToExcelInput,
  InfluencerSettlementDetailResponse,
  BrandSettlementDetailResponse,
  SettlementFilterOptionsResponse,
  CreateSettlementResponse,
  CompleteSettlementsResponse,
  ExportSettlementToExcelResponse,
} from './settlement.dto';

interface FindAllSettlementsResult {
  influencerSettlements: InfluencerSettlementEntity[];
  brandSettlements: BrandSettlementEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class SettlementService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly s3Service: S3Service,
    private readonly calculatorFactory: SettlementCalculatorFactory
  ) {}

  /**
   * 정산 목록 조회 (인플루언서 + 브랜드 통합)
   */
  async findAll(
    input: FindAllSettlementsInput
  ): Promise<FindAllSettlementsResult> {
    const {
      page = 1,
      limit = 50,
      status,
      targetType,
      campaignId,
      targetId,
      periodYear,
      periodMonth,
    } = input;

    const skip = (page - 1) * limit;
    const filterBase = { status, targetId, periodYear, periodMonth, campaignId };

    if (targetType === 'INFLUENCER') {
      const { data, total } = await this.findInfluencerSettlements({
        ...filterBase,
        skip,
        take: limit,
      });

      return {
        influencerSettlements: data,
        brandSettlements: [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    if (targetType === 'BRAND') {
      const { data, total } = await this.findBrandSettlements({
        ...filterBase,
        skip,
        take: limit,
      });

      return {
        influencerSettlements: [],
        brandSettlements: data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    // targetType 미지정: 양쪽 모두 조회
    const [influencerResult, brandResult] = await Promise.all([
      this.findInfluencerSettlements({ ...filterBase, skip, take: limit }),
      this.findBrandSettlements({ ...filterBase, skip, take: limit }),
    ]);

    return {
      influencerSettlements: influencerResult.data,
      brandSettlements: brandResult.data,
      total: influencerResult.total + brandResult.total,
      page,
      limit,
      totalPages: Math.ceil((influencerResult.total + brandResult.total) / limit),
    };
  }

  private async findInfluencerSettlements(filter: {
    status?: string | null;
    targetId?: number | null;
    periodYear?: number | null;
    periodMonth?: number | null;
    campaignId?: number | null;
    skip?: number;
    take?: number;
  }): Promise<{ data: InfluencerSettlementEntity[]; total: number }> {
    const where: FindOptionsWhere<InfluencerSettlementEntity> = {};

    if (filter.status) where.status = filter.status as InfluencerSettlementEntity['status'];
    if (filter.targetId) where.influencerId = filter.targetId;
    if (filter.periodYear) where.periodYear = filter.periodYear;
    if (filter.periodMonth) where.periodMonth = filter.periodMonth;

    const [data, total] = await getInfluencerSettlementRepository().findAndCount({
      where,
      relations: ['influencer'],
      order: { scheduledAt: 'ASC' },
      skip: filter.skip,
      take: filter.take,
    });

    return { data, total };
  }

  private async findBrandSettlements(filter: {
    status?: string | null;
    targetId?: number | null;
    periodYear?: number | null;
    periodMonth?: number | null;
    campaignId?: number | null;
    skip?: number;
    take?: number;
  }): Promise<{ data: BrandSettlementEntity[]; total: number }> {
    const where: FindOptionsWhere<BrandSettlementEntity> = {};

    if (filter.status) where.status = filter.status as BrandSettlementEntity['status'];
    if (filter.targetId) where.brandId = filter.targetId;
    if (filter.periodYear) where.periodYear = filter.periodYear;
    if (filter.periodMonth) where.periodMonth = filter.periodMonth;

    const [data, total] = await getBrandSettlementRepository().findAndCount({
      where,
      relations: ['brand'],
      order: { scheduledAt: 'ASC' },
      skip: filter.skip,
      take: filter.take,
    });

    return { data, total };
  }

  /**
   * 인플루언서 정산 상세 조회
   */
  async findInfluencerSettlementById(
    input: FindInfluencerSettlementByIdInput
  ): Promise<InfluencerSettlementDetailResponse> {
    const { id } = input;

    const settlement = await getInfluencerSettlementRepository().findOne({
      where: { id },
      relations: ['influencer', 'orders', 'orders.product', 'orders.campaign'],
    });

    if (!settlement) {
      throw new NotFoundException(
        `인플루언서 정산을 찾을 수 없습니다. (id: ${id})`
      );
    }

    // 캠페인별로 그룹핑
    const campaignGroups = this.groupOrdersByCampaign(
      settlement.orders,
      'INFLUENCER'
    );

    // 계좌 정보 (influencer에서 가져오기)
    const bankAccount = {
      bankName: settlement.influencer?.bankInfo?.name ?? null,
      accountNumber: settlement.influencer?.bankInfo?.accountNumber ?? null,
      accountHolder: settlement.influencer?.bankInfo?.accountHolder ?? null,
    };

    return {
      id: settlement.id,
      influencerId: settlement.influencerId,
      influencerName: settlement.influencer?.name ?? '',
      periodYear: settlement.periodYear,
      periodMonth: settlement.periodMonth,
      status: settlement.status,
      scheduledAt: settlement.scheduledAt,
      completedAt: settlement.completedAt,
      totalSales: settlement.totalSales,
      totalQuantity: settlement.totalQuantity,
      totalAmount: settlement.totalAmount,
      campaignGroups,
      bankAccount,
    };
  }

  /**
   * 브랜드 정산 상세 조회
   */
  async findBrandSettlementById(
    input: FindBrandSettlementByIdInput
  ): Promise<BrandSettlementDetailResponse> {
    const { id } = input;

    const settlement = await getBrandSettlementRepository().findOne({
      where: { id },
      relations: ['brand', 'orders', 'orders.product', 'orders.campaign'],
    });

    if (!settlement) {
      throw new NotFoundException(
        `브랜드 정산을 찾을 수 없습니다. (id: ${id})`
      );
    }

    // 캠페인별로 그룹핑
    const campaignGroups = this.groupOrdersByCampaign(
      settlement.orders,
      'BRAND'
    );

    // 계좌 정보 (brand에서 가져오기)
    const bankAccount = {
      bankName: settlement.brand?.bankInfo?.name ?? null,
      accountNumber: settlement.brand?.bankInfo?.accountNumber ?? null,
      accountHolder: settlement.brand?.bankInfo?.accountHolder ?? null,
    };

    return {
      id: settlement.id,
      brandId: settlement.brandId,
      brandName: settlement.brand?.name ?? '',
      periodYear: settlement.periodYear,
      periodMonth: settlement.periodMonth,
      status: settlement.status,
      scheduledAt: settlement.scheduledAt,
      completedAt: settlement.completedAt,
      totalSales: settlement.totalSales,
      totalQuantity: settlement.totalQuantity,
      totalAmount: settlement.totalAmount,
      campaignGroups,
      bankAccount,
    };
  }

  /**
   * 주문을 캠페인별로 그룹핑
   */
  private groupOrdersByCampaign(
    orders: OrderEntity[],
    targetType: 'INFLUENCER' | 'BRAND'
  ) {
    const campaignMap = new Map<
      number,
      {
        campaignId: number;
        campaignName: string;
        campaignPeriod: string;
        products: Array<{
          productId: number;
          productName: string;
          optionName: string | null;
          quantity: number;
          sales: number;
          settlementAmount: number;
        }>;
        subtotalQuantity: number;
        subtotalSales: number;
        subtotalAmount: number;
      }
    >();

    for (const order of orders) {
      const campaignId = order.campaignId;
      const campaign = order.campaign;

      if (!campaignMap.has(campaignId)) {
        const periodStr = campaign
          ? `${dayjs(campaign.startAt).format('YYYY.MM.DD')} ~ ${dayjs(campaign.endAt).format('YYYY.MM.DD')}`
          : '';

        campaignMap.set(campaignId, {
          campaignId,
          campaignName: campaign?.title ?? '',
          campaignPeriod: periodStr,
          products: [],
          subtotalQuantity: 0,
          subtotalSales: 0,
          subtotalAmount: 0,
        });
      }

      const group = campaignMap.get(campaignId)!;
      const calculator = this.calculatorFactory.getCalculator(order.type);
      const result = calculator.calculate(order);

      const orderOptionSnapshot =
        order.orderOptionSnapshot as HotelOrderOptionData;

      group.products.push({
        productId: order.productId,
        productName: order.product?.name ?? '',
        optionName: orderOptionSnapshot?.hotelOptionName ?? null,
        quantity: result.totalQuantity,
        sales: result.totalSales,
        settlementAmount:
          targetType === 'INFLUENCER'
            ? result.influencerAmount
            : result.brandAmount,
      });

      group.subtotalQuantity += result.totalQuantity;
      group.subtotalSales += result.totalSales;
      group.subtotalAmount +=
        targetType === 'INFLUENCER'
          ? result.influencerAmount
          : result.brandAmount;
    }

    return Array.from(campaignMap.values());
  }

  /**
   * 필터 옵션 조회
   */
  async getFilterOptions(): Promise<SettlementFilterOptionsResponse> {
    const [campaigns, influencers, brands] = await Promise.all([
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
      this.repositoryProvider.BrandRepository.find({
        select: ['id', 'name'],
        order: { createdAt: 'DESC' },
        take: 100,
      }),
    ]);

    // 정산 기간 목록 생성 (최근 12개월)
    const periods = [];
    const now = dayjs();
    for (let i = 0; i < 12; i++) {
      const date = now.subtract(i, 'month');
      periods.push({
        year: date.year(),
        month: date.month() + 1,
        label: `${date.year()}년 ${date.month() + 1}월`,
      });
    }

    return {
      campaigns: campaigns.map(c => ({ id: c.id, name: c.title })),
      influencers: influencers.map(i => ({ id: i.id, name: i.name })),
      brands: brands.map(b => ({ id: b.id, name: b.name })),
      periods,
    };
  }

  /**
   * 인플루언서 정산 생성
   */
  async createInfluencerSettlement(
    input: CreateInfluencerSettlementInput
  ): Promise<CreateSettlementResponse> {
    const { influencerId, periodYear, periodMonth, scheduledAt } = input;

    // 중복 검사
    const existing =
      await getInfluencerSettlementRepository().findByInfluencerAndPeriod(
        influencerId,
        periodYear,
        periodMonth
      );

    if (existing) {
      throw new BadRequestException(
        `해당 기간의 인플루언서 정산이 이미 존재합니다.`
      );
    }

    // 정산 대상 주문 조회 (해당 기간, 해당 인플루언서, 아직 정산 안된 주문)
    const periodStart = dayjs()
      .year(periodYear)
      .month(periodMonth - 1)
      .startOf('month');
    const periodEnd = periodStart.endOf('month');

    const periodOrders = await this.repositoryProvider.OrderRepository.find({
      where: {
        influencerId,
        influencerSettlementId: IsNull(),
        createdAt: Between(periodStart.toDate(), periodEnd.endOf('day').toDate()),
      },
    });

    // 정산금액 계산
    let totalSales = 0;
    let totalQuantity = 0;
    let totalAmount = 0;

    for (const order of periodOrders) {
      const calculator = this.calculatorFactory.getCalculator(order.type);
      const result = calculator.calculate(order);
      totalSales += result.totalSales;
      totalQuantity += result.totalQuantity;
      totalAmount += result.influencerAmount;
    }

    // 정산 생성
    const settlement = new InfluencerSettlementEntity();
    settlement.influencerId = influencerId;
    settlement.periodYear = periodYear;
    settlement.periodMonth = periodMonth;
    settlement.scheduledAt = new Date(scheduledAt);
    settlement.totalSales = totalSales;
    settlement.totalQuantity = totalQuantity;
    settlement.totalAmount = totalAmount;
    settlement.status = SETTLEMENT_STATUS.PENDING;

    const saved = await getInfluencerSettlementRepository().save(settlement);

    // 주문에 정산 연결
    if (periodOrders.length > 0) {
      await this.repositoryProvider.OrderRepository.update(
        { id: In(periodOrders.map(o => o.id)) },
        { influencerSettlementId: saved.id }
      );
    }

    return { id: saved.id, success: true };
  }

  /**
   * 브랜드 정산 생성
   */
  async createBrandSettlement(
    input: CreateBrandSettlementInput
  ): Promise<CreateSettlementResponse> {
    const { brandId, periodYear, periodMonth, scheduledAt } = input;

    // 중복 검사
    const existing = await getBrandSettlementRepository().findByBrandAndPeriod(
      brandId,
      periodYear,
      periodMonth
    );

    if (existing) {
      throw new BadRequestException(
        `해당 기간의 브랜드 정산이 이미 존재합니다.`
      );
    }

    // 정산 대상 주문 조회 (해당 브랜드 상품, 해당 기간, 아직 정산 안된 주문)
    // brand_id는 product를 통해 조회해야 하므로 QueryBuilder 사용
    const periodStart = dayjs()
      .year(periodYear)
      .month(periodMonth - 1)
      .startOf('month');
    const periodEnd = periodStart.endOf('month');

    const periodOrders = await this.repositoryProvider.OrderRepository.find({
      where: {
        product: { brandId },
        brandSettlementId: IsNull(),
        createdAt: Between(periodStart.toDate(), periodEnd.endOf('day').toDate()),
      },
    });

    // 정산금액 계산
    let totalSales = 0;
    let totalQuantity = 0;
    let totalAmount = 0;

    for (const order of periodOrders) {
      const calculator = this.calculatorFactory.getCalculator(order.type);
      const result = calculator.calculate(order);
      totalSales += result.totalSales;
      totalQuantity += result.totalQuantity;
      totalAmount += result.brandAmount;
    }

    // 정산 생성
    const settlement = new BrandSettlementEntity();
    settlement.brandId = brandId;
    settlement.periodYear = periodYear;
    settlement.periodMonth = periodMonth;
    settlement.scheduledAt = new Date(scheduledAt);
    settlement.totalSales = totalSales;
    settlement.totalQuantity = totalQuantity;
    settlement.totalAmount = totalAmount;
    settlement.status = SETTLEMENT_STATUS.PENDING;

    const saved = await getBrandSettlementRepository().save(settlement);

    // 주문에 정산 연결
    if (periodOrders.length > 0) {
      await this.repositoryProvider.OrderRepository.update(
        { id: In(periodOrders.map(o => o.id)) },
        { brandSettlementId: saved.id }
      );
    }

    return { id: saved.id, success: true };
  }

  /**
   * 인플루언서 정산 완료 처리
   */
  async completeInfluencerSettlements(
    input: CompleteSettlementsInput
  ): Promise<CompleteSettlementsResponse> {
    const { ids } = input;

    await getInfluencerSettlementRepository().update(
      { id: In(ids), status: SETTLEMENT_STATUS.PENDING },
      {
        status: SETTLEMENT_STATUS.COMPLETED,
        completedAt: new Date(),
      }
    );

    return { success: true, completedCount: ids.length };
  }

  /**
   * 브랜드 정산 완료 처리
   */
  async completeBrandSettlements(
    input: CompleteSettlementsInput
  ): Promise<CompleteSettlementsResponse> {
    const { ids } = input;

    await getBrandSettlementRepository().update(
      { id: In(ids), status: SETTLEMENT_STATUS.PENDING },
      {
        status: SETTLEMENT_STATUS.COMPLETED,
        completedAt: new Date(),
      }
    );

    return { success: true, completedCount: ids.length };
  }

  /**
   * 정산 엑셀 내보내기
   */
  async exportToExcel(
    input: ExportSettlementToExcelInput
  ): Promise<ExportSettlementToExcelResponse> {
    const { settlementId, targetType } = input;

    let settlementData;
    if (targetType === 'INFLUENCER') {
      settlementData = await this.findInfluencerSettlementById({
        id: settlementId,
      });
    } else {
      settlementData = await this.findBrandSettlementById({ id: settlementId });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('정산내역');

    // 컬럼 정의
    worksheet.columns = [
      { header: '캠페인', key: 'campaignName', width: 25 },
      { header: '상품', key: 'productName', width: 30 },
      { header: '옵션', key: 'optionName', width: 20 },
      { header: '수량', key: 'quantity', width: 10 },
      { header: '매출', key: 'sales', width: 15 },
      { header: '정산금액', key: 'settlementAmount', width: 15 },
    ];

    // 헤더 스타일
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // 데이터 추가
    for (const group of settlementData.campaignGroups) {
      for (const product of group.products) {
        worksheet.addRow({
          campaignName: group.campaignName,
          productName: product.productName,
          optionName: product.optionName ?? '-',
          quantity: product.quantity,
          sales: product.sales,
          settlementAmount: product.settlementAmount,
        });
      }

      // 캠페인별 소계
      worksheet.addRow({
        campaignName: `${group.campaignName} 소계`,
        productName: '',
        optionName: '',
        quantity: group.subtotalQuantity,
        sales: group.subtotalSales,
        settlementAmount: group.subtotalAmount,
      });
    }

    // 총계
    worksheet.addRow({
      campaignName: '총계',
      productName: '',
      optionName: '',
      quantity: settlementData.totalQuantity,
      sales: settlementData.totalSales,
      settlementAmount: settlementData.totalAmount,
    });

    // 버퍼로 변환
    const buffer = await workbook.xlsx.writeBuffer();

    // 파일명 생성
    const targetName =
      targetType === 'INFLUENCER'
        ? (settlementData as InfluencerSettlementDetailResponse).influencerName
        : (settlementData as BrandSettlementDetailResponse).brandName;
    const fileName = `정산_${targetName}_${settlementData.periodYear}년${settlementData.periodMonth}월.xlsx`;

    // S3 업로드
    const { fileKey } = await this.s3Service.uploadBuffer({
      buffer: Buffer.from(buffer),
      fileName,
      path: 'exports/settlements',
      contentType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // presigned URL 생성 (1시간 유효)
    const downloadUrl = await this.s3Service.generateDownloadUrl(fileKey, 3600);

    return { downloadUrl, fileName };
  }
}

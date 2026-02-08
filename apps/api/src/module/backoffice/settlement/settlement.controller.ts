import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { SettlementService } from './settlement.service';
import type {
  FindAllSettlementsInput,
  FindInfluencerSettlementByIdInput,
  FindBrandSettlementByIdInput,
  CreateInfluencerSettlementInput,
  CreateBrandSettlementInput,
  CompleteSettlementsInput,
  ExportSettlementToExcelInput,
  SettlementListResponse,
  InfluencerSettlementDetailResponse,
  BrandSettlementDetailResponse,
  SettlementFilterOptionsResponse,
  CreateSettlementResponse,
  CompleteSettlementsResponse,
  ExportSettlementToExcelResponse,
} from './settlement.dto';
import type { InfluencerSettlementEntity } from '@src/module/backoffice/domain/settlement/influencer-settlement.entity';
import type { BrandSettlementEntity } from '@src/module/backoffice/domain/settlement/brand-settlement.entity';

/**
 * SettlementController - 정산 관리 컨트롤러
 */
@Controller()
export class SettlementController {
  constructor(
    private readonly settlementService: SettlementService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backofficeSettlement.findAll')
  async findAll(
    input: FindAllSettlementsInput
  ): Promise<SettlementListResponse> {
    const result = await this.settlementService.findAll(input);

    const data = [
      ...result.influencerSettlements.map((s: InfluencerSettlementEntity) => ({
        id: s.id,
        targetType: 'INFLUENCER' as const,
        targetId: s.influencerId,
        targetName: s.influencer?.name ?? '',
        periodYear: s.periodYear,
        periodMonth: s.periodMonth,
        status: s.status,
        scheduledAt: s.scheduledAt,
        completedAt: s.completedAt,
        totalSales: s.totalSales,
        totalQuantity: s.totalQuantity,
        totalAmount: s.totalAmount,
        campaignNames: [],
        createdAt: s.createdAt,
      })),
      ...result.brandSettlements.map((s: BrandSettlementEntity) => ({
        id: s.id,
        targetType: 'BRAND' as const,
        targetId: s.brandId,
        targetName: s.brand?.name ?? '',
        periodYear: s.periodYear,
        periodMonth: s.periodMonth,
        status: s.status,
        scheduledAt: s.scheduledAt,
        completedAt: s.completedAt,
        totalSales: s.totalSales,
        totalQuantity: s.totalQuantity,
        totalAmount: s.totalAmount,
        campaignNames: [],
        createdAt: s.createdAt,
      })),
    ].sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    );

    return {
      data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      statusCounts: result.statusCounts,
    };
  }

  @MessagePattern('backofficeSettlement.findInfluencerSettlementById')
  async findInfluencerSettlementById(
    input: FindInfluencerSettlementByIdInput
  ): Promise<InfluencerSettlementDetailResponse> {
    return await this.settlementService.findInfluencerSettlementById(input);
  }

  @MessagePattern('backofficeSettlement.findBrandSettlementById')
  async findBrandSettlementById(
    input: FindBrandSettlementByIdInput
  ): Promise<BrandSettlementDetailResponse> {
    return await this.settlementService.findBrandSettlementById(input);
  }

  @MessagePattern('backofficeSettlement.getFilterOptions')
  async getFilterOptions(): Promise<SettlementFilterOptionsResponse> {
    return await this.settlementService.getFilterOptions();
  }

  @MessagePattern('backofficeSettlement.createInfluencerSettlement')
  @Transactional
  async createInfluencerSettlement(
    input: CreateInfluencerSettlementInput
  ): Promise<CreateSettlementResponse> {
    return await this.settlementService.createInfluencerSettlement(input);
  }

  @MessagePattern('backofficeSettlement.createBrandSettlement')
  @Transactional
  async createBrandSettlement(
    input: CreateBrandSettlementInput
  ): Promise<CreateSettlementResponse> {
    return await this.settlementService.createBrandSettlement(input);
  }

  @MessagePattern('backofficeSettlement.completeInfluencerSettlements')
  @Transactional
  async completeInfluencerSettlements(
    input: CompleteSettlementsInput
  ): Promise<CompleteSettlementsResponse> {
    return await this.settlementService.completeInfluencerSettlements(input);
  }

  @MessagePattern('backofficeSettlement.completeBrandSettlements')
  @Transactional
  async completeBrandSettlements(
    input: CompleteSettlementsInput
  ): Promise<CompleteSettlementsResponse> {
    return await this.settlementService.completeBrandSettlements(input);
  }

  @MessagePattern('backofficeSettlement.exportToExcel')
  async exportToExcel(
    input: ExportSettlementToExcelInput
  ): Promise<ExportSettlementToExcelResponse> {
    return await this.settlementService.exportToExcel(input);
  }
}

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
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

/**
 * SettlementController - 정산 관리 컨트롤러
 */
@Controller()
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @MessagePattern('backofficeSettlement.findAll')
  async findAll(
    input: FindAllSettlementsInput
  ): Promise<SettlementListResponse> {
    return await this.settlementService.findAll(input);
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

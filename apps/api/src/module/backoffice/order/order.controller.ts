import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { OrderService } from './order.service';
import { OrderHistoryService } from './order-history.service';
import type {
  FindAllOrdersInput,
  GetStatusCountsInput,
  OrderListResponse,
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
  GetHistoryInput,
  GetHistoryResponse,
  PartnerScope,
} from './order.dto';

/**
 * OrderController - 주문 관리 컨트롤러
 */
@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderHistoryService: OrderHistoryService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('backofficeOrder.findAll')
  async findAll(
    input: FindAllOrdersInput & { scope: PartnerScope }
  ): Promise<OrderListResponse> {
    return await this.orderService.findAll(input);
  }

  @MessagePattern('backofficeOrder.getStatusCounts')
  async getStatusCounts(
    input: GetStatusCountsInput & { scope: PartnerScope }
  ): Promise<StatusCounts> {
    return await this.orderService.getStatusCounts(input);
  }

  @MessagePattern('backofficeOrder.getFilterOptions')
  async getFilterOptions(input: {
    scope: PartnerScope;
  }): Promise<FilterOptionsResponse> {
    return await this.orderService.getFilterOptions(input.scope);
  }

  @MessagePattern('backofficeOrder.findById')
  async findById(
    input: FindByIdInput & { scope: PartnerScope }
  ): Promise<OrderDetailResponse> {
    return await this.orderService.findById(input);
  }

  @MessagePattern('backofficeOrder.updateStatus')
  @Transactional
  async updateStatus(input: UpdateStatusInput): Promise<UpdateStatusResponse> {
    return await this.orderService.updateStatus(input);
  }

  @MessagePattern('backofficeOrder.revertStatus')
  @Transactional
  async revertStatus(input: RevertStatusInput): Promise<RevertStatusResponse> {
    return await this.orderService.revertStatus(input);
  }

  @MessagePattern('backofficeOrder.cancelOrder')
  @Transactional
  async cancelOrder(input: CancelOrderInput): Promise<CancelOrderResponse> {
    return await this.orderService.cancelOrder(input);
  }

  @MessagePattern('backofficeOrder.exportToExcel')
  async exportToExcel(
    input: ExportToExcelInput
  ): Promise<ExportToExcelResponse> {
    return await this.orderService.exportToExcel(input);
  }

  @MessagePattern('backofficeOrder.getHistory')
  async getHistory(
    input: GetHistoryInput & { scope: PartnerScope }
  ): Promise<GetHistoryResponse> {
    // 소유권 검증 후 히스토리 조회
    await this.orderService.validateOrderAccess(input.orderId, input.scope);
    return await this.orderHistoryService.findByOrderId(input.orderId);
  }
}

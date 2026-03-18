import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { OrderService } from './order.service';
import { OrderHistoryService } from './order-history.service';
import type { PartnerScope } from '@src/shared/auth/partner-scope';
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
  async findAll(input: FindAllOrdersInput): Promise<OrderListResponse> {
    return await this.orderService.findAll(input);
  }

  @MessagePattern('backofficeOrder.getStatusCounts')
  async getStatusCounts(input: GetStatusCountsInput): Promise<StatusCounts> {
    return await this.orderService.getStatusCounts(input);
  }

  @MessagePattern('backofficeOrder.getFilterOptions')
  async getFilterOptions(
    @Payload() input?: { partnerScope?: PartnerScope }
  ): Promise<FilterOptionsResponse> {
    return await this.orderService.getFilterOptions(input);
  }

  @MessagePattern('backofficeOrder.findById')
  async findById(input: FindByIdInput): Promise<OrderDetailResponse> {
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
  async getHistory(input: GetHistoryInput): Promise<GetHistoryResponse> {
    // Partner인 경우 주문 소유권 검증
    if (input.partnerScope && input.partnerScope.authType !== 'ADMIN') {
      await this.orderService.findById({
        id: input.orderId,
        partnerScope: input.partnerScope,
      });
    }
    return await this.orderHistoryService.findByOrderId(input.orderId);
  }
}

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { OrderService } from './order.service';
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
  ExportToExcelInput,
  ExportToExcelResponse,
  CancelOrderInput,
  CancelOrderResponse,
} from './order.dto';

/**
 * OrderController - 주문 관리 컨트롤러
 */
@Controller()
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
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
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    return await this.orderService.getFilterOptions();
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
}

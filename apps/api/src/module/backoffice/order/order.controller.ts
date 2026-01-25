import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { OrderService } from './order.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import type {
  FindAllOrdersInput,
  OrderListResponse,
  FilterOptionsResponse,
} from './order.dto';

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

  @MessagePattern('backofficeOrder.getFilterOptions')
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    return await this.orderService.getFilterOptions();
  }
}

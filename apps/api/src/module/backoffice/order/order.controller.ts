import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { OrderService } from './order.service';
import type {
  FindAllOrdersInput,
  OrderListResponse,
  FilterOptionsResponse,
} from './order.dto';

/**
 * OrderController - 주문 조회 컨트롤러
 *
 * Query만 있으므로 @Transactional 및 TransactionService 불필요
 */
@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern('backofficeOrder.findAll')
  async findAll(input: FindAllOrdersInput): Promise<OrderListResponse> {
    return await this.orderService.findAll(input);
  }

  @MessagePattern('backofficeOrder.getFilterOptions')
  async getFilterOptions(): Promise<FilterOptionsResponse> {
    return await this.orderService.getFilterOptions();
  }
}

import { Controller } from '@nestjs/common';
import { ShopOrderService } from './shop.order.service';

@Controller()
export class ShopOrderController {
  constructor(private readonly shopOrderService: ShopOrderService) {}
}

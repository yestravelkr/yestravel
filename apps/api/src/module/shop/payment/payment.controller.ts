import { Controller, Post, Body, Logger } from '@nestjs/common';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  @Post('complete')
  async complete(@Body() body: any) {
    this.logger.log('Payment complete webhook received');
    this.logger.log(JSON.stringify(body, null, 2));

    return {
      success: true,
      message: 'Payment webhook received',
    };
  }
}

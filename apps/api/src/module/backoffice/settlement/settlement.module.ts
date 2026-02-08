import { Module } from '@nestjs/common';
import { AwsModule } from '@src/module/shared/aws/aws.module';
import { SettlementService } from './settlement.service';
import { SettlementController } from './settlement.controller';
import { SettlementCalculatorFactory } from './calculator/settlement-calculator.factory';
import { HotelSettlementCalculator } from './calculator/hotel-settlement.calculator';
import { ETicketSettlementCalculator } from './calculator/eticket-settlement.calculator';
import { DeliverySettlementCalculator } from './calculator/delivery-settlement.calculator';

@Module({
  imports: [AwsModule],
  controllers: [SettlementController],
  providers: [
    SettlementService,
    SettlementCalculatorFactory,
    HotelSettlementCalculator,
    ETicketSettlementCalculator,
    DeliverySettlementCalculator,
  ],
  exports: [SettlementService],
})
export class SettlementModule {}

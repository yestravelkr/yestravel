import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InfluencerService } from './influencer.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import {
  influencerSchema,
  createInfluencerInputSchema,
  updateInfluencerInputSchema,
} from './influencer.schema';
import type {
  CreateInfluencerInput,
  UpdateInfluencerInput,
  Influencer,
} from './influencer.dto';

@Controller()
export class InfluencerController {
  constructor(
    private readonly influencerService: InfluencerService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('influencer.create')
  @Transactional
  async create(data: CreateInfluencerInput): Promise<Influencer> {
    // Validate input
    const validatedInput = createInfluencerInputSchema.parse(data);
    const influencer = await this.influencerService.create(validatedInput);
    return influencerSchema.parse(influencer);
  }

  @MessagePattern('influencer.update')
  @Transactional
  async update(data: UpdateInfluencerInput): Promise<Influencer> {
    // Validate input
    const validatedInput = updateInfluencerInputSchema.parse(data);
    const influencer = await this.influencerService.update(validatedInput);
    return influencerSchema.parse(influencer);
  }
}

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InfluencerService } from './influencer.service';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { Transactional } from '@src/module/shared/transaction/transaction.decorator';
import {
  influencerSchema,
  createInfluencerInputSchema,
  updateInfluencerInputSchema,
  influencerListSchema,
  createInfluencerManagerOutputSchema,
  influencerManagerListSchema,
} from './influencer.schema';
import type {
  CreateInfluencerInput,
  UpdateInfluencerInput,
  Influencer,
  InfluencerList,
  CreateInfluencerManagerInput,
  CreateInfluencerManagerOutput,
  FindInfluencerManagersInput,
} from './influencer.dto';

@Controller()
export class InfluencerController {
  constructor(
    private readonly influencerService: InfluencerService,
    private readonly transactionService: TransactionService
  ) {}

  @MessagePattern('influencer.findAll')
  async findAll(data: {
    page: number;
    limit: number;
  }): Promise<InfluencerList> {
    const result = await this.influencerService.findAll(data);
    return influencerListSchema.parse(result);
  }

  @MessagePattern('influencer.findById')
  async findById(data: { id: number }): Promise<Influencer> {
    const result = await this.influencerService.findById(data.id);
    return influencerSchema.parse(result);
  }

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

  @MessagePattern('influencer.createManager')
  @Transactional
  async createManager(
    data: CreateInfluencerManagerInput
  ): Promise<CreateInfluencerManagerOutput> {
    const manager = await this.influencerService.createManager(data);
    return createInfluencerManagerOutputSchema.parse(manager);
  }

  @MessagePattern('influencer.findManagers')
  async findManagers(data: FindInfluencerManagersInput) {
    const managers = await this.influencerService.findManagers(
      data.influencerId
    );
    return influencerManagerListSchema.parse(managers);
  }
}

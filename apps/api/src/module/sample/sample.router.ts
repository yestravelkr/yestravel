import { Inject } from '@nestjs/common';
import { SampleService } from '@src/module/sample/sample.service';
import { Input, Query, Router } from 'nestjs-trpc';
import { z } from 'zod';

@Router({ alias: 'sample' })
export class SampleRouter {
  constructor(
    @Inject(SampleService) private readonly sampleService: SampleService
  ) {}

  @Query({
    input: z.object({
      name: z.string().optional(),
    }),
    output: z.string(),
  })
  getHello(@Input('name') name?: string): string {
    return this.sampleService.getHello() + name;
  }

  @Query({
    output: z.string(),
  })
  getSample(): string {
    return this.sampleService.getSample();
  }
}

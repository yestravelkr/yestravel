import { Injectable } from '@nestjs/common';
import { ContextOptions } from 'nestjs-trpc-v2';

@Injectable()
export class TRPCAppContext {
  async create(opts: ContextOptions) {
    return opts;
  }
}

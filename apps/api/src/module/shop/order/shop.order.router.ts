import { Router } from 'nestjs-trpc';
import { Injectable } from '@nestjs/common';
import { BaseTrpcRouter } from '@src/module/trpc/baseTrpcRouter';

@Router({ alias: 'shopOrder' })
@Injectable()
export class ShopOrderRouter extends BaseTrpcRouter {}

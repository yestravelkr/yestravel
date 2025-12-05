import { Router, Query, Mutation, Ctx, Input, UseMiddlewares } from 'nestjs-trpc';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import {BaseTrpcRouter} from "@src/module/trpc/baseTrpcRouter";
import {MicroserviceClient} from "@src/module/trpc/microserviceClient";

@Router({ alias: 'shopProduct' })
@Injectable()
export class ShopProductRouter extends BaseTrpcRouter {

  // TODO: 상품 목록 조회 엔드포인트 추가 예정
  // TODO: 상품 상세 조회 엔드포인트 추가 예정
  // TODO: 상품 검색 엔드포인트 추가 예정
}

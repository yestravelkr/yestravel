import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';

@Injectable()
export class ShopOrderService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}
}

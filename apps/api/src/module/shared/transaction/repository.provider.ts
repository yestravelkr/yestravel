import { Injectable } from '@nestjs/common';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getAdminRepository } from '@src/module/backoffice/domain/login-entity';

@Injectable()
export class RepositoryProvider {
  constructor(private transaction: TransactionService) {}

  get AdminRepository() {
    return getAdminRepository(this.transaction);
  }
}

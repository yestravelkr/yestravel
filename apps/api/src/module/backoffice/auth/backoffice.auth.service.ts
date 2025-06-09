import { Injectable } from '@nestjs/common';
import {RepositoryProvider} from "@src/module/shared/transaction/repository.provider";
import {Ctx} from "nestjs-trpc";
import {AdminEntity} from "@src/module/backoffice/domain/admin.entity";

@Injectable()
export class BackofficeAuthService {
  constructor(
    private readonly repositoryProvider: RepositoryProvider
  ) {}

  async register(email: string, password: string) {
    return this.repositoryProvider.AdminRepository.register(email, password);
  }
}

import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';

@Injectable()
export class ShopProductService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  // TODO: 상품 목록 조회 로직 추가 예정
  // async findAll() {}

  // TODO: 상품 상세 조회 로직 추가 예정
  // async findById(id: number) {}

  // TODO: 상품 검색 로직 추가 예정
  // async search(query: string) {}
}

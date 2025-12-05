import { Injectable } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';

interface ProductDetailResponse {
  skus: Array<{
    id: number;
    quantity: number;
    date: string;
  }>;
  hotelOptions: Array<{
    id: number;
    name: string;
    priceByDate: Record<string, number>;
  }>;
}

@Injectable()
export class ShopProductService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async getProductDetail(influencerProductId: string): Promise<ProductDetailResponse> {
    // TODO: 실제 데이터베이스 조회 로직 구현
    // 1. influencerProductId로 InfluencerProduct 조회
    // 2. Product 및 관련 SKU, HotelOption 데이터 조회
    // 3. priceByDate 데이터 변환 및 반환
    
    throw new Error('Not implemented yet');
  }

  // TODO: 상품 목록 조회 로직 추가 예정
  // async findAll() {}

  // TODO: 상품 검색 로직 추가 예정
  // async search(query: string) {}
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { CampaignEntity } from '@src/module/backoffice/domain/campaign.entity';
import { CampaignProductEntity } from '@src/module/backoffice/domain/campaign-product.entity';
import { CampaignInfluencerEntity } from '@src/module/backoffice/domain/campaign-influencer.entity';
import { CampaignInfluencerProductEntity } from '@src/module/backoffice/domain/campaign-influencer-product.entity';
import { CampaignInfluencerHotelOptionEntity } from '@src/module/backoffice/domain/campaign-influencer-hotel-option.entity';
import type { CategoryEntity } from '@src/module/backoffice/domain/category.entity';
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignProductInput,
  CampaignInfluencerInput,
  CampaignInfluencerProductInput,
  CampaignInfluencerHotelOptionInput,
} from './campaign.type';
import type { CampaignWithRelations } from './campaign.dto';

@Injectable()
export class CampaignService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async findAll(): Promise<CampaignEntity[]> {
    return this.repositoryProvider.CampaignRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<CampaignWithRelations> {
    const campaign =
      await this.repositoryProvider.CampaignRepository.findOneByOrFail({
        id,
      }).catch(() => {
        throw new NotFoundException('캠페인을 찾을 수 없습니다');
      });

    // NOTE: categories는 n:m 관계이므로 DB join 대신 코드 레벨에서 합침
    const [products, influencers] = await Promise.all([
      this.repositoryProvider.CampaignProductRepository.find({
        where: { campaignId: id },
        relations: ['product', 'product.brand'],
      }),
      this.repositoryProvider.CampaignInfluencerRepository.find({
        where: { campaignId: id },
      }),
    ]);

    // 상품 카테고리 별도 조회 후 합침
    const productsWithCategories =
      await this.loadCategoriesForCampaignProducts(products);

    // 인플루언서별 상품 및 호텔 옵션 조회
    const influencersWithProducts =
      await this.loadInfluencerProducts(influencers);

    return this.buildCampaignResponse(
      campaign,
      productsWithCategories,
      influencersWithProducts
    );
  }

  async create(dto: CreateCampaignInput): Promise<CampaignWithRelations> {
    const products = dto.products ?? [];
    const influencers = dto.influencers ?? [];

    // 1. 상품/인플루언서 존재 여부 병렬 검증 (Repository 메서드 사용)
    await Promise.all([
      this.repositoryProvider.ProductRepository.validateExistsByIds(
        products.map(product => product.productId)
      ),
      this.repositoryProvider.InfluencerRepository.validateExistsByIds(
        influencers.map(influencer => influencer.influencerId)
      ),
    ]);

    // 2. 캠페인 기본 정보 생성
    const campaign = this.repositoryProvider.CampaignRepository.create({
      title: dto.title,
      startAt: dto.startAt,
      endAt: dto.endAt,
      description: dto.description,
      thumbnail: dto.thumbnail,
    });

    const savedCampaign =
      await this.repositoryProvider.CampaignRepository.save(campaign);

    // 3. 상품/인플루언서 연결 (병렬 저장)
    const [, savedInfluencers] = await Promise.all([
      this.createCampaignProducts(savedCampaign.id, products),
      this.createCampaignInfluencers(savedCampaign.id, influencers),
    ]);

    // 4. Product relations 로드를 위해 다시 조회
    // NOTE: categories는 n:m 관계이므로 DB join 대신 코드 레벨에서 합침
    const productsWithRelations =
      await this.repositoryProvider.CampaignProductRepository.find({
        where: { campaignId: savedCampaign.id },
        relations: ['product', 'product.brand'],
      });

    // 상품 카테고리 별도 조회 후 합침
    const productsWithCategories = await this.loadCategoriesForCampaignProducts(
      productsWithRelations
    );

    return this.buildCampaignResponse(
      savedCampaign,
      productsWithCategories,
      savedInfluencers
    );
  }

  async update(
    id: number,
    dto: UpdateCampaignInput
  ): Promise<CampaignWithRelations> {
    const campaign =
      await this.repositoryProvider.CampaignRepository.findOneByOrFail({
        id,
      }).catch(() => {
        throw new NotFoundException('캠페인을 찾을 수 없습니다');
      });

    const products = dto.products ?? [];
    const influencers = dto.influencers ?? [];

    // 1. 상품/인플루언서 존재 여부 병렬 검증 (Repository 메서드 사용)
    await Promise.all([
      this.repositoryProvider.ProductRepository.validateExistsByIds(
        products.map(product => product.productId)
      ),
      this.repositoryProvider.InfluencerRepository.validateExistsByIds(
        influencers.map(influencer => influencer.influencerId)
      ),
    ]);

    // 2. 캠페인 기본 정보 업데이트
    campaign.title = dto.title;
    campaign.startAt = dto.startAt;
    campaign.endAt = dto.endAt;
    campaign.description = dto.description;
    campaign.thumbnail = dto.thumbnail;

    const savedCampaign =
      await this.repositoryProvider.CampaignRepository.save(campaign);

    // 3. 기존 연결 삭제
    await this.deleteRelatedEntities(id);

    // 4. 새로운 연결 생성 (병렬)
    const [, savedInfluencers] = await Promise.all([
      this.createCampaignProducts(savedCampaign.id, products),
      this.createCampaignInfluencers(savedCampaign.id, influencers),
    ]);

    // 5. Product relations 로드를 위해 다시 조회
    // NOTE: categories는 n:m 관계이므로 DB join 대신 코드 레벨에서 합침
    const productsWithRelations =
      await this.repositoryProvider.CampaignProductRepository.find({
        where: { campaignId: savedCampaign.id },
        relations: ['product', 'product.brand'],
      });

    // 상품 카테고리 별도 조회 후 합침
    const productsWithCategories = await this.loadCategoriesForCampaignProducts(
      productsWithRelations
    );

    return this.buildCampaignResponse(
      savedCampaign,
      productsWithCategories,
      savedInfluencers
    );
  }

  async delete(id: number): Promise<void> {
    const campaign =
      await this.repositoryProvider.CampaignRepository.findOneByOrFail({
        id,
      }).catch(() => {
        throw new NotFoundException('캠페인을 찾을 수 없습니다');
      });

    await this.repositoryProvider.CampaignRepository.softRemove(campaign);
  }

  // ===== Private Helper Methods =====

  private async createCampaignProducts(
    campaignId: number,
    products: CampaignProductInput[]
  ): Promise<CampaignProductEntity[]> {
    if (products.length === 0) return [];

    const entities = products.map(productInput =>
      this.repositoryProvider.CampaignProductRepository.create({
        campaignId,
        productId: productInput.productId,
        status: productInput.status,
      })
    );

    return this.repositoryProvider.CampaignProductRepository.save(entities);
  }

  private async createCampaignInfluencers(
    campaignId: number,
    influencers: CampaignInfluencerInput[]
  ): Promise<CampaignInfluencerEntity[]> {
    if (influencers.length === 0) return [];

    // 순차 처리가 필요한 경우 reduce + Promise 체이닝 사용
    return influencers.reduce(
      async (accPromise, influencerInput) => {
        const acc = await accPromise;

        // 1. CampaignInfluencer 생성
        // id는 `${campaignId}_${influencerId}` 형식의 composite key
        const compositeId = `${campaignId}_${influencerInput.influencerId}`;
        const entity =
          this.repositoryProvider.CampaignInfluencerRepository.create({
            id: compositeId,
            campaignId,
            influencerId: influencerInput.influencerId,
            periodType: influencerInput.periodType,
            startAt: influencerInput.startAt,
            endAt: influencerInput.endAt,
            feeType: influencerInput.feeType,
            fee: influencerInput.fee,
            status: influencerInput.status,
          });

        const savedInfluencer =
          await this.repositoryProvider.CampaignInfluencerRepository.save(
            entity
          );

        // 2. CampaignInfluencerProduct 생성 (있으면)
        const productInputs = influencerInput.products ?? [];
        savedInfluencer.products =
          productInputs.length > 0
            ? await this.createCampaignInfluencerProducts(
                savedInfluencer.id,
                influencerInput.influencerId,
                productInputs
              )
            : [];

        return [...acc, savedInfluencer];
      },
      Promise.resolve([] as CampaignInfluencerEntity[])
    );
  }

  private async createCampaignInfluencerProducts(
    campaignInfluencerId: string,
    influencerId: number,
    products: CampaignInfluencerProductInput[]
  ): Promise<CampaignInfluencerProductEntity[]> {
    if (products.length === 0) return [];

    // 순차 처리가 필요한 경우 reduce + Promise 체이닝 사용
    return products.reduce(
      async (accPromise, productInput) => {
        const acc = await accPromise;

        // 1. CampaignInfluencerProduct 생성
        const entity =
          this.repositoryProvider.CampaignInfluencerProductRepository.create({
            campaignInfluencerId,
            productId: productInput.productId,
            useCustomCommission: productInput.useCustomCommission,
          });

        const savedProduct =
          await this.repositoryProvider.CampaignInfluencerProductRepository.save(
            entity
          );

        // 2. CampaignInfluencerHotelOption 생성 (있으면)
        const hotelOptionInputs = productInput.hotelOptions ?? [];
        savedProduct.hotelOptions =
          hotelOptionInputs.length > 0
            ? await this.createCampaignInfluencerHotelOptions(
                savedProduct.id,
                influencerId,
                hotelOptionInputs
              )
            : [];

        return [...acc, savedProduct];
      },
      Promise.resolve([] as CampaignInfluencerProductEntity[])
    );
  }

  private async createCampaignInfluencerHotelOptions(
    campaignInfluencerProductId: number,
    influencerId: number,
    hotelOptions: CampaignInfluencerHotelOptionInput[]
  ): Promise<CampaignInfluencerHotelOptionEntity[]> {
    if (hotelOptions.length === 0) return [];

    const entities = hotelOptions.map(optionInput =>
      this.repositoryProvider.CampaignInfluencerHotelOptionRepository.create({
        campaignInfluencerProductId,
        hotelOptionId: optionInput.hotelOptionId,
        influencerId,
        commissionByDate: optionInput.commissionByDate,
      })
    );

    return this.repositoryProvider.CampaignInfluencerHotelOptionRepository.save(
      entities
    );
  }

  private buildCampaignResponse(
    campaign: CampaignEntity,
    products: CampaignProductEntity[],
    influencers: CampaignInfluencerEntity[]
  ): CampaignWithRelations {
    return {
      id: campaign.id,
      title: campaign.title,
      startAt: campaign.startAt,
      endAt: campaign.endAt,
      description: campaign.description,
      thumbnail: campaign.thumbnail,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      products: products.map(product => product.toResponse()),
      influencers: influencers.map(influencer => influencer.toResponse()),
    };
  }

  /**
   * 캠페인 상품 목록에 카테고리를 로드하여 반환
   * NOTE: n:m 관계는 DB join 대신 코드 레벨에서 합쳐서 쿼리 성능 최적화
   */
  private async loadCategoriesForCampaignProducts(
    campaignProducts: CampaignProductEntity[]
  ): Promise<CampaignProductEntity[]> {
    if (campaignProducts.length === 0) return [];

    const productIds = campaignProducts.map(
      campaignProduct => campaignProduct.productId
    );

    // 모든 상품의 카테고리를 한 번에 조회
    const categoriesWithProductId =
      await this.repositoryProvider.CategoryRepository.createQueryBuilder(
        'category'
      )
        .innerJoin('product_categories', 'pc', 'pc.category_id = category.id')
        .addSelect('pc.product_id', 'productId')
        .where('pc.product_id IN (:...productIds)', { productIds })
        .andWhere('category.deletedAt IS NULL')
        .getRawAndEntities();

    // 카테고리를 상품별로 그룹화
    const categoriesByProductId = categoriesWithProductId.raw.reduce(
      (acc, raw, index) => {
        const productId = raw.productId as number;
        const category = categoriesWithProductId.entities[index];
        const existing = acc.get(productId) ?? [];
        acc.set(productId, [...existing, category]);
        return acc;
      },
      new Map<number, CategoryEntity[]>()
    );

    // 각 캠페인 상품의 product에 카테고리 할당
    campaignProducts.forEach(campaignProduct => {
      campaignProduct.product.categories =
        categoriesByProductId.get(campaignProduct.productId) ?? [];
    });

    return campaignProducts;
  }

  /**
   * 인플루언서 목록에 상품 및 호텔 옵션을 로드하여 반환
   * N+1 문제 방지를 위해 배치 조회 후 그룹핑
   *
   * NOTE: Repository가 아닌 Service에 위치하는 이유
   * - Entity 파일 간 순환 참조 문제 방지 (동적 import 불필요)
   * - Service는 RepositoryProvider를 통해 모든 Repository에 접근 가능
   */
  private async loadInfluencerProducts(
    influencers: CampaignInfluencerEntity[]
  ): Promise<CampaignInfluencerEntity[]> {
    if (influencers.length === 0) return [];

    const influencerIds = influencers.map(influencer => influencer.id);

    // 모든 인플루언서의 상품을 한 번에 조회
    const allProducts =
      await this.repositoryProvider.CampaignInfluencerProductRepository.createQueryBuilder(
        'product'
      )
        .where('product.campaignInfluencerId IN (:...influencerIds)', {
          influencerIds,
        })
        .getMany();

    if (allProducts.length === 0) {
      return influencers.map(influencer => {
        influencer.products = [];
        return influencer;
      });
    }

    const productIds = allProducts.map(product => product.id);

    // 모든 호텔 옵션을 한 번에 조회
    const allHotelOptions =
      await this.repositoryProvider.CampaignInfluencerHotelOptionRepository.createQueryBuilder(
        'option'
      )
        .where('option.campaignInfluencerProductId IN (:...productIds)', {
          productIds,
        })
        .getMany();

    // 호텔 옵션을 상품별로 그룹화
    const hotelOptionsByProductId = allHotelOptions.reduce((acc, option) => {
      const existing = acc.get(option.campaignInfluencerProductId) ?? [];
      acc.set(option.campaignInfluencerProductId, [...existing, option]);
      return acc;
    }, new Map<number, CampaignInfluencerHotelOptionEntity[]>());

    // 상품에 호텔 옵션 할당
    allProducts.forEach(product => {
      product.hotelOptions = hotelOptionsByProductId.get(product.id) ?? [];
    });

    // 상품을 인플루언서별로 그룹화
    const productsByInfluencerId = allProducts.reduce((acc, product) => {
      const existing = acc.get(product.campaignInfluencerId) ?? [];
      acc.set(product.campaignInfluencerId, [...existing, product]);
      return acc;
    }, new Map<string, CampaignInfluencerProductEntity[]>());

    // 인플루언서에 상품 할당
    return influencers.map(influencer => {
      influencer.products = productsByInfluencerId.get(influencer.id) ?? [];
      return influencer;
    });
  }

  /**
   * 캠페인의 모든 관련 엔티티 삭제 (하위부터 순차적으로)
   * cascade 삭제를 위해 호텔옵션 → 인플루언서상품 → 인플루언서/상품 순서로 삭제
   *
   * NOTE: Repository가 아닌 Service에 위치하는 이유
   * - Entity 파일 간 순환 참조 문제 방지 (동적 import 불필요)
   * - Service는 RepositoryProvider를 통해 모든 Repository에 접근 가능
   */
  private async deleteRelatedEntities(campaignId: number): Promise<void> {
    // 1. 먼저 인플루언서 ID 조회
    const influencers =
      await this.repositoryProvider.CampaignInfluencerRepository.find({
        where: { campaignId },
        select: ['id'],
      });

    if (influencers.length > 0) {
      const influencerIds = influencers.map(influencer => influencer.id);

      // 2. 인플루언서별 상품 ID 조회
      const products =
        await this.repositoryProvider.CampaignInfluencerProductRepository.createQueryBuilder(
          'product'
        )
          .select(['product.id'])
          .where('product.campaignInfluencerId IN (:...influencerIds)', {
            influencerIds,
          })
          .getMany();

      if (products.length > 0) {
        const productIds = products.map(product => product.id);

        // 3. 호텔 옵션 삭제 (가장 하위)
        await this.repositoryProvider.CampaignInfluencerHotelOptionRepository.createQueryBuilder()
          .delete()
          .where('campaignInfluencerProductId IN (:...productIds)', {
            productIds,
          })
          .execute();
      }

      // 4. 인플루언서별 상품 삭제
      await this.repositoryProvider.CampaignInfluencerProductRepository.createQueryBuilder()
        .delete()
        .where('campaignInfluencerId IN (:...influencerIds)', {
          influencerIds,
        })
        .execute();
    }

    // 5. 캠페인 인플루언서 및 상품 삭제 (병렬)
    await Promise.all([
      this.repositoryProvider.CampaignInfluencerRepository.delete({
        campaignId,
      }),
      this.repositoryProvider.CampaignProductRepository.delete({
        campaignId,
      }),
    ]);
  }
}

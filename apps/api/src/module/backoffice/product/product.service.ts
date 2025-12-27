import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { HotelProductEntity } from '@src/module/backoffice/domain/product/hotel-product.entity';
import { DeliveryProductEntity } from '@src/module/backoffice/domain/product/delivery-product.entity';
import { ETicketProductEntity } from '@src/module/backoffice/domain/product/eticket-product.entity';
import { HotelSkuEntity } from '@src/module/backoffice/domain/product/hotel-sku.entity';
import type { CategoryEntity } from '@src/module/backoffice/domain/category.entity';
import type {
  CreateProductInputDto,
  CreateProductResponse,
  UpdateProductInputDto,
  UpdateProductResponse,
  DeleteProductResponse,
  ProductDetail,
  FindAllProductQuery,
  ProductListResponse,
} from './product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async findAll(query: FindAllProductQuery): Promise<ProductListResponse> {
    // Repository 커스텀 메서드로 데이터 조회 (default 값 처리 포함)
    const [products, total] =
      await this.repositoryProvider.ProductRepository.findAllWithFilters(query);

    // 페이지네이션 정보 (default 값 사용)
    const page = query.page || 1;
    const limit = query.limit || 30;
    const totalPages = Math.ceil(total / limit);

    // Response 포맷팅
    const formattedProducts = products.map(product => ({
      id: product.id,
      type: product.type,
      name: product.name,
      brand: {
        id: product.brand?.id || 0,
        name: product.brand?.name || '',
      },
      thumbnailUrls: product.thumbnailUrls ?? [],
      price: product.price,
      status: product.status,
      useStock: product.useStock,
      useCalendar: product.useCalendar,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return {
      data: formattedProducts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: number): Promise<ProductDetail> {
    // 1. 먼저 ProductRepository로 id와 type만 확인
    const baseProduct =
      await this.repositoryProvider.ProductRepository.findOneOrFail({
        where: { id },
        select: ['id', 'type'],
      }).catch(() => {
        throw new NotFoundException(`상품을 찾을 수 없습니다 (ID: ${id})`);
      });

    // 2. type에 따라 적절한 Repository에서 전체 데이터 조회
    // NOTE: categories는 n:m 관계이므로 DB join 대신 코드 레벨에서 합침
    switch (baseProduct.type) {
      case 'HOTEL': {
        const [hotel, categories, hotelOptions] = await Promise.all([
          this.repositoryProvider.HotelProductRepository.findOneOrFail({
            where: { id },
            relations: ['brand', 'productTemplate'],
          }).catch(() => {
            throw new NotFoundException(
              `호텔 상품을 찾을 수 없습니다 (ID: ${id})`
            );
          }),
          this.loadCategoriesForProduct(id),
          this.repositoryProvider.HotelOptionRepository.find({
            where: { productId: id },
            order: { id: 'ASC' },
          }),
        ]);

        // categories를 entity에 할당 후 spread로 포함
        hotel.categories = categories;

        return {
          ...hotel,
          type: 'HOTEL',
          brandName: hotel.brand.name,
          hotelOptions: hotelOptions.map(opt => ({
            id: opt.id,
            name: opt.name,
            priceByDate: opt.priceByDate,
            anotherPriceByDate: opt.anotherPriceByDate,
          })),
        };
      }

      case 'DELIVERY': {
        const [delivery, categories] = await Promise.all([
          this.repositoryProvider.DeliveryProductRepository.findOneOrFail({
            where: { id },
            relations: ['brand', 'productTemplate'],
          }).catch(() => {
            throw new NotFoundException(
              `배송상품을 찾을 수 없습니다 (ID: ${id})`
            );
          }),
          this.loadCategoriesForProduct(id),
        ]);

        // categories를 entity에 할당 후 spread로 포함
        delivery.categories = categories;

        return {
          ...delivery,
          type: 'DELIVERY',
          brandName: delivery.brand.name,
        };
      }

      case 'E-TICKET': {
        const [eticket, categories] = await Promise.all([
          this.repositoryProvider.ETicketProductRepository.findOneOrFail({
            where: { id },
            relations: ['brand', 'productTemplate'],
          }).catch(() => {
            throw new NotFoundException(
              `E-Ticket 상품을 찾을 수 없습니다 (ID: ${id})`
            );
          }),
          this.loadCategoriesForProduct(id),
        ]);

        // categories를 entity에 할당 후 spread로 포함
        eticket.categories = categories;

        return {
          ...eticket,
          type: 'E-TICKET',
          brandName: eticket.brand.name,
        };
      }

      default:
        throw new BadRequestException(
          `지원하지 않는 상품 타입입니다: ${baseProduct.type}`
        );
    }
  }

  async create(input: CreateProductInputDto): Promise<CreateProductResponse> {
    // 1. 브랜드 존재 여부 확인
    await this.repositoryProvider.BrandRepository.findOneOrFail({
      where: { id: input.brandId },
    }).catch(() => {
      throw new NotFoundException(
        `브랜드를 찾을 수 없습니다 (ID: ${input.brandId})`
      );
    });

    // 2. ProductTemplate 존재 여부 확인 (선택적)
    if (input.productTemplateId) {
      await this.repositoryProvider.ProductTemplateRepository.findOneOrFail({
        where: { id: input.productTemplateId },
      }).catch(() => {
        throw new NotFoundException(
          `상품 템플릿을 찾을 수 없습니다 (ID: ${input.productTemplateId})`
        );
      });
    }

    // 3. 타입에 따라 적절한 Entity 생성 및 저장
    let savedProduct:
      | HotelProductEntity
      | DeliveryProductEntity
      | ETicketProductEntity;

    switch (input.type) {
      case 'HOTEL': {
        const hotelInput = input;
        const hotelProduct = HotelProductEntity.createFromInput(hotelInput);
        savedProduct =
          await this.repositoryProvider.HotelProductRepository.save(
            hotelProduct
          );

        // 호텔 옵션 저장
        if (hotelInput.hotelOptions && hotelInput.hotelOptions.length > 0) {
          await this.repositoryProvider.HotelOptionRepository.saveOptions(
            savedProduct.id,
            hotelInput.hotelOptions
          );
        }

        // 호텔 SKU 저장 (productTemplateId 기준)
        if (
          hotelInput.hotelSkus &&
          hotelInput.hotelSkus.length > 0 &&
          savedProduct.productTemplateId
        ) {
          await this.saveHotelSkus(
            savedProduct.productTemplateId,
            hotelInput.hotelSkus
          );
        }
        break;
      }

      case 'DELIVERY': {
        if (!input.delivery) {
          throw new BadRequestException(
            '배송상품 생성 시 배송 정책은 필수입니다'
          );
        }

        const deliveryProduct = DeliveryProductEntity.createFromInput(input);
        savedProduct =
          await this.repositoryProvider.DeliveryProductRepository.save(
            deliveryProduct
          );
        break;
      }

      case 'E-TICKET': {
        const eticketProduct = ETicketProductEntity.createFromInput(input);
        savedProduct =
          await this.repositoryProvider.ETicketProductRepository.save(
            eticketProduct
          );
        break;
      }

      default:
        throw new BadRequestException(
          `지원하지 않는 상품 타입입니다: ${input as never}`
        );
    }

    return {
      id: savedProduct.id,
      type: savedProduct.type,
      name: savedProduct.name,
      message: '상품이 생성되었습니다',
    };
  }

  async update(input: UpdateProductInputDto): Promise<UpdateProductResponse> {
    // 1. 기존 상품 조회 (타입 확인용)
    const existingProduct =
      await this.repositoryProvider.ProductRepository.findOneOrFail({
        where: { id: input.id },
        select: ['id', 'type'],
      }).catch(() => {
        throw new NotFoundException(
          `상품을 찾을 수 없습니다 (ID: ${input.id})`
        );
      });

    // 2. 브랜드 존재 여부 확인
    await this.repositoryProvider.BrandRepository.findOneOrFail({
      where: { id: input.brandId },
    }).catch(() => {
      throw new NotFoundException(
        `브랜드를 찾을 수 없습니다 (ID: ${input.brandId})`
      );
    });

    // 3. ProductTemplate 존재 여부 확인 (선택적)
    if (input.productTemplateId) {
      await this.repositoryProvider.ProductTemplateRepository.findOneOrFail({
        where: { id: input.productTemplateId },
      }).catch(() => {
        throw new NotFoundException(
          `상품 템플릿을 찾을 수 없습니다 (ID: ${input.productTemplateId})`
        );
      });
    }

    // 4. 요청 타입과 기존 상품 타입 일치 확인
    if (existingProduct.type !== input.type) {
      throw new BadRequestException(
        `상품 타입을 변경할 수 없습니다. 기존: ${existingProduct.type}, 요청: ${input.type}`
      );
    }

    // 6. 타입에 따라 적절한 Repository에서 업데이트
    let updatedProduct:
      | HotelProductEntity
      | DeliveryProductEntity
      | ETicketProductEntity;

    switch (input.type) {
      case 'HOTEL': {
        // 기존 엔티티 조회
        const hotelProduct =
          await this.repositoryProvider.HotelProductRepository.findOneOrFail({
            where: { id: input.id },
          }).catch(() => {
            throw new NotFoundException(
              `호텔 상품을 찾을 수 없습니다 (ID: ${input.id})`
            );
          });

        // 헬퍼 메서드로 필드 업데이트
        hotelProduct.updateFromInput(input);

        updatedProduct =
          await this.repositoryProvider.HotelProductRepository.save(
            hotelProduct
          );

        // 호텔 옵션 업데이트 (PUT 방식: 기존 삭제 후 새로 저장)
        await this.repositoryProvider.HotelOptionRepository.updateOptions(
          input.id,
          input.hotelOptions || []
        );

        // 호텔 SKU 업데이트 (productTemplateId 기준)
        if (
          input.hotelSkus &&
          input.hotelSkus.length > 0 &&
          updatedProduct.productTemplateId
        ) {
          await this.saveHotelSkus(
            updatedProduct.productTemplateId,
            input.hotelSkus
          );
        }
        break;
      }

      case 'DELIVERY': {
        if (!input.delivery) {
          throw new BadRequestException(
            '배송상품 수정 시 배송 정책은 필수입니다'
          );
        }

        // 기존 엔티티 조회
        const deliveryProduct =
          await this.repositoryProvider.DeliveryProductRepository.findOneOrFail(
            {
              where: { id: input.id },
            }
          ).catch(() => {
            throw new NotFoundException(
              `배송상품을 찾을 수 없습니다 (ID: ${input.id})`
            );
          });

        // 헬퍼 메서드로 필드 업데이트
        deliveryProduct.updateFromInput(input);

        updatedProduct =
          await this.repositoryProvider.DeliveryProductRepository.save(
            deliveryProduct
          );
        break;
      }

      case 'E-TICKET': {
        // 기존 엔티티 조회
        const eticketProduct =
          await this.repositoryProvider.ETicketProductRepository.findOneOrFail({
            where: { id: input.id },
          }).catch(() => {
            throw new NotFoundException(
              `E-Ticket 상품을 찾을 수 없습니다 (ID: ${input.id})`
            );
          });

        // 헬퍼 메서드로 필드 업데이트
        eticketProduct.updateFromInput(input);

        updatedProduct =
          await this.repositoryProvider.ETicketProductRepository.save(
            eticketProduct
          );
        break;
      }

      default:
        throw new BadRequestException(
          `지원하지 않는 상품 타입입니다: ${input as never}`
        );
    }

    return {
      id: updatedProduct.id,
      name: updatedProduct.name,
      message: '상품이 수정되었습니다',
    };
  }

  async delete(id: number): Promise<DeleteProductResponse> {
    // 1. 상품 존재 여부 확인
    const product =
      await this.repositoryProvider.ProductRepository.findOneOrFail({
        where: { id },
        select: ['id', 'type', 'name'],
      }).catch(() => {
        throw new NotFoundException(`상품을 찾을 수 없습니다 (ID: ${id})`);
      });

    // 2. 타입에 따라 적절한 Repository에서 soft delete
    switch (product.type) {
      case 'HOTEL':
        await this.repositoryProvider.HotelProductRepository.softDelete(id);
        break;

      case 'DELIVERY':
        await this.repositoryProvider.DeliveryProductRepository.softDelete(id);
        break;

      case 'E-TICKET':
        await this.repositoryProvider.ETicketProductRepository.softDelete(id);
        break;

      default:
        throw new BadRequestException(
          `지원하지 않는 상품 타입입니다: ${product.type}`
        );
    }

    return {
      id,
      message: '상품이 삭제되었습니다',
    };
  }

  /**
   * 상품의 카테고리 목록을 별도 조회
   * NOTE: n:m 관계는 DB join 대신 코드 레벨에서 합쳐서 쿼리 성능 최적화
   */
  private async loadCategoriesForProduct(
    productId: number
  ): Promise<CategoryEntity[]> {
    return this.repositoryProvider.CategoryRepository.createQueryBuilder(
      'category'
    )
      .innerJoin('product_categories', 'pc', 'pc.category_id = category.id')
      .where('pc.product_id = :productId', { productId })
      .andWhere('category.deletedAt IS NULL')
      .getMany();
  }

  /**
   * HotelSku 저장/업데이트 헬퍼 메서드
   * productTemplateId 기준으로 SKU를 관리 (동일 템플릿의 Product들은 SKU를 공유)
   *
   * checkInDate 기준으로:
   * - 기존에 있고 새 데이터에도 있음 → UPDATE
   * - 기존에 있지만 새 데이터에 없음 → DELETE
   * - 기존에 없고 새 데이터에 있음 → INSERT
   *
   * quantity = 0도 유효한 값으로 저장됨 (재고 없음을 의미)
   */
  private async saveHotelSkus(
    productTemplateId: number,
    hotelSkus: Array<{ checkInDate: string; quantity: number }>
  ): Promise<void> {
    // 1. 기존 SKU 조회 (비관적 락 적용 - 동시성 제어)
    const existingSkus = await this.repositoryProvider.HotelSkuRepository.find({
      where: { productTemplateId },
      lock: { mode: 'pessimistic_write' },
    });

    // 2. 기존 SKU를 Map으로 변환 (checkInDate → SKU entity)
    const existingSkuMap = new Map(existingSkus.map(sku => [sku.date, sku]));

    // 3. 새 SKU를 Map으로 변환 (checkInDate → quantity)
    const newSkuMap = new Map(
      hotelSkus.map(sku => [sku.checkInDate, sku.quantity])
    );

    // 4. UPDATE: 기존에 있고 새 데이터에도 있는 경우
    const skusToUpdate = existingSkus
      .filter(sku => newSkuMap.has(sku.date))
      .map(sku => {
        sku.quantity = newSkuMap.get(sku.date)!;
        return sku;
      });

    // 5. DELETE: 기존에 있지만 새 데이터에 없는 경우
    const skuIdsToDelete = existingSkus
      .filter(sku => !newSkuMap.has(sku.date))
      .map(sku => sku.id);

    // 6. INSERT: 기존에 없고 새 데이터에 있는 경우
    const skusToInsert = Array.from(newSkuMap.entries())
      .filter(([checkInDate]) => !existingSkuMap.has(checkInDate))
      .map(([checkInDate, quantity]) => {
        const skuEntity = new HotelSkuEntity();
        skuEntity.productTemplateId = productTemplateId;
        skuEntity.date = checkInDate;
        skuEntity.quantity = quantity;
        return skuEntity;
      });

    // 7. 실행 (save와 delete는 각각 배치 처리됨)
    if (skusToUpdate.length > 0 || skusToInsert.length > 0) {
      await this.repositoryProvider.HotelSkuRepository.save([
        ...skusToUpdate,
        ...skusToInsert,
      ]);
    }

    if (skuIdsToDelete.length > 0) {
      await this.repositoryProvider.HotelSkuRepository.delete(skuIdsToDelete);
    }
  }
}

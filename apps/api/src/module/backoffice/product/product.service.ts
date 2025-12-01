import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { HotelProductEntity } from '@src/module/backoffice/domain/product/hotel-product.entity';
import { DeliveryProductEntity } from '@src/module/backoffice/domain/product/delivery-product.entity';
import { ETicketProductEntity } from '@src/module/backoffice/domain/product/eticket-product.entity';
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
    switch (baseProduct.type) {
      case 'HOTEL': {
        const hotel =
          await this.repositoryProvider.HotelProductRepository.findOneOrFail({
            where: { id },
            relations: ['brand', 'categories', 'productTemplate', 'campaign'],
          }).catch(() => {
            throw new NotFoundException(
              `호텔 상품을 찾을 수 없습니다 (ID: ${id})`
            );
          });

        return {
          ...hotel,
          type: 'HOTEL',
          brandName: hotel.brand.name,
        };
      }

      case 'DELIVERY': {
        const delivery =
          await this.repositoryProvider.DeliveryProductRepository.findOneOrFail(
            {
              where: { id },
              relations: ['brand', 'categories', 'productTemplate', 'campaign'],
            }
          ).catch(() => {
            throw new NotFoundException(
              `배송상품을 찾을 수 없습니다 (ID: ${id})`
            );
          });

        return {
          ...delivery,
          type: 'DELIVERY',
          brandName: delivery.brand.name,
        };
      }

      case 'E-TICKET': {
        const eticket =
          await this.repositoryProvider.ETicketProductRepository.findOneOrFail({
            where: { id },
            relations: ['brand', 'categories', 'productTemplate', 'campaign'],
          }).catch(() => {
            throw new NotFoundException(
              `E-Ticket 상품을 찾을 수 없습니다 (ID: ${id})`
            );
          });

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

    // 3. Campaign 존재 여부 확인 (선택적)
    if (input.campaignId) {
      await this.repositoryProvider.CampaignRepository.findOneOrFail({
        where: { id: input.campaignId },
      }).catch(() => {
        throw new NotFoundException(
          `캠페인을 찾을 수 없습니다 (ID: ${input.campaignId})`
        );
      });
    }

    // 4. 타입에 따라 적절한 Entity 생성 및 저장
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

    // 4. Campaign 존재 여부 확인 (선택적)
    if (input.campaignId) {
      await this.repositoryProvider.CampaignRepository.findOneOrFail({
        where: { id: input.campaignId },
      }).catch(() => {
        throw new NotFoundException(
          `캠페인을 찾을 수 없습니다 (ID: ${input.campaignId})`
        );
      });
    }

    // 5. 요청 타입과 기존 상품 타입 일치 확인
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
}

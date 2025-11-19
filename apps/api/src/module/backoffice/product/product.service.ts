import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { HotelProductEntity } from '@src/module/backoffice/domain/product/hotel-product.entity';
import { DeliveryProductEntity } from '@src/module/backoffice/domain/product/delivery-product.entity';
import { ETicketProductEntity } from '@src/module/backoffice/domain/product/eticket-product.entity';
import { DeliveryPolicyEntity } from '@src/module/backoffice/domain/delivery-policy.entity';
import { ProductRepository } from './product.repository';
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
  constructor(
    private readonly repositoryProvider: RepositoryProvider,
    private readonly productRepository: ProductRepository
  ) {}

  async findAll(query: FindAllProductQuery): Promise<ProductListResponse> {
    const {
      page = 1,
      limit = 30,
      orderBy = 'createdAt',
      order = 'DESC',
      type,
      name,
      status,
      brandIds,
      dateFilterType = 'CREATED_AT',
      startDate,
      endDate,
    } = query;

    // Repository를 통한 데이터 조회
    const [products, total] = await this.productRepository.findAllWithFilters({
      page,
      limit,
      orderBy,
      order,
      type,
      name,
      status,
      brandIds,
      dateFilterType,
      startDate,
      endDate,
    });

    // 총 페이지 수 계산
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
        const hotelProduct = new HotelProductEntity();
        hotelProduct.name = input.name;
        hotelProduct.brandId = input.brandId;
        hotelProduct.productTemplateId = input.productTemplateId || null;
        hotelProduct.campaignId = input.campaignId || null;
        hotelProduct.thumbnailUrls = input.thumbnailUrls || [];
        hotelProduct.description = input.description || '';
        hotelProduct.detailContent = input.detailContent || '';
        hotelProduct.useCalendar = true; // 호텔은 항상 true
        hotelProduct.useStock = input.useStock || false;
        hotelProduct.useOptions = input.useOptions || false;
        hotelProduct.price = input.price;
        hotelProduct.status = input.status || 'VISIBLE';
        hotelProduct.displayOrder = input.displayOrder || null;
        hotelProduct.baseCapacity = input.baseCapacity;
        hotelProduct.maxCapacity = input.maxCapacity;
        hotelProduct.checkInTime = input.checkInTime;
        hotelProduct.checkOutTime = input.checkOutTime;
        hotelProduct.bedTypes = input.bedTypes || [];
        hotelProduct.tags = input.tags || [];

        savedProduct =
          await this.repositoryProvider.HotelProductRepository.save(
            hotelProduct
          );
        break;
      }

      case 'DELIVERY': {
        if (!input.delivery) {
          throw new BadRequestException(
            '배송상품 생성 시 배송 정책은 필수입니다'
          );
        }

        const deliveryProduct = new DeliveryProductEntity();
        deliveryProduct.name = input.name;
        deliveryProduct.brandId = input.brandId;
        deliveryProduct.productTemplateId = input.productTemplateId || null;
        deliveryProduct.campaignId = input.campaignId || null;
        deliveryProduct.thumbnailUrls = input.thumbnailUrls || [];
        deliveryProduct.description = input.description || '';
        deliveryProduct.detailContent = input.detailContent || '';
        deliveryProduct.useCalendar = input.useCalendar || false;
        deliveryProduct.useStock = input.useStock || false;
        deliveryProduct.useOptions = input.useOptions || false;
        deliveryProduct.price = input.price;
        deliveryProduct.status = input.status || 'VISIBLE';
        deliveryProduct.displayOrder = input.displayOrder || null;
        deliveryProduct.exchangeReturnInfo = input.exchangeReturnInfo || '';
        deliveryProduct.productInfoNotice = input.productInfoNotice || '';

        // 배송 정책 임베디드 객체 생성
        const delivery = new DeliveryPolicyEntity();
        Object.assign(delivery, input.delivery);
        deliveryProduct.delivery = delivery;

        savedProduct =
          await this.repositoryProvider.DeliveryProductRepository.save(
            deliveryProduct
          );
        break;
      }

      case 'E-TICKET': {
        const eticketProduct = new ETicketProductEntity();
        eticketProduct.name = input.name;
        eticketProduct.brandId = input.brandId;
        eticketProduct.productTemplateId = input.productTemplateId || null;
        eticketProduct.campaignId = input.campaignId || null;
        eticketProduct.thumbnailUrls = input.thumbnailUrls || [];
        eticketProduct.description = input.description || '';
        eticketProduct.detailContent = input.detailContent || '';
        eticketProduct.useCalendar = input.useCalendar || false;
        eticketProduct.useStock = input.useStock || false;
        eticketProduct.useOptions = input.useOptions || false;
        eticketProduct.price = input.price;
        eticketProduct.status = input.status || 'VISIBLE';
        eticketProduct.displayOrder = input.displayOrder || null;

        savedProduct =
          await this.repositoryProvider.ETicketProductRepository.save(
            eticketProduct
          );
        break;
      }

      default:
        throw new BadRequestException(
          `지원하지 않는 상품 타입입니다: ${(input as any).type}`
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

    // 5. 타입에 따라 적절한 Repository에서 업데이트
    let updatedProduct:
      | HotelProductEntity
      | DeliveryProductEntity
      | ETicketProductEntity;

    switch (existingProduct.type) {
      case 'HOTEL': {
        const hotelInput = input as any;

        // 기존 엔티티 조회
        const hotelProduct =
          await this.repositoryProvider.HotelProductRepository.findOneOrFail({
            where: { id: input.id },
          }).catch(() => {
            throw new NotFoundException(
              `호텔 상품을 찾을 수 없습니다 (ID: ${input.id})`
            );
          });

        // 필드 업데이트
        hotelProduct.name = hotelInput.name;
        hotelProduct.brandId = hotelInput.brandId;
        hotelProduct.productTemplateId = hotelInput.productTemplateId || null;
        hotelProduct.campaignId = hotelInput.campaignId || null;
        hotelProduct.thumbnailUrls = hotelInput.thumbnailUrls || [];
        hotelProduct.description = hotelInput.description || '';
        hotelProduct.detailContent = hotelInput.detailContent || '';
        hotelProduct.useStock = hotelInput.useStock || false;
        hotelProduct.useOptions = hotelInput.useOptions || false;
        hotelProduct.price = hotelInput.price;
        hotelProduct.status = hotelInput.status || 'VISIBLE';
        hotelProduct.displayOrder = hotelInput.displayOrder || null;
        hotelProduct.baseCapacity = hotelInput.baseCapacity;
        hotelProduct.maxCapacity = hotelInput.maxCapacity;
        hotelProduct.checkInTime = hotelInput.checkInTime;
        hotelProduct.checkOutTime = hotelInput.checkOutTime;
        hotelProduct.bedTypes = hotelInput.bedTypes || [];
        hotelProduct.tags = hotelInput.tags || [];

        updatedProduct =
          await this.repositoryProvider.HotelProductRepository.save(
            hotelProduct
          );
        break;
      }

      case 'DELIVERY': {
        const deliveryInput = input as any;

        if (!deliveryInput.delivery) {
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

        // 필드 업데이트
        deliveryProduct.name = deliveryInput.name;
        deliveryProduct.brandId = deliveryInput.brandId;
        deliveryProduct.productTemplateId =
          deliveryInput.productTemplateId || null;
        deliveryProduct.campaignId = deliveryInput.campaignId || null;
        deliveryProduct.thumbnailUrls = deliveryInput.thumbnailUrls || [];
        deliveryProduct.description = deliveryInput.description || '';
        deliveryProduct.detailContent = deliveryInput.detailContent || '';
        deliveryProduct.useCalendar = deliveryInput.useCalendar || false;
        deliveryProduct.useStock = deliveryInput.useStock || false;
        deliveryProduct.useOptions = deliveryInput.useOptions || false;
        deliveryProduct.price = deliveryInput.price;
        deliveryProduct.status = deliveryInput.status || 'VISIBLE';
        deliveryProduct.displayOrder = deliveryInput.displayOrder || null;
        deliveryProduct.exchangeReturnInfo =
          deliveryInput.exchangeReturnInfo || '';
        deliveryProduct.productInfoNotice =
          deliveryInput.productInfoNotice || '';

        // 배송 정책 임베디드 객체 업데이트
        const delivery = new DeliveryPolicyEntity();
        Object.assign(delivery, deliveryInput.delivery);
        deliveryProduct.delivery = delivery;

        updatedProduct =
          await this.repositoryProvider.DeliveryProductRepository.save(
            deliveryProduct
          );
        break;
      }

      case 'E-TICKET': {
        const eticketInput = input as any;

        // 기존 엔티티 조회
        const eticketProduct =
          await this.repositoryProvider.ETicketProductRepository.findOneOrFail({
            where: { id: input.id },
          }).catch(() => {
            throw new NotFoundException(
              `E-Ticket 상품을 찾을 수 없습니다 (ID: ${input.id})`
            );
          });

        // 필드 업데이트
        eticketProduct.name = eticketInput.name;
        eticketProduct.brandId = eticketInput.brandId;
        eticketProduct.productTemplateId =
          eticketInput.productTemplateId || null;
        eticketProduct.campaignId = eticketInput.campaignId || null;
        eticketProduct.thumbnailUrls = eticketInput.thumbnailUrls || [];
        eticketProduct.description = eticketInput.description || '';
        eticketProduct.detailContent = eticketInput.detailContent || '';
        eticketProduct.useCalendar = eticketInput.useCalendar || false;
        eticketProduct.useStock = eticketInput.useStock || false;
        eticketProduct.useOptions = eticketInput.useOptions || false;
        eticketProduct.price = eticketInput.price;
        eticketProduct.status = eticketInput.status || 'VISIBLE';
        eticketProduct.displayOrder = eticketInput.displayOrder || null;

        updatedProduct =
          await this.repositoryProvider.ETicketProductRepository.save(
            eticketProduct
          );
        break;
      }

      default:
        throw new BadRequestException(
          `지원하지 않는 상품 타입입니다: ${existingProduct.type}`
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

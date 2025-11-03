import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RepositoryProvider } from '@src/module/shared/transaction/repository.provider';
import { HotelTemplateEntity } from '@src/module/backoffice/domain/hotel-template.entity';
import { DeliveryTemplateEntity } from '@src/module/backoffice/domain/delivery-template.entity';
import { ETicketTemplateEntity } from '@src/module/backoffice/domain/eticket-template.entity';
import { DeliveryEntity } from '@src/module/backoffice/domain/delivery.entity';
import { validateCategoriesExist } from '@src/module/backoffice/domain/category.entity';
import { upsertProductCategory } from '@src/module/backoffice/domain/product-template-category.entity';
import type {
  FindAllProductTemplateQuery,
  ProductTemplateListItem,
  ProductTemplateListResponse,
  CreateProductTemplateInput,
  CreateProductTemplateResponse,
  ProductTemplateDetail,
} from './product-template.dto';

@Injectable()
export class ProductTemplateService {
  constructor(private readonly repositoryProvider: RepositoryProvider) {}

  async findAll(
    query: FindAllProductTemplateQuery
  ): Promise<ProductTemplateListResponse> {
    const {
      page = 1,
      limit = 30,
      orderBy = 'createdAt',
      order = 'DESC',
      type,
      name,
      dateFilterType = 'CREATED_AT',
      startDate,
      endDate,
      useStock,
      brandIds,
    } = query;

    // QueryBuilder 사용 - 데코레이터 제거로 이제 안전하게 사용 가능
    const queryBuilder =
      this.repositoryProvider.ProductTemplateRepository.createQueryBuilder(
        'template'
      ).leftJoinAndSelect('template.brand', 'brand');

    // WHERE 조건 적용
    if (type) {
      queryBuilder.andWhere('template.type = :type', { type });
    }
    if (name) {
      queryBuilder.andWhere('template.name LIKE :name', { name: `%${name}%` });
    }
    if (useStock !== undefined) {
      queryBuilder.andWhere('template.useStock = :useStock', { useStock });
    }
    if (brandIds && brandIds.length > 0) {
      queryBuilder.andWhere('template.brandId IN (:...brandIds)', { brandIds });
    }
    if (startDate && endDate) {
      const dateField =
        dateFilterType === 'CREATED_AT'
          ? 'template.createdAt'
          : 'template.updatedAt';
      queryBuilder.andWhere(`${dateField} BETWEEN :startDate AND :endDate`, {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    // 정렬 및 페이지네이션
    queryBuilder
      .orderBy(`template.${orderBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    // 데이터 조회
    const [templates, total] = await queryBuilder.getManyAndCount();

    // 총 페이지 수 계산
    const totalPages = Math.ceil(total / limit);

    // Response 포맷팅
    const formattedTemplates: ProductTemplateListItem[] = templates.map(
      template => ({
        id: template.id,
        type: template.type,
        name: template.name,
        brand: {
          id: template.brand?.id || 0,
          name: template.brand?.name || '',
        },
        categories: [], // TODO: 카테고리 연동 후 구현
        isIntegrated: false, // TODO: 연동 기능 추가 후 구현
        useStock: template.useStock,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      })
    );

    return {
      data: formattedTemplates,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findById(id: number): Promise<ProductTemplateDetail> {
    // 1. 먼저 ProductTemplateRepository로 id와 type만 확인 (성능 최적화)
    const baseTemplate =
      await this.repositoryProvider.ProductTemplateRepository.findOne({
        where: { id },
        select: ['id', 'type'],
      });

    if (!baseTemplate) {
      throw new NotFoundException(`상품 템플릿을 찾을 수 없습니다 (ID: ${id})`);
    }

    // 2. type에 따라 적절한 Repository에서 전체 데이터 조회
    switch (baseTemplate.type) {
      case 'HOTEL': {
        const hotel =
          await this.repositoryProvider.HotelTemplateRepository.findOneOrFail({
            where: { id },
            relations: ['brand', 'categories'],
          }).catch(() => {
            throw new NotFoundException(
              `호텔 템플릿을 찾을 수 없습니다 (ID: ${id})`
            );
          });

        return {
          type: 'HOTEL',
          id: hotel.id,
          name: hotel.name,
          brandId: hotel.brandId,
          brand: {
            id: hotel.brand.id,
            name: hotel.brand.name,
          },
          categories: hotel.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
          })),
          thumbnailUrls: hotel.thumbnailUrls,
          description: hotel.description,
          detailContent: hotel.detailContent,
          useStock: hotel.useStock,
          baseCapacity: hotel.baseCapacity,
          maxCapacity: hotel.maxCapacity,
          checkInTime: hotel.checkInTime,
          checkOutTime: hotel.checkOutTime,
          bedTypes: hotel.bedTypes,
          tags: hotel.tags,
          createdAt: hotel.createdAt,
          updatedAt: hotel.updatedAt,
        };
      }

      case 'DELIVERY': {
        const delivery =
          await this.repositoryProvider.DeliveryTemplateRepository.findOneOrFail(
            {
              where: { id },
              relations: ['brand', 'categories'],
            }
          ).catch(() => {
            throw new NotFoundException(
              `배송상품 템플릿을 찾을 수 없습니다 (ID: ${id})`
            );
          });

        const result: ProductTemplateDetail = {
          type: 'DELIVERY',
          id: delivery.id,
          name: delivery.name,
          brandId: delivery.brandId,
          brand: {
            id: delivery.brand.id,
            name: delivery.brand.name,
          },
          categories: delivery.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
          })),
          thumbnailUrls: delivery.thumbnailUrls,
          description: delivery.description,
          detailContent: delivery.detailContent,
          useStock: delivery.useStock,
          useOptions: delivery.useOptions,
          delivery: {
            deliveryFeeType: delivery.delivery.deliveryFeeType,
            deliveryFee: delivery.delivery.deliveryFee,
            freeDeliveryMinAmount: delivery.delivery.freeDeliveryMinAmount,
            returnDeliveryFee: delivery.delivery.returnDeliveryFee,
            exchangeDeliveryFee: delivery.delivery.exchangeDeliveryFee,
            remoteAreaExtraFee: delivery.delivery.remoteAreaExtraFee,
            jejuExtraFee: delivery.delivery.jejuExtraFee,
            isJejuRestricted: delivery.delivery.isJejuRestricted,
            isRemoteIslandRestricted:
              delivery.delivery.isRemoteIslandRestricted,
          },
          exchangeReturnInfo: delivery.exchangeReturnInfo,
          productInfoNotice: delivery.productInfoNotice,
          createdAt: delivery.createdAt,
          updatedAt: delivery.updatedAt,
        };
        return result;
      }

      case 'E-TICKET': {
        const eticket =
          await this.repositoryProvider.ETicketTemplateRepository.findOneOrFail(
            {
              where: { id },
              relations: ['brand', 'categories'],
            }
          ).catch(() => {
            throw new NotFoundException(
              `E-Ticket 템플릿을 찾을 수 없습니다 (ID: ${id})`
            );
          });

        return {
          type: 'E-TICKET',
          id: eticket.id,
          name: eticket.name,
          brandId: eticket.brandId,
          brand: {
            id: eticket.brand.id,
            name: eticket.brand.name,
          },
          categories: eticket.categories.map(cat => ({
            id: cat.id,
            name: cat.name,
          })),
          thumbnailUrls: eticket.thumbnailUrls,
          description: eticket.description,
          detailContent: eticket.detailContent,
          useStock: eticket.useStock,
          useOptions: eticket.useOptions,
          createdAt: eticket.createdAt,
          updatedAt: eticket.updatedAt,
        };
      }

      default:
        throw new BadRequestException(
          `지원하지 않는 상품 타입입니다: ${baseTemplate.type}`
        );
    }
  }

  async create(
    input: CreateProductTemplateInput
  ): Promise<CreateProductTemplateResponse> {
    // 1. 브랜드 존재 여부 확인
    const brand = await this.repositoryProvider.BrandRepository.findOne({
      where: { id: input.brandId },
    });

    if (!brand) {
      throw new NotFoundException(
        `브랜드를 찾을 수 없습니다 (ID: ${input.brandId})`
      );
    }

    // 2. 카테고리 존재 여부 확인 (categoryIds가 제공된 경우)
    if (input.categoryIds && input.categoryIds.length > 0) {
      await validateCategoriesExist(input.categoryIds);
    }

    // 3. 타입에 따라 적절한 Entity 생성 및 저장
    let savedTemplate:
      | HotelTemplateEntity
      | DeliveryTemplateEntity
      | ETicketTemplateEntity;

    switch (input.type) {
      case 'HOTEL': {
        // Hotel 필수 필드 검증
        if (
          !input.baseCapacity ||
          !input.maxCapacity ||
          !input.checkInTime ||
          !input.checkOutTime
        ) {
          throw new BadRequestException(
            '호텔 템플릿 생성 시 기준인원, 최대인원, 입실시간, 퇴실시간은 필수입니다'
          );
        }

        const hotelTemplate = new HotelTemplateEntity();
        hotelTemplate.name = input.name;
        hotelTemplate.brandId = input.brandId;
        hotelTemplate.thumbnailUrls = input.thumbnailUrls || [];
        hotelTemplate.description = input.description || '';
        hotelTemplate.detailContent = input.detailContent || '';
        hotelTemplate.useStock = input.useStock || false;
        hotelTemplate.baseCapacity = input.baseCapacity;
        hotelTemplate.maxCapacity = input.maxCapacity;
        hotelTemplate.checkInTime = input.checkInTime;
        hotelTemplate.checkOutTime = input.checkOutTime;
        hotelTemplate.bedTypes = input.bedTypes || [];
        hotelTemplate.tags = input.tags || [];

        savedTemplate =
          await this.repositoryProvider.HotelTemplateRepository.save(
            hotelTemplate
          );
        break;
      }

      case 'DELIVERY': {
        // Delivery 필수 필드 검증
        if (!input.delivery) {
          throw new BadRequestException(
            '배송상품 템플릿 생성 시 배송 정책은 필수입니다'
          );
        }

        const deliveryTemplate = new DeliveryTemplateEntity();
        deliveryTemplate.name = input.name;
        deliveryTemplate.brandId = input.brandId;
        deliveryTemplate.thumbnailUrls = input.thumbnailUrls || [];
        deliveryTemplate.description = input.description || '';
        deliveryTemplate.detailContent = input.detailContent || '';
        deliveryTemplate.useStock = input.useStock || false;
        deliveryTemplate.useOptions = input.useOptions || false;
        deliveryTemplate.exchangeReturnInfo = input.exchangeReturnInfo || '';
        deliveryTemplate.productInfoNotice = input.productInfoNotice || '';

        // 배송 정책 임베디드 객체 생성
        const delivery = new DeliveryEntity();
        Object.assign(delivery, input.delivery);
        deliveryTemplate.delivery = delivery;

        savedTemplate =
          await this.repositoryProvider.DeliveryTemplateRepository.save(
            deliveryTemplate
          );
        break;
      }

      case 'E-TICKET': {
        const eticketTemplate = new ETicketTemplateEntity();
        eticketTemplate.name = input.name;
        eticketTemplate.brandId = input.brandId;
        eticketTemplate.thumbnailUrls = input.thumbnailUrls || [];
        eticketTemplate.description = input.description || '';
        eticketTemplate.detailContent = input.detailContent || '';
        eticketTemplate.useStock = input.useStock || false;
        eticketTemplate.useOptions = input.useOptions || false;

        savedTemplate =
          await this.repositoryProvider.ETicketTemplateRepository.save(
            eticketTemplate
          );
        break;
      }

      default:
        throw new BadRequestException(
          `지원하지 않는 상품 타입입니다: ${input.type}`
        );
    }

    // 4. 카테고리 연결 (categoryIds가 제공된 경우)
    if (input.categoryIds && input.categoryIds.length > 0) {
      await upsertProductCategory(savedTemplate.id, input.categoryIds);
    }

    return {
      id: savedTemplate.id,
      type: savedTemplate.type,
      name: savedTemplate.name,
      message: '상품 템플릿이 생성되었습니다',
    };
  }
}

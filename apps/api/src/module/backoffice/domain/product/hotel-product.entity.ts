import { Entity, Column, EntityManager } from 'typeorm';
import { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import type { Nullish } from '@src/types/utility.type';

export interface CreateHotelProductInput {
  name: string;
  brandId: number;
  productTemplateId?: Nullish<number>;
  thumbnailUrls?: string[];
  description?: string;
  detailContent?: string;
  useStock?: boolean;
  useOptions?: boolean;
  price: number;
  status?: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT';
  displayOrder?: Nullish<number>;
  baseCapacity: number;
  maxCapacity: number;
  checkInTime: string;
  checkOutTime: string;
  bedTypes?: string[];
  tags?: string[];
}

export interface UpdateHotelProductInput extends CreateHotelProductInput {
  id: number;
}

@Entity('hotel_product')
export class HotelProductEntity extends ProductEntity {
  constructor() {
    super();
    this.type = ProductTypeEnum.HOTEL;
    this.useCalendar = true; // 숙박은 항상 캘린더 사용
  }

  // 기준인원
  @Column({ name: 'base_capacity', type: 'integer' })
  baseCapacity: number;

  // 최대인원
  @Column({ name: 'max_capacity', type: 'integer' })
  maxCapacity: number;

  // 입실 시간
  @Column({ name: 'check_in_time', type: 'time' })
  checkInTime: string;

  // 퇴실시간
  @Column({ name: 'check_out_time', type: 'time' })
  checkOutTime: string;

  // 침대구성 (리스트)
  @Column('jsonb', { default: [] })
  bedTypes: string[];

  // 태그 (리스트)
  @Column('jsonb', { default: [] })
  tags: string[];

  // 헬퍼 메서드: Entity 생성
  static createFromInput(input: CreateHotelProductInput): HotelProductEntity {
    const product = new HotelProductEntity();
    product.name = input.name;
    product.brandId = input.brandId;
    product.productTemplateId = input.productTemplateId || null;
    product.thumbnailUrls = input.thumbnailUrls || [];
    product.description = input.description || '';
    product.detailContent = input.detailContent || '';
    product.useStock = input.useStock || false;
    product.useOptions = input.useOptions || false;
    product.price = input.price;
    product.status = input.status || 'VISIBLE';
    product.displayOrder = input.displayOrder || null;
    product.baseCapacity = input.baseCapacity;
    product.maxCapacity = input.maxCapacity;
    product.checkInTime = input.checkInTime;
    product.checkOutTime = input.checkOutTime;
    product.bedTypes = input.bedTypes || [];
    product.tags = input.tags || [];
    return product;
  }

  // 헬퍼 메서드: Entity 업데이트
  updateFromInput(input: UpdateHotelProductInput): void {
    this.name = input.name;
    this.brandId = input.brandId;
    this.productTemplateId = input.productTemplateId || null;
    this.thumbnailUrls = input.thumbnailUrls || [];
    this.description = input.description || '';
    this.detailContent = input.detailContent || '';
    this.useStock = input.useStock || false;
    this.useOptions = input.useOptions || false;
    this.price = input.price;
    this.status = input.status || 'VISIBLE';
    this.displayOrder = input.displayOrder || null;
    this.baseCapacity = input.baseCapacity;
    this.maxCapacity = input.maxCapacity;
    this.checkInTime = input.checkInTime;
    this.checkOutTime = input.checkOutTime;
    this.bedTypes = input.bedTypes || [];
    this.tags = input.tags || [];
  }
}

export const getHotelProductRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(HotelProductEntity);

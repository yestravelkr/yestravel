import { Entity, EntityManager } from 'typeorm';
import { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import type { Nullish } from '@src/types/utility.type';

export interface CreateETicketProductInput {
  name: string;
  brandId: number;
  productTemplateId?: Nullish<number>;
  thumbnailUrls?: string[];
  description?: string;
  detailContent?: string;
  useCalendar?: boolean;
  useStock?: boolean;
  useOptions?: boolean;
  price: number;
  status?: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT';
  displayOrder?: Nullish<number>;
}

export interface UpdateETicketProductInput extends CreateETicketProductInput {
  id: number;
}

/**
 * ETicketProductEntity - E-Ticket 상품 엔티티
 *
 * ProductEntity를 상속받습니다.
 * 같은 'product' 테이블을 사용하며, type='E-TICKET'인 상품을 조회합니다.
 * E-Ticket은 부모(ProductEntity)의 필드만 사용합니다.
 */
@Entity('product')
export class ETicketProductEntity extends ProductEntity {
  constructor() {
    super();
    this.type = ProductTypeEnum['E-TICKET'];
  }

  // E-Ticket은 부모(ProductEntity)의 필드만 사용
  // useCalendar, useStock, useOptions는 사용자가 선택

  // 헬퍼 메서드: Entity 생성
  static createFromInput(
    input: CreateETicketProductInput
  ): ETicketProductEntity {
    const product = new ETicketProductEntity();
    product.name = input.name;
    product.brandId = input.brandId;
    product.productTemplateId = input.productTemplateId || null;
    product.thumbnailUrls = input.thumbnailUrls || [];
    product.description = input.description || '';
    product.detailContent = input.detailContent || '';
    product.useCalendar = input.useCalendar || false;
    product.useStock = input.useStock || false;
    product.useOptions = input.useOptions || false;
    product.price = input.price;
    product.status = input.status || 'VISIBLE';
    product.displayOrder = input.displayOrder || null;
    return product;
  }

  // 헬퍼 메서드: Entity 업데이트
  updateFromInput(input: UpdateETicketProductInput): void {
    this.name = input.name;
    this.brandId = input.brandId;
    this.productTemplateId = input.productTemplateId || null;
    this.thumbnailUrls = input.thumbnailUrls || [];
    this.description = input.description || '';
    this.detailContent = input.detailContent || '';
    this.useCalendar = input.useCalendar || false;
    this.useStock = input.useStock || false;
    this.useOptions = input.useOptions || false;
    this.price = input.price;
    this.status = input.status || 'VISIBLE';
    this.displayOrder = input.displayOrder || null;
  }
}

export const getETicketProductRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(ETicketProductEntity);

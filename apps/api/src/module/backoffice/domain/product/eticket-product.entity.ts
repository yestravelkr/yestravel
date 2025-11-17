import { Entity, EntityManager } from 'typeorm';
import { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('eticket_product')
export class ETicketProductEntity extends ProductEntity {
  constructor() {
    super();
    this.type = ProductTypeEnum['E-TICKET'];
  }

  // E-Ticket은 부모(ProductEntity)의 필드만 사용
  // useCalendar, useStock, useOptions는 사용자가 선택
}

export const getETicketProductRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(ETicketProductEntity);

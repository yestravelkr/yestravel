import { Entity, Column, EntityManager } from 'typeorm';
import { ProductTemplateEntity } from '@src/module/backoffice/domain/product-template.entity';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('eticket_template')
export class ETicketTemplateEntity extends ProductTemplateEntity {
  constructor() {
    super();
    this.type = ProductTypeEnum['E-TICKET'];
  }

  // TODO: 카테고리 선택 (Category 엔티티 연동 예정)
  // @Column({ name: 'category_id', type: 'integer', nullable: true })
  // categoryId: Nullish<number>;
  //
  // @ManyToOne(() => CategoryEntity)
  // @JoinColumn({ name: 'category_id' })
  // category: CategoryEntity;

  // 재고 사용 여부
  @Column({ name: 'use_stock', type: 'boolean', default: false })
  useStock: boolean;

  // 옵션 사용 여부
  @Column({ name: 'use_options', type: 'boolean', default: false })
  useOptions: boolean;

  // TODO: 옵션 설정 (ProductOption 엔티티 분리 예정)
  // @OneToMany(() => ProductOptionEntity, option => option.eticketTemplate)
  // options: ProductOptionEntity[];
}

export const getETicketTemplateRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(ETicketTemplateEntity);

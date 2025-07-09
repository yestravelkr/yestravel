import { Column, Entity, TableInheritance } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';

export enum ProductType {
  HOTEL = 'HOTEL',
  'E-TICKET' = 'E-TICKET',
  DELIVERY = 'DELIVERY',
}

@Entity('product')
@TableInheritance({
  column: {
    type: 'enum',
    enum: ProductType,
  },
})
export abstract class BaseProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  price: number;
}

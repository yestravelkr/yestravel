import { Entity, Column } from 'typeorm';
import {
  BaseProductEntity,
  ProductType,
} from '@src/module/backoffice/domain/base-product.entity';

@Entity('hotel_product')
export class HotelProductEntity extends BaseProductEntity {
  constructor() {
    super();
    this.type = ProductType.HOTEL;
  }

  @Column()
  hotelName: string;

  @Column()
  address: string;

  // 룸 옵션 리스트
}

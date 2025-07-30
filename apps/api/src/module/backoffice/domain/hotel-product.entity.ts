import { Entity, Column, ChildEntity } from 'typeorm';
import {
  ProductEntity,
  ProductType,
} from '@src/module/backoffice/domain/product.entity';

@Entity('hotel_product')
@ChildEntity(ProductType.HOTEL)
export class HotelProductEntity extends ProductEntity {
  constructor() {
    super();
    this.type = ProductType.HOTEL;
  }

  @Column({ name: 'hotel_name' })
  hotelName: string;

  @Column()
  address: string;

  // TODO: 룸 옵션 리스트 추가
}

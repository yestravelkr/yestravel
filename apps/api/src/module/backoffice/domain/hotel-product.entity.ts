import { Entity, Column, ChildEntity } from 'typeorm';
import { ProductEntity } from '@src/module/backoffice/domain/product.entity';
import { ProductTypeEnumType, ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';

@Entity('hotel_product')
@ChildEntity(ProductTypeEnum.HOTEL)
export class HotelProductEntity extends ProductEntity {
  constructor() {
    super();
    this.type = ProductTypeEnum.HOTEL;
  }

  @Column({ name: 'hotel_name' })
  hotelName: string;

  @Column()
  address: string;

  // TODO: 룸 옵션 리스트 추가
}

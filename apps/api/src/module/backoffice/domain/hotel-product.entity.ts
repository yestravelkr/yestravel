import { ChildEntity, Column } from 'typeorm';

@ChildEntity('hotelProduct')
export class HotelProductEntity {
  @Column()
  hotelName: string;

  @Column()
  address: string;

  // 룸 옵션 리스트
}

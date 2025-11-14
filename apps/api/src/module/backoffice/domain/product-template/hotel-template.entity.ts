import { Entity, Column, EntityManager } from 'typeorm';
import { ProductTemplateEntity } from '@src/module/backoffice/domain/product-template/product-template.entity';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

@Entity('hotel_template')
export class HotelTemplateEntity extends ProductTemplateEntity {
  constructor() {
    super();
    this.type = ProductTypeEnum.HOTEL;
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

  // TODO: 호텔 엔티티와 연동
  // @Column({ name: 'hotel_id', type: 'integer', nullable: true })
  // hotelId: Nullish<number>;
  //
  // @ManyToOne(() => HotelEntity)
  // @JoinColumn({ name: 'hotel_id' })
  // hotel: HotelEntity;
}

export const getHotelTemplateRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(HotelTemplateEntity);

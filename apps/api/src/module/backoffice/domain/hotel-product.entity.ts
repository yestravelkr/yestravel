import { Entity, Column, EntityManager } from 'typeorm';
import { ProductEntity } from '@src/module/backoffice/domain/product.entity';
import { ProductTypeEnum } from '@src/module/backoffice/admin/admin.schema';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';

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
}

export const getHotelProductRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(HotelProductEntity);
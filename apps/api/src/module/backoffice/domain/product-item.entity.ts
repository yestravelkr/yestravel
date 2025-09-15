import { Entity, Column, ManyToOne, JoinColumn, EntityManager } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { BrandEntity } from '@src/module/backoffice/domain/brand.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { Nullish } from '@src/types/utility.type';

@Entity('product_item')
export class ProductItemEntity extends BaseEntity {
  // 상품 썸네일 (이미지 url 여러개가능)
  @Column('text', { array: true, nullable: true })
  thumbnailUrls: Nullish<string[]>;

  // 상품명
  @Column()
  name: string;

  // 상품 설명
  @Column('text', { nullable: true })
  description: Nullish<string>;

  // 상세페이지 내용 (HTML 태그 포함 에디터 콘텐츠)
  @Column('text', { nullable: true })
  detailContent: Nullish<string>;

  // 브랜드 (브랜드 id로 연결)
  @Column({ name: 'brand_id', type: 'integer' })
  brandId: number;

  @ManyToOne(() => BrandEntity)
  @JoinColumn({ name: 'brand_id' })
  brand: BrandEntity;

  // 호텔 (호텔 관련 테이블 따로 만들 예정 - 추후 구현)
  // @Column({ name: 'hotel_id', type: 'integer', nullable: true })
  // hotelId: Nullish<number>;

  // @ManyToOne(() => HotelEntity)
  // @JoinColumn({ name: 'hotel_id' })
  // hotel: HotelEntity;

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
  @Column('text', { array: true, nullable: true })
  bedTypes: Nullish<string[]>;

  // 태그 (리스트)
  @Column('text', { array: true, nullable: true })
  tags: Nullish<string[]>;

  // 재고 관리 관련 - 추후 달력별 재고 연동 시스템 구현 예정
  // 현재는 단순 재고 수량만 관리, 추후 별도 InventoryEntity와 연동
  // @Column({ name: 'stock_quantity', type: 'integer', default: 0 })
  // stockQuantity: number;

  // TODO: 달력별 재고 시스템 구현 시 고려사항
  // - ProductItemInventory 엔티티 생성
  // - 날짜별 재고 수량 관리
  // - 예약 시스템과 연동
  // - 실시간 재고 업데이트
}

export const getProductItemRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(ProductItemEntity);

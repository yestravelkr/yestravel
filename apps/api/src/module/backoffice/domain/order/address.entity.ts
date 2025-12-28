import { Column } from 'typeorm';

/**
 * AddressEntity - 배송지 정보 Embeddable Entity
 *
 * 배송 상품 주문 시 사용되는 배송지 정보입니다.
 * Order 엔티티에 embedded로 포함됩니다.
 */
export class AddressEntity {
  /** 주소 (도로명/지번 주소) */
  @Column({ name: 'address', type: 'varchar', length: 500, nullable: true })
  address: string | null;

  /** 상세 주소 */
  @Column({ name: 'address_detail', type: 'varchar', length: 200, nullable: true })
  detail: string | null;

  /** 우편번호 */
  @Column({ name: 'postal_code', type: 'varchar', length: 10, nullable: true })
  postalCode: string | null;
}

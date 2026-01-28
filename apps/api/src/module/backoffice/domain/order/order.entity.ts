import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  EntityManager,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';
import { InfluencerEntity } from '@src/module/backoffice/domain/influencer.entity';
import { CampaignEntity } from '@src/module/backoffice/domain/campaign.entity';
import { MemberEntity } from '@src/module/backoffice/domain/shop/member.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { AddressEntity } from './address.entity';
import Sqids from 'sqids';
import dayjs from 'dayjs';
import { ConfigProvider } from '@src/config';
import { PaymentEntity } from '@src/module/backoffice/domain/order/payment.entity';
import type { HotelOrderOptionData } from '@src/module/backoffice/domain/order/hotel-order.entity';
import type { TmpOrderRawData } from './tmp-order.entity';
import {
  PRODUCT_TYPE_ENUM_VALUE,
  ProductTypeEnumType,
} from '@src/module/backoffice/admin/admin.schema';

/**
 * 주문 상태 Enum
 */
export const ORDER_STATUS_ENUM_VALUE = [
  'PENDING',
  'PAID',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
] as const;

export type OrderStatusEnumType = (typeof ORDER_STATUS_ENUM_VALUE)[number];

export const OrderStatusEnum = {
  /** 결제 대기 */
  PENDING: 'PENDING',
  /** 결제 완료 */
  PAID: 'PAID',
  /** 이용 완료 */
  COMPLETED: 'COMPLETED',
  /** 취소 */
  CANCELLED: 'CANCELLED',
  /** 환불 */
  REFUNDED: 'REFUNDED',
} as const;

const sqids = new Sqids({
  minLength: 8,
  alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
});

/**
 * OrderNumber Parser
 *
 * 형식: ${ENV_PREFIX}ORD${YYYY-MM-DD}-${encodedNumber}
 * - production: ORD2026-01-27-ABC12345
 * - development: DORD2026-01-27-ABC12345
 * - localdev: LORD2026-01-27-ABC12345
 */
export const orderNumberParser = {
  /**
   * 주문번호 인코딩
   * @param ids - [orderId] 배열
   * @param date - 주문 생성 날짜
   */
  encode(ids: number[], date: Date): string {
    const envPrefix = ConfigProvider.envPrefix;
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    const encoded = sqids.encode(ids);
    return `${envPrefix}ORD${dateStr}-${encoded}`;
  },

  /**
   * 주문번호 디코딩
   * @param orderNumber - 주문번호 문자열
   * @returns [orderId] 배열
   */
  decode(orderNumber: string): number[] {
    // 마지막 '-' 이후의 인코딩된 부분만 추출
    const encoded = orderNumber.slice(orderNumber.lastIndexOf('-') + 1);
    return sqids.decode(encoded);
  },
};

/**
 * OrderEntity - 주문 엔티티
 *
 * 호텔/배송/E-Ticket 상품의 주문 정보를 저장합니다.
 * type 컬럼으로 상품 종류를 구분합니다.
 */
@Entity('order')
@Index('IDX_order_status', ['status'])
@Index('IDX_order_type', ['type'])
@Index('IDX_order_product_id', ['productId'])
@Index('IDX_order_influencer_id', ['influencerId'])
@Index('IDX_order_campaign_id', ['campaignId'])
@Index('IDX_order_member_id', ['memberId'])
export class OrderEntity extends BaseEntity {
  /**
   * TmpOrderRawData에서 OrderEntity 인스턴스 생성
   */
  static from(raw: TmpOrderRawData, memberId: number): OrderEntity {
    const order = new OrderEntity();

    order.type = raw.orderOptionSnapshot.type;
    order.memberId = memberId;
    order.customerName = raw.customerName;
    order.customerPhone = raw.customerPhone;
    order.productId = raw.productId;
    order.totalAmount = raw.totalAmount;
    order.influencerId = raw.influencerId;
    order.campaignId = raw.campaignId;
    order.orderOptionSnapshot = raw.orderOptionSnapshot;
    order.status = OrderStatusEnum.PENDING;

    // 배송지 정보 설정
    order.shippingAddress = new AddressEntity();
    if (raw.shippingAddress) {
      order.shippingAddress.address = raw.shippingAddress.address;
      order.shippingAddress.detail = raw.shippingAddress.detail;
      order.shippingAddress.postalCode = raw.shippingAddress.postalCode;
    } else {
      order.shippingAddress.address = null;
      order.shippingAddress.detail = null;
      order.shippingAddress.postalCode = null;
    }

    return order;
  }

  get orderNumber(): string {
    return orderNumberParser.encode([this.id], this.createdAt);
  }

  /** 주문 타입 (HOTEL, E-TICKET, DELIVERY) */
  @Column({
    type: 'enum',
    enum: PRODUCT_TYPE_ENUM_VALUE,
  })
  type: ProductTypeEnumType;

  /** 주문 상태 */
  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: OrderStatusEnum.PENDING,
  })
  status: OrderStatusEnumType;

  // ===== 고객 정보 (이용자/수령인) =====

  /** 고객 이름 */
  @Column({ type: 'varchar', length: 20 })
  customerName: string;

  /** 수신자 전화번호 */
  @Column({ type: 'varchar', length: 20 })
  customerPhone: string;

  // ===== 배송지 정보 (배송 상품용, embedded) =====

  /** 배송지 주소 */
  @Column(() => AddressEntity, { prefix: 'shipping' })
  shippingAddress: AddressEntity;

  // ===== 상품 정보 =====

  /** 상품 ID (참조용) */
  @Column()
  productId: number;

  /** 상품 관계 */
  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  /** 상품 정보 스냅샷 (Raw JSON) */
  @Column({ type: 'jsonb' })
  orderOptionSnapshot: HotelOrderOptionData;

  // ===== 금액 정보 =====

  /** 총 결제 금액 */
  @Column()
  totalAmount: number;

  // ===== 추적 정보 (인플루언서/캠페인) =====

  /** 인플루언서 ID (어떤 인플루언서를 통해 주문했는지) */
  @Column()
  influencerId: number;

  /** 인플루언서 관계 */
  @ManyToOne(() => InfluencerEntity)
  @JoinColumn({ name: 'influencer_id' })
  influencer: InfluencerEntity;

  /** 캠페인 ID */
  @Column()
  campaignId: number;

  /** 캠페인 관계 */
  @ManyToOne(() => CampaignEntity)
  @JoinColumn({ name: 'campaign_id' })
  campaign: CampaignEntity;

  @OneToMany(() => PaymentEntity, payment => payment.order)
  payments: PaymentEntity[];

  // ===== 회원 정보 (Shop 회원과 연결) =====

  /** 회원 ID */
  @Column()
  memberId: number;

  /** 회원 관계 */
  @ManyToOne(() => MemberEntity)
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
}

export const getOrderRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(OrderEntity);

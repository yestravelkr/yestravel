import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  EntityManager,
  Index, OneToMany,
} from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { ProductEntity } from '@src/module/backoffice/domain/product/product.entity';
import { InfluencerEntity } from '@src/module/backoffice/domain/influencer.entity';
import { CampaignEntity } from '@src/module/backoffice/domain/campaign.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import { AddressEntity } from './address.entity';
import type { Nullish } from '@src/types/utility.type';
import Sqids from 'sqids';
import {PaymentEntity} from "@src/module/backoffice/domain/order/payment.entity";
import {HotelOrderOptionData} from "@src/module/backoffice/domain/order/hotel-order.entity";
import type { TmpOrderRawData } from "./tmp-order.entity";

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

export const orderNumberParser = new Sqids({ minLength: 8, alphabet: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' });

/**
 * OrderEntity - 주문 엔티티 (Base)
 *
 * 호텔/배송/E-Ticket 상품의 주문 정보를 저장합니다.
 * 상품 타입별로 HotelOrderEntity 등 자식 엔티티로 확장됩니다.
 */
@Entity('order')
@Index('IDX_order_status', ['status'])
@Index('IDX_order_product_id', ['productId'])
@Index('IDX_order_influencer_id', ['influencerId'])
@Index('IDX_order_campaign_id', ['campaignId'])
export class OrderEntity extends BaseEntity {
  /**
   * TmpOrderRawData에서 OrderEntity 인스턴스 생성
   */
  static from(raw: TmpOrderRawData): OrderEntity {
    const order = new OrderEntity();

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
    const [number] = orderNumberParser.encode([this.id])
    return number;
  }

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

}

export const getOrderRepository = (source?: TransactionService | EntityManager) =>
  getEntityManager(source).getRepository(OrderEntity);

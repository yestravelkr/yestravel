import { Entity, Column, EntityManager } from 'typeorm';
import { BaseEntity } from '@src/module/backoffice/domain/base.entity';
import { TransactionService } from '@src/module/shared/transaction/transaction.service';
import { getEntityManager } from '@src/database/datasources';
import {
  DeliveryFeeTypeEnumType,
  DELIVERY_FEE_TYPE_ENUM_VALUE,
  DeliveryFeeTypeEnum,
} from '@src/module/backoffice/admin/admin.schema';

/**
 * 배송 정책 Entity
 * - 배송비 관련 정보와 계산 로직을 캡슐화
 * - DDD 패턴으로 비즈니스 로직 포함
 * - 여러 상품 템플릿이 공유 가능
 */
@Entity('delivery')
export class DeliveryEntity extends BaseEntity {
  // 배송비 설정 (유료 | 조건부 무료 | 무료)
  @Column({
    name: 'delivery_fee_type',
    type: 'enum',
    enum: DELIVERY_FEE_TYPE_ENUM_VALUE,
  })
  deliveryFeeType: DeliveryFeeTypeEnumType;

  // 배송비
  @Column({ name: 'delivery_fee', type: 'integer', default: 0 })
  deliveryFee: number;

  // 무료 배송 조건 (금액)
  @Column({ name: 'free_delivery_min_amount', type: 'integer', default: 0 })
  freeDeliveryMinAmount: number;

  // 반품 배송비
  @Column({ name: 'return_delivery_fee', type: 'integer', default: 0 })
  returnDeliveryFee: number;

  // 교환 배송비
  @Column({ name: 'exchange_delivery_fee', type: 'integer', default: 0 })
  exchangeDeliveryFee: number;

  // 도서산간 추가 배송비
  @Column({ name: 'remote_area_extra_fee', type: 'integer', default: 0 })
  remoteAreaExtraFee: number;

  // 제주도 추가 배송비
  @Column({ name: 'jeju_extra_fee', type: 'integer', default: 0 })
  jejuExtraFee: number;

  // 제주 배송 제한 여부
  @Column({ name: 'is_jeju_restricted', type: 'boolean', default: false })
  isJejuRestricted: boolean;

  // 도서산간 배송 제한 여부
  @Column({
    name: 'is_remote_island_restricted',
    type: 'boolean',
    default: false,
  })
  isRemoteIslandRestricted: boolean;

  /**
   * DDD: 배송비 계산 메서드
   * @param address - 배송 주소 정보
   * @param totalProductPrice - 상품 총 금액
   * @returns 최종 배송비
   */
  calcFee(address: DeliveryAddress, totalProductPrice: number): number {
    // 1. 기본 배송비 결정
    let baseFee = this.getBaseFee(totalProductPrice);

    // 2. 지역별 추가 배송비
    const extraFee = this.getExtraFee(address);

    return baseFee + extraFee;
  }

  /**
   * 기본 배송비 계산
   */
  private getBaseFee(totalProductPrice: number): number {
    switch (this.deliveryFeeType) {
      case DeliveryFeeTypeEnum.FREE:
        return 0;

      case DeliveryFeeTypeEnum.CONDITIONAL_FREE:
        return totalProductPrice >= this.freeDeliveryMinAmount
          ? 0
          : this.deliveryFee;

      case DeliveryFeeTypeEnum.PAID:
        return this.deliveryFee;

      default:
        return this.deliveryFee;
    }
  }

  /**
   * 지역별 추가 배송비 계산
   */
  private getExtraFee(address: DeliveryAddress): number {
    if (this.isJejuArea(address)) {
      return this.jejuExtraFee;
    }

    if (this.isRemoteIslandArea(address)) {
      return this.remoteAreaExtraFee;
    }

    return 0;
  }

  /**
   * 제주도 지역 확인
   */
  private isJejuArea(address: DeliveryAddress): boolean {
    const jejuKeywords = ['제주', '서귀포'];
    return jejuKeywords.some(keyword => address.city?.includes(keyword));
  }

  /**
   * 도서산간 지역 확인
   */
  private isRemoteIslandArea(address: DeliveryAddress): boolean {
    const remoteIslands = [
      '울릉',
      '독도',
      '백령',
      '대청',
      '소청',
      '연평',
      '덕적',
      '자월',
      '영흥',
    ];
    return remoteIslands.some(
      area => address.city?.includes(area) || address.district?.includes(area)
    );
  }

  /**
   * 배송 가능 여부 확인
   */
  canDeliver(address: DeliveryAddress): boolean {
    // 제주 배송 제한 체크
    if (this.isJejuRestricted && this.isJejuArea(address)) {
      return false;
    }

    // 도서산간 배송 제한 체크
    if (this.isRemoteIslandRestricted && this.isRemoteIslandArea(address)) {
      return false;
    }

    return true;
  }

  /**
   * 무료 배송 가능 여부 확인
   */
  isFreeDelivery(totalProductPrice: number): boolean {
    if (this.deliveryFeeType === DeliveryFeeTypeEnum.FREE) {
      return true;
    }

    if (this.deliveryFeeType === DeliveryFeeTypeEnum.CONDITIONAL_FREE) {
      return totalProductPrice >= this.freeDeliveryMinAmount;
    }

    return false;
  }
}

/**
 * 배송 주소 타입
 */
export interface DeliveryAddress {
  city: string; // 시/도
  district?: string; // 구/군
  street?: string; // 상세 주소
  zipCode?: string; // 우편번호
}

export const getDeliveryRepository = (
  source?: TransactionService | EntityManager
) => getEntityManager(source).getRepository(DeliveryEntity);

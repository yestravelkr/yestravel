import { Injectable } from '@nestjs/common';
import { RoleEnum } from './admin.schema';
import { PartnerManagerStrategyFactory } from './strategy/partner-manager-strategy.factory';
import type { PartnerType } from '../../partner/auth/partner-auth.schema';
import type {
  CreatePartnerManagerInput,
  UpdatePartnerManagerRoleInput,
} from './partner-admin.schema';
import type { PartnerManagerResult } from './strategy/partner-manager.strategy';

/**
 * PartnerAdminService - Brand/Influencer 매니저 통합 CRUD 서비스
 *
 * Strategy Pattern을 사용하여 파트너 타입별 로직을 위임합니다.
 */
@Injectable()
export class PartnerAdminService {
  constructor(
    private readonly strategyFactory: PartnerManagerStrategyFactory
  ) {}

  /**
   * 파트너 매니저 생성
   */
  async createManager(dto: CreatePartnerManagerInput) {
    const strategy = this.strategyFactory.getStrategy(dto.partnerType);
    return strategy.createManager({
      partnerId: dto.partnerId,
      email: dto.email,
      password: dto.password,
      name: dto.name,
      phoneNumber: dto.phoneNumber,
      role: dto.role ?? RoleEnum.PARTNER_SUPER,
    });
  }

  /**
   * 파트너의 매니저 목록 조회
   */
  async findManagers(partnerType: PartnerType, partnerId: number) {
    const strategy = this.strategyFactory.getStrategy(partnerType);
    return strategy.findManagers(partnerId);
  }

  /**
   * 파트너 매니저 삭제
   */
  async deleteManager(partnerType: PartnerType, id: number, partnerId: number) {
    const strategy = this.strategyFactory.getStrategy(partnerType);
    return strategy.deleteManager(id, partnerId);
  }

  /**
   * 파트너 매니저 상세 조회
   */
  async findManagerById(
    partnerType: PartnerType,
    id: number
  ): Promise<PartnerManagerResult> {
    const strategy = this.strategyFactory.getStrategy(partnerType);
    return strategy.findManagerById(id);
  }

  /**
   * 파트너 매니저 권한(role) 수정
   */
  async updateManagerRole(dto: UpdatePartnerManagerRoleInput) {
    const strategy = this.strategyFactory.getStrategy(dto.partnerType);
    return strategy.updateManagerRole({
      id: dto.id,
      partnerId: dto.partnerId,
      role: dto.role,
    });
  }
}

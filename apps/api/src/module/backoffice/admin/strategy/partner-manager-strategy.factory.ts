import { Injectable } from '@nestjs/common';
import type { PartnerType } from '@src/module/partner/auth/partner-auth.schema';
import { PartnerManagerStrategy } from './partner-manager.strategy';
import { BrandManagerStrategy } from './brand-manager.strategy';
import { InfluencerManagerStrategy } from './influencer-manager.strategy';

/**
 * PartnerManagerStrategyFactory - 파트너 타입에 맞는 매니저 전략을 반환하는 팩토리
 */
@Injectable()
export class PartnerManagerStrategyFactory {
  private strategies: Map<PartnerType, PartnerManagerStrategy>;

  constructor(
    private brandStrategy: BrandManagerStrategy,
    private influencerStrategy: InfluencerManagerStrategy
  ) {
    this.strategies = new Map();
    const allStrategies: PartnerManagerStrategy[] = [
      this.brandStrategy,
      this.influencerStrategy,
    ];
    allStrategies.forEach(s => this.strategies.set(s.getSupportedType(), s));
  }

  /**
   * 파트너 타입에 맞는 전략 반환
   * @param type 파트너 타입
   * @throws Error 지원하지 않는 파트너 타입인 경우
   */
  getStrategy(type: PartnerType): PartnerManagerStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Unsupported partner type: ${type}`);
    }
    return strategy;
  }
}

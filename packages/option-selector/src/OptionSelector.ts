/**
 * OptionSelector - 상품 옵션 선택 로직을 담당하는 클래스
 *
 * SKU 그룹 기반으로 옵션을 선택하고, 선택 가능 여부를 검증합니다.
 */

import type { Sku, OptionSelectorConfig, OptionSelectorState } from './types';
import { SkuSelector } from './SkuSelector';

export class OptionSelector {
  private readonly skus: Sku[];
  private readonly skuSelectors: SkuSelector[] = [];
  private readonly config: OptionSelectorConfig;

  constructor(config: OptionSelectorConfig) {
    this.config = config;
    this.skus = config.skus;
    
    // 각 SkuSelectorConfig로부터 SkuSelector 인스턴스 생성
    this.skuSelectors = config.skuSelectors.map(
      (selectorConfig) => new SkuSelector(this.skus, selectorConfig)
    );
  }

  /**
   * 특정 인덱스의 SkuSelector 반환
   */
  getSkuSelector(index: number): SkuSelector | undefined {
    return this.skuSelectors[index];
  }

  /**
   * 모든 SkuSelector 반환
   */
  getAllSkuSelectors(): SkuSelector[] {
    return this.skuSelectors;
  }

  /**
   * 모든 SkuSelector 초기화
   */
  reset(): void {
    this.skuSelectors.forEach((selector) => selector.reset());
  }

  /**
   * 모든 SkuSelector의 선택된 SKU 반환
   */
  getAllSelectedSkus(): (Sku | null)[] {
    return this.skuSelectors.map((selector) => selector.getSelectedSku());
  }

  /**
   * 모든 필수 선택이 완료되었는지 확인
   */
  isAllSelected(): boolean {
    return this.skuSelectors.every((selector) => selector.getSelectedSku() !== null);
  }

  /**
   * 현재 상태를 JSON으로 직렬화
   */
  toJSON(): OptionSelectorState {
    return {
      config: this.config,
      skuSelectorStates: this.skuSelectors.map((selector) => selector.toJSON()),
    };
  }

  /**
   * JSON 데이터로부터 OptionSelector 인스턴스 생성
   */
  static fromJSON(state: OptionSelectorState): OptionSelector {
    const optionSelector = new OptionSelector(state.config);
    
    // 저장된 SkuSelector 상태들을 복원
    state.skuSelectorStates.forEach((selectorState, index) => {
      const selector = SkuSelector.fromJSON(state.config.skus, selectorState);
      optionSelector.skuSelectors[index] = selector;
    });
    
    return optionSelector;
  }
}

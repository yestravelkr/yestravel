/**
 * ProductOptionSelector - 상품 옵션 선택 로직을 담당하는 클래스
 *
 * SKU 그룹 기반으로 옵션을 선택하고, 선택 가능 여부를 검증합니다.
 */

import type { ProductSku, ProductOptionSelectorConfig, ProductOptionSelectorState } from './types';
import { ProductSkuSelector } from './ProductSkuSelector';

export class ProductOptionSelector {
  private readonly skus: ProductSku[];
  private readonly skuSelectors: ProductSkuSelector[] = [];
  private readonly config: ProductOptionSelectorConfig;

  constructor(config: ProductOptionSelectorConfig) {
    this.config = config;
    this.skus = config.skus;
    
    // 각 ProductSkuSelectorConfig로부터 ProductSkuSelector 인스턴스 생성
    this.skuSelectors = config.skuSelectors.map(
      (selectorConfig) => new ProductSkuSelector(this.skus, selectorConfig)
    );
  }

  /**
   * 특정 인덱스의 ProductSkuSelector 반환
   */
  getSkuSelector(index: number): ProductSkuSelector | undefined {
    return this.skuSelectors[index];
  }

  /**
   * 모든 ProductSkuSelector 반환
   */
  getAllSkuSelectors(): ProductSkuSelector[] {
    return this.skuSelectors;
  }

  /**
   * 모든 ProductSkuSelector 초기화
   */
  reset(): void {
    this.skuSelectors.forEach((selector) => selector.reset());
  }

  /**
   * 모든 ProductSkuSelector의 선택된 SKU 반환
   */
  getAllSelectedSkus(): (ProductSku | null)[] {
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
  toJSON(): ProductOptionSelectorState {
    return {
      config: this.config,
      skuSelectorStates: this.skuSelectors.map((selector) => selector.toJSON()),
    };
  }

  /**
   * JSON 데이터로부터 ProductOptionSelector 인스턴스 생성
   */
  static fromJSON(state: ProductOptionSelectorState): ProductOptionSelector {
    const optionSelector = new ProductOptionSelector(state.config);
    
    // 저장된 ProductSkuSelector 상태들을 복원
    state.skuSelectorStates.forEach((selectorState, index) => {
      const selector = ProductSkuSelector.fromJSON(state.config.skus, selectorState);
      optionSelector.skuSelectors[index] = selector;
    });
    
    return optionSelector;
  }
}

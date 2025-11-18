/**
 * ProductSkuSelector - 실제 선택된 Product SKU를 나타내는 클래스
 *
 * 선택 가능한 SKU들과 선택 가능한 속성(attributes) 정보를 담고 있습니다.
 */

import type { ProductSku, ProductSkuSelectorConfig, ProductSkuSelectorState } from './types';

export class ProductSkuSelector {
  private selectedAttributes: Record<string, string | null> = {};
  private selectedSku: ProductSku | null = null;
  private readonly selectableAttributes: Record<string, string[]>;
  private readonly config: ProductSkuSelectorConfig;

  constructor(
    private readonly skus: ProductSku[],
    config: ProductSkuSelectorConfig
  ) {
    this.config = config;
    // attributes가 없는 경우 에러 처리
    if (Object.keys(config.selectableAttributes).length === 0) {
      // SKU가 attributes를 가지는지 확인
      const hasAttributes = skus.some(
        (sku) => Object.keys(sku.attributes).length > 0
      );
      
      if (hasAttributes) {
        throw new Error(
          'SKU에 attributes가 존재하지만 selectableAttributes가 비어있습니다'
        );
      }
    }

    // SKU 검증: selectableAttributes의 모든 키가 SKU의 attributes에 존재하는지 확인
    this.validateSkuAttributes(skus, config.selectableAttributes);

    this.selectableAttributes = this.normalizeSelectableAttributes(
      config.selectableAttributes
    );
    
    // selectableAttributes의 key를 돌면서 selectedAttributes를 null로 초기화
    Object.keys(this.selectableAttributes).forEach((key) => {
      this.selectedAttributes[key] = null;
    });
    
    // 초기화 후 자동 선택 가능한 속성들 선택
    this.autoSelectIfSingleOption();
  }

  /**
   * SKU 검증: selectableAttributes의 모든 키가 각 SKU의 attributes에 존재하는지 확인
   */
  private validateSkuAttributes(
    skus: ProductSku[],
    selectableAttributes: Record<string, string[]>
  ): void {
    const selectableKeys = Object.keys(selectableAttributes);
    
    skus.forEach((sku, index) => {
      const skuAttributeKeys = Object.keys(sku.attributes);
      
      // selectableAttributes에는 있는데 SKU attributes에 없는 키 찾기
      const missingKeys = selectableKeys.filter(
        (key) => !skuAttributeKeys.includes(key)
      );
      
      if (missingKeys.length > 0) {
        throw new Error(
          `SKU[${index}] (id: ${sku.id})에 필수 속성이 없습니다: ${missingKeys.join(', ')}`
        );
      }
    });
  }

  /**
   * selectableAttributes를 정규화
   * value의 length가 0인 경우 모든 SKU의 해당 attribute 값들을 자동으로 추가
   */
  private normalizeSelectableAttributes(
    selectableAttributes: Record<string, string[]>
  ): Record<string, string[]> {
    const normalized: Record<string, string[]> = {};

    Object.keys(selectableAttributes).forEach((key) => {
      const values = selectableAttributes[key];
      
      // length가 0인 경우, 모든 SKU에서 해당 attribute의 값을 추출
      if (values.length === 0) {
        const allValues = new Set<string>();
        this.skus.forEach((sku) => {
          const value = sku.attributes[key];
          if (value) {
            allValues.add(value);
          }
        });
        normalized[key] = Array.from(allValues);
      } else {
        normalized[key] = values;
      }
    });

    return normalized;
  }

  /**
   * 속성(attribute) 선택
   * @param attributeKey - 선택할 속성의 키 (예: 'color', 'size')
   * @param attributeValue - 선택할 속성의 값 (예: 'red', 'XL')
   */
  selectAttribute(attributeKey: string, attributeValue: string): void {
    // 유효한 attribute인지 체크
    if (!this.selectableAttributes[attributeKey]) {
      throw new Error(`유효하지 않은 속성 키입니다: ${attributeKey}`);
    }

    if (!this.selectableAttributes[attributeKey].includes(attributeValue)) {
      throw new Error(
        `유효하지 않은 속성 값입니다: ${attributeValue} (키: ${attributeKey})`
      );
    }

    // 선택된 속성 저장
    this.selectedAttributes[attributeKey] = attributeValue;

    // 모든 속성이 선택되었는지 체크
    this.checkAndFilterSku();
  }

  /**
   * 모든 속성이 선택되었는지 체크하고, 선택된 경우 해당하는 SKU를 필터링
   */
  private checkAndFilterSku(): void {
    const attributeKeys = Object.keys(this.selectableAttributes);

    // 모든 속성이 선택되었는지 확인 (null이 아닌지 체크)
    const allSelected = attributeKeys.every(
      (key) => this.selectedAttributes[key] !== null
    );

    if (!allSelected) {
      this.selectedSku = null;
      return;
    }

    // 선택된 속성과 일치하는 SKU 찾기
    const matchedSku = this.skus.find((sku) => {
      return attributeKeys.every(
        (key) => sku.attributes[key] === this.selectedAttributes[key]
      );
    });

    this.selectedSku = matchedSku || null;
  }

  /**
   * 선택된 SKU 반환
   */
  getSelectedSku(): ProductSku | null {
    return this.selectedSku;
  }

  /**
   * 선택 초기화
   */
  reset(): void {
    Object.keys(this.selectableAttributes).forEach((key) => {
      this.selectedAttributes[key] = null;
    });
    this.selectedSku = null;
    this.autoSelectIfSingleOption();
  }

  /**
   * 각 속성에 대해 선택 가능한 값이 하나뿐인 경우 자동으로 선택
   */
  private autoSelectIfSingleOption(): void {
    Object.keys(this.selectableAttributes).forEach((key) => {
      const selectableValues = this.getSelectableValues(key);
      
      // 선택 가능한 값이 정확히 1개인 경우에만 자동 선택
      if (selectableValues.length === 1) {
        this.selectedAttributes[key] = selectableValues[0].value;
      }
    });

    // 자동 선택 후 SKU 체크
    this.checkAndFilterSku();
  }

  /**
   * 특정 속성에 대해 선택 가능한 값들을 반환
   * 현재 선택된 다른 속성들을 고려하여 실제 SKU에 존재하는 값들만 반환
   * @param attributeKey - 조회할 속성의 키 (예: 'size')
   * @returns 선택 가능한 값들의 배열 (id, value, quantity 포함)
   */
  getSelectableValues(
    attributeKey: string
  ): { value: string; id: number; quantity: number }[] {
    // 유효한 attribute인지 체크
    if (!this.selectableAttributes[attributeKey]) {
      throw new Error(`유효하지 않은 속성 키입니다: ${attributeKey}`);
    }

    // 현재 선택된 다른 속성들로 필터링
    const filteredSkus = this.skus.filter((sku) => {
      return Object.keys(this.selectedAttributes).every((key) => {
        // 조회하려는 속성이거나 아직 선택되지 않은 속성은 스킵
        if (key === attributeKey || this.selectedAttributes[key] === null) {
          return true;
        }
        // 선택된 다른 속성들과 일치하는지 확인
        return sku.attributes[key] === this.selectedAttributes[key];
      });
    });

    // 선택 가능한 값들을 추출 (중복 제거)
    const selectableValuesMap = new Map<
      string,
      { value: string; id: number; quantity: number }
    >();

    filteredSkus.forEach((sku) => {
      const value = sku.attributes[attributeKey];
      if (value && this.selectableAttributes[attributeKey].includes(value)) {
        if (!selectableValuesMap.has(value)) {
          selectableValuesMap.set(value, {
            value,
            id: sku.id,
            quantity: sku.quantity,
          });
        }
      }
    });

    return Array.from(selectableValuesMap.values());
  }

  /**
   * 현재 상태를 JSON으로 직렬화
   */
  toJSON(): ProductSkuSelectorState {
    return {
      selectedAttributes: { ...this.selectedAttributes },
      config: this.config,
    };
  }

  /**
   * JSON 데이터로부터 ProductSkuSelector 인스턴스 생성
   */
  static fromJSON(skus: ProductSku[], state: ProductSkuSelectorState): ProductSkuSelector {
    const selector = new ProductSkuSelector(skus, state.config);
    
    // 저장된 선택 상태 복원
    Object.keys(state.selectedAttributes).forEach((key) => {
      const value = state.selectedAttributes[key];
      if (value !== null) {
        selector.selectAttribute(key, value);
      }
    });
    
    return selector;
  }
}

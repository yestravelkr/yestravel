/**
 * SkuSelector - 실제 선택된 SKU를 나타내는 클래스
 *
 * 선택 가능한 SKU들과 선택 가능한 속성(attributes) 정보를 담고 있습니다.
 */

import type { Sku, SkuSelectorConfig } from './types';

export class SkuSelector {
  private selectedAttributes: Record<string, string | null> = {};
  private selectedSku: Sku | null = null;
  private readonly selectableAttributes: Record<string, string[]>;

  constructor(
    private readonly skus: Sku[],
    config: SkuSelectorConfig
  ) {
    this.selectableAttributes = config.selectableAttributes;
    
    // selectableAttributes의 key를 돌면서 selectedAttributes를 null로 초기화
    Object.keys(this.selectableAttributes).forEach((key) => {
      this.selectedAttributes[key] = null;
    });
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
  getSelectedSku(): Sku | null {
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
}

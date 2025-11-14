/**
 * SKU (Stock Keeping Unit) 관련 타입 정의
 */

export interface Sku {
  id: number;
  quantity: number;
  attributes: Record<string, string>;
}

/**
 * SkuSelector 설정을 위한 JSON 형식 인터페이스
 */
export interface SkuSelectorConfig {
  selectableAttributes: Record<string, string[]>;
}

/**
 * OptionSelector 설정을 위한 JSON 형식 인터페이스
 */
export interface OptionSelectorConfig {
  skus: Sku[];
  skuSelectors: SkuSelectorConfig[];
}

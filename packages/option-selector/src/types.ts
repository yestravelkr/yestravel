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

/**
 * SkuSelector의 현재 상태를 나타내는 인터페이스
 */
export interface SkuSelectorState {
  selectedAttributes: Record<string, string | null>;
  config: SkuSelectorConfig;
}

/**
 * OptionSelector의 현재 상태를 나타내는 인터페이스
 */
export interface OptionSelectorState {
  config: OptionSelectorConfig;
  skuSelectorStates: SkuSelectorState[];
}

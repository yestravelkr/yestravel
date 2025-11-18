/**
 * Product SKU (Stock Keeping Unit) 관련 타입 정의
 */

export interface ProductSku {
  id: number;
  quantity: number;
  attributes: Record<string, string>;
}

/**
 * ProductSkuSelector 설정을 위한 JSON 형식 인터페이스
 */
export interface ProductSkuSelectorConfig {
  selectableAttributes: Record<string, string[]>;
  quantity: number; // 해당 SKU를 선택하면 한번에 추가되는 수량
}

export interface ProductOptionConfig {
  skuSelectors: ProductSkuSelectorConfig[];
}

/**
 * ProductOptionSelector 설정을 위한 JSON 형식 인터페이스
 */
export interface ProductOptionSelectorConfig extends ProductOptionConfig {
  skus: ProductSku[];
}

/**
 * ProductSkuSelector의 현재 상태를 나타내는 인터페이스
 */
export interface ProductSkuSelectorState {
  selectedAttributes: Record<string, string | null>;
  config: ProductSkuSelectorConfig;
}

/**
 * ProductOptionSelector의 현재 상태를 나타내는 인터페이스
 */
export interface ProductOptionSelectorState {
  config: ProductOptionSelectorConfig;
  skuSelectorStates: ProductSkuSelectorState[];
}

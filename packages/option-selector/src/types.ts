/**
 * SKU (Stock Keeping Unit) 관련 타입 정의
 */

export interface Sku {
  id: number;
  quantity: number;
  attributes: Record<string, string>;
}

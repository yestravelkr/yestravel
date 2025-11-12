/**
 * OptionSelector - 상품 옵션 선택 로직을 담당하는 클래스
 *
 * SKU 그룹 기반으로 옵션을 선택하고, 선택 가능 여부를 검증합니다.
 */

import type { Sku } from './types';

export class OptionSelector {
  private skus: Sku[] = [];
}

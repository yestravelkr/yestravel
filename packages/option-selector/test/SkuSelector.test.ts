import { describe, it, expect, beforeEach } from 'vitest';
import { SkuSelector } from '../src/SkuSelector';
import type { Sku } from '../src/types';

describe('SkuSelector', () => {
  let skus: Sku[];
  let selectableAttributes: Record<string, string[]>;
  let skuSelector: SkuSelector;

  beforeEach(() => {
    // 테스트용 SKU 데이터 설정
    skus = [
      {
        id: 1,
        quantity: 10,
        attributes: { color: 'red', size: 'S' },
      },
      {
        id: 2,
        quantity: 5,
        attributes: { color: 'red', size: 'M' },
      },
      {
        id: 3,
        quantity: 0,
        attributes: { color: 'red', size: 'L' },
      },
      {
        id: 4,
        quantity: 8,
        attributes: { color: 'blue', size: 'S' },
      },
      {
        id: 5,
        quantity: 3,
        attributes: { color: 'blue', size: 'M' },
      },
      {
        id: 6,
        quantity: 12,
        attributes: { color: 'blue', size: 'L' },
      },
      {
        id: 7,
        quantity: 7,
        attributes: { color: 'yellow', size: 'XL' },
      },
    ];

    selectableAttributes = {
      color: ['red', 'blue', 'yellow'],
      size: ['S', 'M', 'L', 'XL'],
    };

    skuSelector = new SkuSelector(skus, { selectableAttributes });
  });

  describe('초기화', () => {
    it('생성 시 모든 selectedAttributes가 null로 초기화되어야 함', () => {
      expect(skuSelector.getSelectedSku()).toBeNull();
    });
  });

  describe('selectAttribute', () => {
    it('유효한 속성을 선택할 수 있어야 함', () => {
      expect(() => {
        skuSelector.selectAttribute('color', 'red');
      }).not.toThrow();
    });

    it('유효하지 않은 속성 키를 선택하면 에러가 발생해야 함', () => {
      expect(() => {
        skuSelector.selectAttribute('invalid', 'value');
      }).toThrow('유효하지 않은 속성 키입니다');
    });

    it('유효하지 않은 속성 값을 선택하면 에러가 발생해야 함', () => {
      expect(() => {
        skuSelector.selectAttribute('color', 'green');
      }).toThrow('유효하지 않은 속성 값입니다');
    });

    it('모든 속성이 선택되면 해당 SKU가 선택되어야 함', () => {
      skuSelector.selectAttribute('color', 'red');
      skuSelector.selectAttribute('size', 'M');

      const selectedSku = skuSelector.getSelectedSku();
      expect(selectedSku).not.toBeNull();
      expect(selectedSku?.id).toBe(2);
      expect(selectedSku?.quantity).toBe(5);
    });

    it('일부 속성만 선택되면 SKU가 선택되지 않아야 함', () => {
      skuSelector.selectAttribute('color', 'blue');

      const selectedSku = skuSelector.getSelectedSku();
      expect(selectedSku).toBeNull();
    });
  });

  describe('getSelectableValues', () => {
    it('아무것도 선택되지 않은 상태에서 모든 선택 가능한 값을 반환해야 함', () => {
      const selectableColors = skuSelector.getSelectableValues('color');

      expect(selectableColors).toHaveLength(3);
      expect(selectableColors.map((v) => v.value)).toContain('red');
      expect(selectableColors.map((v) => v.value)).toContain('blue');
      expect(selectableColors.map((v) => v.value)).toContain('yellow');
    });

    it('color가 선택된 후 해당 color의 size들만 반환해야 함', () => {
      skuSelector.selectAttribute('color', 'red');

      const selectableSizes = skuSelector.getSelectableValues('size');

      expect(selectableSizes).toHaveLength(3);
      expect(selectableSizes.map((v) => v.value)).toContain('S');
      expect(selectableSizes.map((v) => v.value)).toContain('M');
      expect(selectableSizes.map((v) => v.value)).toContain('L');

      // red-S의 정보가 올바르게 반환되는지 확인
      const sizeS = selectableSizes.find((v) => v.value === 'S');
      expect(sizeS?.id).toBe(1);
      expect(sizeS?.quantity).toBe(10);
    });

    it('size가 선택된 후 해당 size의 color들만 반환해야 함', () => {
      skuSelector.selectAttribute('size', 'L');

      const selectableColors = skuSelector.getSelectableValues('color');

      expect(selectableColors).toHaveLength(2);
      expect(selectableColors.map((v) => v.value)).toContain('red');
      expect(selectableColors.map((v) => v.value)).toContain('blue');

      // blue-L의 정보가 올바르게 반환되는지 확인
      const colorBlue = selectableColors.find((v) => v.value === 'blue');
      expect(colorBlue?.id).toBe(6);
      expect(colorBlue?.quantity).toBe(12);
    });

    it('유효하지 않은 속성 키를 조회하면 에러가 발생해야 함', () => {
      expect(() => {
        skuSelector.getSelectableValues('invalid');
      }).toThrow('유효하지 않은 속성 키입니다');
    });
  });

  describe('reset', () => {
    it('reset 호출 시 모든 선택이 초기화되어야 함', () => {
      skuSelector.selectAttribute('color', 'red');
      skuSelector.selectAttribute('size', 'M');

      expect(skuSelector.getSelectedSku()).not.toBeNull();

      skuSelector.reset();

      expect(skuSelector.getSelectedSku()).toBeNull();
    });
  });

  describe('복잡한 시나리오', () => {
    it('여러 번 속성을 변경해도 올바르게 동작해야 함', () => {
      // 첫 번째 선택
      skuSelector.selectAttribute('color', 'red');
      skuSelector.selectAttribute('size', 'S');
      expect(skuSelector.getSelectedSku()?.id).toBe(1);

      // 색상 변경
      skuSelector.selectAttribute('color', 'blue');
      expect(skuSelector.getSelectedSku()?.id).toBe(4); // blue-S

      // 사이즈 변경
      skuSelector.selectAttribute('size', 'L');
      expect(skuSelector.getSelectedSku()?.id).toBe(6); // blue-L
    });
  });

  describe('재고가 0인 SKU', () => {
    it('재고가 0인 SKU도 getSelectableValues에 포함되어야 함', () => {
      skuSelector.selectAttribute('color', 'red');

      const selectableSizes = skuSelector.getSelectableValues('size');
      const sizeL = selectableSizes.find((v) => v.value === 'L');

      expect(sizeL).toBeDefined();
      expect(sizeL?.quantity).toBe(0);
    });

    it('재고가 0인 SKU도 선택 가능해야 함', () => {
      skuSelector.selectAttribute('color', 'red');
      skuSelector.selectAttribute('size', 'L');

      const selectedSku = skuSelector.getSelectedSku();
      expect(selectedSku).not.toBeNull();
      expect(selectedSku?.id).toBe(3);
      expect(selectedSku?.quantity).toBe(0);
    });
  });
});

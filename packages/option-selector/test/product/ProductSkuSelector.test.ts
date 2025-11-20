import { describe, it, expect } from 'vitest';
import { ProductSkuSelector } from '../../src/product/ProductSkuSelector';
import type { ProductSku } from '../../src/product/types';

describe('ProductSkuSelector', () => {
  // 공통 테스트용 SKU 데이터
  const skus: ProductSku[] = [
    { id: 1, quantity: 10, attributes: { color: 'red', size: 'S' } },
    { id: 2, quantity: 5, attributes: { color: 'red', size: 'M' } },
    { id: 3, quantity: 0, attributes: { color: 'red', size: 'L' } },
    { id: 4, quantity: 8, attributes: { color: 'blue', size: 'S' } },
    { id: 5, quantity: 3, attributes: { color: 'blue', size: 'M' } },
    { id: 6, quantity: 12, attributes: { color: 'blue', size: 'L' } },
    { id: 7, quantity: 7, attributes: { color: 'yellow', size: 'XL' } },
  ];

  describe('초기화', () => {
    it('생성 시 모든 selectedAttributes가 null로 초기화되어야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      expect(skuSelector.getSelectedSku()).toBeNull();
    });
  });

  describe('selectAttribute', () => {
    it('유효한 속성을 선택할 수 있어야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      expect(() => {
        skuSelector.selectAttribute('color', 'red');
      }).not.toThrow();
    });

    it('유효하지 않은 속성 키를 선택하면 에러가 발생해야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      expect(() => {
        skuSelector.selectAttribute('invalid', 'value');
      }).toThrow('유효하지 않은 속성 키입니다');
    });

    it('유효하지 않은 속성 값을 선택하면 에러가 발생해야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      expect(() => {
        skuSelector.selectAttribute('color', 'green');
      }).toThrow('유효하지 않은 속성 값입니다');
    });

    it('모든 속성이 선택되면 해당 SKU가 선택되어야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      skuSelector.selectAttribute('color', 'red');
      skuSelector.selectAttribute('size', 'M');

      const selectedProductSku = skuSelector.getSelectedSku();
      expect(selectedProductSku).not.toBeNull();
      expect(selectedProductSku?.id).toBe(2);
      expect(selectedProductSku?.quantity).toBe(5);
    });

    it('일부 속성만 선택되면 SKU가 선택되지 않아야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      skuSelector.selectAttribute('color', 'blue');

      const selectedProductSku = skuSelector.getSelectedSku();
      expect(selectedProductSku).toBeNull();
    });
  });

  describe('getSelectableValues', () => {
    it('아무것도 선택되지 않은 상태에서 모든 선택 가능한 값을 반환해야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      const selectableColors = skuSelector.getSelectableValues('color');

      expect(selectableColors).toHaveLength(3);
      expect(selectableColors.map((v) => v.value)).toContain('red');
      expect(selectableColors.map((v) => v.value)).toContain('blue');
      expect(selectableColors.map((v) => v.value)).toContain('yellow');
    });

    it('color가 선택된 후 해당 color의 size들만 반환해야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      skuSelector.selectAttribute('color', 'red');

      const selectableSizes = skuSelector.getSelectableValues('size');

      expect(selectableSizes).toHaveLength(3);
      expect(selectableSizes.map((v) => v.value)).toContain('S');
      expect(selectableSizes.map((v) => v.value)).toContain('M');
      expect(selectableSizes.map((v) => v.value)).toContain('L');

      const sizeS = selectableSizes.find((v) => v.value === 'S');
      expect(sizeS?.id).toBe(1);
      expect(sizeS?.quantity).toBe(10);
    });

    it('size가 선택된 후 해당 size의 color들만 반환해야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      skuSelector.selectAttribute('size', 'L');

      const selectableColors = skuSelector.getSelectableValues('color');

      expect(selectableColors).toHaveLength(2);
      expect(selectableColors.map((v) => v.value)).toContain('red');
      expect(selectableColors.map((v) => v.value)).toContain('blue');

      const colorBlue = selectableColors.find((v) => v.value === 'blue');
      expect(colorBlue?.id).toBe(6);
      expect(colorBlue?.quantity).toBe(12);
    });

    it('유효하지 않은 속성 키를 조회하면 에러가 발생해야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      expect(() => {
        skuSelector.getSelectableValues('invalid');
      }).toThrow('유효하지 않은 속성 키입니다');
    });
  });

  describe('reset', () => {
    it('reset 호출 시 모든 선택이 초기화되어야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      skuSelector.selectAttribute('color', 'red');
      skuSelector.selectAttribute('size', 'M');

      expect(skuSelector.getSelectedSku()).not.toBeNull();

      skuSelector.reset();

      expect(skuSelector.getSelectedSku()).toBeNull();
    });
  });

  describe('복잡한 시나리오', () => {
    it('여러 번 속성을 변경해도 올바르게 동작해야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      skuSelector.selectAttribute('color', 'red');
      skuSelector.selectAttribute('size', 'S');
      expect(skuSelector.getSelectedSku()?.id).toBe(1);

      skuSelector.selectAttribute('color', 'blue');
      expect(skuSelector.getSelectedSku()?.id).toBe(4);

      skuSelector.selectAttribute('size', 'L');
      expect(skuSelector.getSelectedSku()?.id).toBe(6);
    });
  });

  describe('재고가 0인 SKU', () => {
    it('재고가 0인 SKU도 getSelectableValues에 포함되어야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      skuSelector.selectAttribute('color', 'red');

      const selectableSizes = skuSelector.getSelectableValues('size');
      const sizeL = selectableSizes.find((v) => v.value === 'L');

      expect(sizeL).toBeDefined();
      expect(sizeL?.quantity).toBe(0);
    });

    it('재고가 0인 SKU도 선택 가능해야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue', 'yellow'],
        size: ['S', 'M', 'L', 'XL'],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      skuSelector.selectAttribute('color', 'red');
      skuSelector.selectAttribute('size', 'L');

      const selectedProductSku = skuSelector.getSelectedSku();
      expect(selectedProductSku).not.toBeNull();
      expect(selectedProductSku?.id).toBe(3);
      expect(selectedProductSku?.quantity).toBe(0);
    });
  });

  describe('selectableAttributes 정규화', () => {
    it('selectableAttributes의 value가 빈 배열인 경우 모든 SKU의 해당 attribute 값을 자동으로 추가해야 함', () => {
      const selectableAttributes = {
        color: [],
        size: [],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      const selectableColors = skuSelector.getSelectableValues('color');
      expect(selectableColors).toHaveLength(3);
      expect(selectableColors.map((v) => v.value).sort()).toEqual(['blue', 'red', 'yellow']);

      const selectableSizes = skuSelector.getSelectableValues('size');
      expect(selectableSizes).toHaveLength(4);
      expect(selectableSizes.map((v) => v.value).sort()).toEqual(['L', 'M', 'S', 'XL']);
    });

    it('일부만 빈 배열인 경우 해당 attribute만 자동으로 추가되어야 함', () => {
      const selectableAttributes = {
        color: ['red', 'blue'],
        size: [],
      };
      const skuSelector = new ProductSkuSelector(skus, { selectableAttributes, quantity: 1 });

      const selectableColors = skuSelector.getSelectableValues('color');
      expect(selectableColors).toHaveLength(2);
      expect(selectableColors.map((v) => v.value).sort()).toEqual(['blue', 'red']);

      const selectableSizes = skuSelector.getSelectableValues('size');
      expect(selectableSizes).toHaveLength(4);
      expect(selectableSizes.map((v) => v.value).sort()).toEqual(['L', 'M', 'S', 'XL']);
    });
  });

  describe('자동 선택', () => {
    it('선택 가능한 값이 하나뿐인 경우 자동으로 선택되어야 함', () => {
      const singleOptionProductSkus: ProductSku[] = [
        { id: 7, quantity: 7, attributes: { color: 'yellow', size: 'XL' } },
      ];
      const selectableAttributes = {
        color: ['yellow'],
        size: ['XL'],
      };
      const selector = new ProductSkuSelector(singleOptionProductSkus, { selectableAttributes, quantity: 1 });

      const selectedProductSku = selector.getSelectedSku();
      expect(selectedProductSku).not.toBeNull();
      expect(selectedProductSku?.id).toBe(7);
    });

    it('한 가지 속성만 값이 하나인 경우 해당 속성만 자동 선택되어야 함', () => {
      const partialSingleOptionProductSkus: ProductSku[] = [
        { id: 1, quantity: 10, attributes: { color: 'yellow', size: 'S' } },
        { id: 2, quantity: 5, attributes: { color: 'yellow', size: 'M' } },
      ];
      const selectableAttributes = {
        color: ['yellow'],
        size: ['S', 'M'],
      };
      const selector = new ProductSkuSelector(partialSingleOptionProductSkus, { selectableAttributes, quantity: 1 });

      const selectedProductSku = selector.getSelectedSku();
      expect(selectedProductSku).toBeNull();

      selector.selectAttribute('size', 'S');
      expect(selector.getSelectedSku()?.id).toBe(1);
    });
  });

  describe('SKU 검증', () => {
    it('selectableAttributes의 키가 SKU attributes에 없으면 에러를 발생시켜야 함', () => {
      const testProductSkus: ProductSku[] = [
        { id: 1, quantity: 10, attributes: { color: 'blue', size: 'L' } },
      ];
      
      const selectableAttributes = {
        color: [],
        size: [],
        sleeve: [], // SKU에는 없는 속성
      };

      expect(() => {
        new ProductSkuSelector(testProductSkus, { selectableAttributes, quantity: 1 });
      }).toThrow('SKU[0] (id: 1)에 필수 속성이 없습니다: sleeve');
    });

    it('SKU attributes에 color와 size만 있고 selectableAttributes에 color만 있으면 정상 동작해야 함', () => {
      const testProductSkus: ProductSku[] = [
        { id: 1, quantity: 10, attributes: { color: 'blue', size: 'L' } },
      ];
      
      const selectableAttributes = {
        color: [],
      };

      expect(() => {
        new ProductSkuSelector(testProductSkus, { selectableAttributes, quantity: 1 });
      }).not.toThrow();
    });

    it('SKU에 attributes가 있는데 selectableAttributes가 비어있으면 에러를 발생시켜야 함', () => {
      const testProductSkus: ProductSku[] = [
        { id: 1, quantity: 10, attributes: { color: 'blue', size: 'L' } },
      ];
      
      const selectableAttributes = {};

      expect(() => {
        new ProductSkuSelector(testProductSkus, { selectableAttributes, quantity: 1 });
      }).toThrow('SKU에 attributes가 존재하지만 selectableAttributes가 비어있습니다');
    });
  });
});

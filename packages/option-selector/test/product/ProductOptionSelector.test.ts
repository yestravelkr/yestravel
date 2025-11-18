import { describe, it, expect, beforeEach } from 'vitest';
import { ProductOptionSelector } from '../../src/product/ProductOptionSelector';
import type { ProductOptionSelectorConfig, ProductSku } from '../../src/product/types';

describe('ProductOptionSelector', () => {
  let skus: ProductSku[];
  let config: ProductOptionSelectorConfig;
  let optionSelector: ProductOptionSelector;

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
        quantity: 8,
        attributes: { color: 'blue', size: 'S' },
      },
      {
        id: 4,
        quantity: 12,
        attributes: { color: 'blue', size: 'L' },
      },
      {
        id: 5,
        quantity: 7,
        attributes: { color: 'yellow', size: 'XL' },
      },
    ];

    // 예시: 티셔츠 상품 - 색상/사이즈 선택 2개
    config = {
      skus,
      skuSelectors: [
        {
          selectableAttributes: {
            color: ['red', 'blue'],
            size: ['S', 'M', 'L'],
          },
          quantity: 1,
        },
        {
          selectableAttributes: {
            color: ['red', 'blue', 'yellow'],
            size: ['S', 'M', 'L', 'XL'],
          },
          quantity: 1,
        },
      ],
    };

    optionSelector = new ProductOptionSelector(config);
  });

  describe('초기화', () => {
    it('설정된 개수만큼 ProductSkuSelector가 생성되어야 함', () => {
      const selectors = optionSelector.getAllSkuSelectors();
      expect(selectors).toHaveLength(2);
    });

    it('초기 상태에서 모든 선택이 완료되지 않아야 함', () => {
      expect(optionSelector.isAllSelected()).toBe(false);
    });
  });

  describe('getSkuSelector', () => {
    it('특정 인덱스의 ProductSkuSelector를 가져올 수 있어야 함', () => {
      const selector = optionSelector.getSkuSelector(0);
      expect(selector).toBeDefined();
    });

    it('유효하지 않은 인덱스는 undefined를 반환해야 함', () => {
      const selector = optionSelector.getSkuSelector(999);
      expect(selector).toBeUndefined();
    });
  });

  describe('getAllSelectedSkus', () => {
    it('선택되지 않은 경우 null 배열을 반환해야 함', () => {
      const selected = optionSelector.getAllSelectedSkus();
      expect(selected).toEqual([null, null]);
    });

    it('일부만 선택된 경우 해당 인덱스만 SKU를 반환해야 함', () => {
      const selector1 = optionSelector.getSkuSelector(0);
      selector1?.selectAttribute('color', 'red');
      selector1?.selectAttribute('size', 'M');

      const selected = optionSelector.getAllSelectedSkus();
      expect(selected[0]).not.toBeNull();
      expect(selected[0]?.id).toBe(2);
      expect(selected[1]).toBeNull();
    });

    it('모두 선택된 경우 모든 SKU를 반환해야 함', () => {
      const selector1 = optionSelector.getSkuSelector(0);
      selector1?.selectAttribute('color', 'red');
      selector1?.selectAttribute('size', 'M');

      const selector2 = optionSelector.getSkuSelector(1);
      selector2?.selectAttribute('color', 'yellow');
      selector2?.selectAttribute('size', 'XL');

      const selected = optionSelector.getAllSelectedSkus();
      expect(selected[0]?.id).toBe(2);
      expect(selected[1]?.id).toBe(5);
    });
  });

  describe('isAllSelected', () => {
    it('모든 ProductSkuSelector가 선택되면 true를 반환해야 함', () => {
      const selector1 = optionSelector.getSkuSelector(0);
      selector1?.selectAttribute('color', 'red');
      selector1?.selectAttribute('size', 'M');

      const selector2 = optionSelector.getSkuSelector(1);
      selector2?.selectAttribute('color', 'yellow');
      selector2?.selectAttribute('size', 'XL');

      expect(optionSelector.isAllSelected()).toBe(true);
    });

    it('일부만 선택되면 false를 반환해야 함', () => {
      const selector1 = optionSelector.getSkuSelector(0);
      selector1?.selectAttribute('color', 'red');

      expect(optionSelector.isAllSelected()).toBe(false);
    });
  });

  describe('reset', () => {
    it('모든 ProductSkuSelector의 선택을 초기화해야 함', () => {
      const selector1 = optionSelector.getSkuSelector(0);
      selector1?.selectAttribute('color', 'red');
      selector1?.selectAttribute('size', 'M');

      const selector2 = optionSelector.getSkuSelector(1);
      selector2?.selectAttribute('color', 'yellow');
      selector2?.selectAttribute('size', 'XL');

      expect(optionSelector.isAllSelected()).toBe(true);

      optionSelector.reset();

      expect(optionSelector.isAllSelected()).toBe(false);
      expect(optionSelector.getAllSelectedSkus()).toEqual([null, null]);
    });
  });

  describe('복잡한 시나리오 - 아이스크림 3개 골라담기', () => {
    it('여러 ProductSkuSelector가 동일한 SKU 풀을 공유해야 함', () => {
      // 아이스크림 맛 SKU
      const iceCreamProductSkus: ProductSku[] = [
        { id: 101, quantity: 10, attributes: { flavor: 'vanilla' } },
        { id: 102, quantity: 5, attributes: { flavor: 'chocolate' } },
        { id: 103, quantity: 8, attributes: { flavor: 'strawberry' } },
      ];

      const iceCreamConfig: ProductOptionSelectorConfig = {
        skus: iceCreamProductSkus,
        skuSelectors: [
          { selectableAttributes: { flavor: ['vanilla', 'chocolate', 'strawberry'] }, quantity: 1 },
          { selectableAttributes: { flavor: ['vanilla', 'chocolate', 'strawberry'] }, quantity: 1 },
          { selectableAttributes: { flavor: ['vanilla', 'chocolate', 'strawberry'] }, quantity: 1 },
        ],
      };

      const iceCreamSelector = new ProductOptionSelector(iceCreamConfig);

      // 3개 선택
      iceCreamSelector.getSkuSelector(0)?.selectAttribute('flavor', 'vanilla');
      iceCreamSelector.getSkuSelector(1)?.selectAttribute('flavor', 'vanilla');
      iceCreamSelector.getSkuSelector(2)?.selectAttribute('flavor', 'chocolate');

      const selected = iceCreamSelector.getAllSelectedSkus();
      expect(selected).toHaveLength(3);
      expect(selected[0]?.id).toBe(101);
      expect(selected[1]?.id).toBe(101);
      expect(selected[2]?.id).toBe(102);
      expect(iceCreamSelector.isAllSelected()).toBe(true);
    });
  });

  describe('복잡한 시나리오 - 빵 + 소스 선택', () => {
    it('고정 SKU와 선택 SKU를 함께 처리해야 함', () => {
      const bundleProductSkus: ProductSku[] = [
        { id: 201, quantity: 10, attributes: { type: 'bread', name: 'baguette' } },
        { id: 301, quantity: 5, attributes: { type: 'sauce', name: 'mayo' } },
        { id: 302, quantity: 8, attributes: { type: 'sauce', name: 'ketchup' } },
        { id: 303, quantity: 3, attributes: { type: 'sauce', name: 'mustard' } },
      ];

      const bundleConfig: ProductOptionSelectorConfig = {
        skus: bundleProductSkus,
        skuSelectors: [
          // 빵 - 고정 선택
          { selectableAttributes: { type: ['bread'], name: ['baguette'] }, quantity: 1 },
          // 소스 - 3개 중 1개 선택
          { selectableAttributes: { type: ['sauce'], name: ['mayo', 'ketchup', 'mustard'] }, quantity: 1 },
        ],
      };

      const bundleSelector = new ProductOptionSelector(bundleConfig);

      // 빵 선택 (고정)
      bundleSelector.getSkuSelector(0)?.selectAttribute('type', 'bread');
      bundleSelector.getSkuSelector(0)?.selectAttribute('name', 'baguette');

      // 소스 선택
      bundleSelector.getSkuSelector(1)?.selectAttribute('type', 'sauce');
      bundleSelector.getSkuSelector(1)?.selectAttribute('name', 'ketchup');

      const selected = bundleSelector.getAllSelectedSkus();
      expect(selected).toHaveLength(2);
      expect(selected[0]?.id).toBe(201); // 빵
      expect(selected[1]?.id).toBe(302); // 케첩
      expect(bundleSelector.isAllSelected()).toBe(true);
    });
  });
});

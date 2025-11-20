import { describe, it, expect } from 'vitest';
import { HotelOptionSelector } from '../src/hotel/HotelOptionSelector';
import type { HotelOptionSelectorConfig } from '../src/hotel/types';

describe('HotelOptionSelector', () => {
  describe('기본 설정 및 검증', () => {
    it('유효한 설정으로 생성되어야 함', () => {
      const config: HotelOptionSelectorConfig = {
        skus: [
          { id: 1, quantity: 5, date: '2025-01-15 23:59:59' },
          { id: 2, quantity: 3, date: '2025-01-16' },
        ],
        hotelOptions: [
          {
            id: 1,
            name: '조식 포함',
            priceByDate: {
              '2025-01-15': 100000,
              '2025-01-16': 150000,
            },
          },
        ],
      };

      expect(() => new HotelOptionSelector(config)).not.toThrow();
    });

    it('중복된 날짜가 있으면 에러를 발생시켜야 함', () => {
      const config: HotelOptionSelectorConfig = {
        skus: [
          { id: 1, quantity: 5, date: '2025-01-15' },
          { id: 2, quantity: 3, date: '2025-01-15' },
        ],
        hotelOptions: [],
      };

      expect(() => new HotelOptionSelector(config)).toThrow(
        'SKU에 중복된 날짜가 있습니다'
      );
    });

    it('잘못된 날짜 형식이면 에러를 발생시켜야 함', () => {
      const config: HotelOptionSelectorConfig = {
        skus: [{ id: 1, quantity: 5, date: 'invalid-date' }],
        hotelOptions: [],
      };

      expect(() => new HotelOptionSelector(config)).toThrow(
        '잘못된 날짜 형식입니다'
      );
    });
  });

  describe('날짜 선택', () => {
    const config: HotelOptionSelectorConfig = {
      skus: [
        { id: 1, quantity: 5, date: '2025-01-15' },
        { id: 2, quantity: 3, date: '2025-01-16' },
        { id: 3, quantity: 4, date: '2025-01-17' },
      ],
      hotelOptions: [],
    };

    it('유효한 날짜 범위를 설정할 수 있어야 함', () => {
      const selector = new HotelOptionSelector(config);
      expect(() =>
        selector.setDateRange('2025-01-15', '2025-01-17')
      ).not.toThrow();
    });

    it('체크인 날짜가 체크아웃 날짜보다 이후면 에러를 발생시켜야 함', () => {
      const selector = new HotelOptionSelector(config);
      expect(() => selector.setDateRange('2025-01-17', '2025-01-15')).toThrow(
        '체크아웃 날짜는 체크인 날짜보다 이후여야 합니다'
      );
    });

    it('체크인과 체크아웃이 같은 날이면 에러를 발생시켜야 함', () => {
      const selector = new HotelOptionSelector(config);
      expect(() => selector.setDateRange('2025-01-15', '2025-01-15')).toThrow(
        '체크아웃 날짜는 체크인 날짜보다 이후여야 합니다'
      );
    });

    it('잘못된 날짜 형식이면 에러를 발생시켜야 함', () => {
      const selector = new HotelOptionSelector(config);
      expect(() => selector.setDateRange('invalid-date', '2025-01-17')).toThrow(
        '잘못된 체크인 날짜 형식입니다'
      );
    });
  });

  describe('숙박 일수 계산', () => {
    const config: HotelOptionSelectorConfig = {
      skus: [
        { id: 1, quantity: 5, date: '2025-01-15' },
        { id: 2, quantity: 3, date: '2025-01-16' },
        { id: 3, quantity: 4, date: '2025-01-17' },
      ],
      hotelOptions: [],
    };

    it('1박 2일을 올바르게 계산해야 함', () => {
      const selector = new HotelOptionSelector(config);
      selector.setDateRange('2025-01-15', '2025-01-16');
      expect(selector.getStayNights()).toBe(1);
    });

    it('2박 3일을 올바르게 계산해야 함', () => {
      const selector = new HotelOptionSelector(config);
      selector.setDateRange('2025-01-15', '2025-01-17');
      expect(selector.getStayNights()).toBe(2);
    });

    it('날짜가 설정되지 않으면 0을 반환해야 함', () => {
      const selector = new HotelOptionSelector(config);
      expect(selector.getStayNights()).toBe(0);
    });
  });

  describe('재고 확인', () => {
    const config: HotelOptionSelectorConfig = {
      skus: [
        { id: 1, quantity: 5, date: '2025-01-15' },
        { id: 2, quantity: 0, date: '2025-01-16' },
        { id: 3, quantity: 4, date: '2025-01-17' },
      ],
      hotelOptions: [],
    };

    it('재고가 충분하면 true를 반환해야 함', () => {
      const selector = new HotelOptionSelector(config);
      selector.setDateRange('2025-01-15', '2025-01-16');
      expect(selector.validateAvailability()).toBe(true);
    });

    it('기간 내 재고가 부족하면 false를 반환해야 함', () => {
      const selector = new HotelOptionSelector(config);
      selector.setDateRange('2025-01-15', '2025-01-17');
      expect(selector.validateAvailability()).toBe(false);
    });

    it('날짜가 설정되지 않으면 false를 반환해야 함', () => {
      const selector = new HotelOptionSelector(config);
      expect(selector.validateAvailability()).toBe(false);
    });
  });

  describe('호텔 옵션 선택 및 요금 계산', () => {
    const config: HotelOptionSelectorConfig = {
      skus: [
        { id: 1, quantity: 5, date: '2025-01-15' },
        { id: 2, quantity: 3, date: '2025-01-16' },
        { id: 3, quantity: 4, date: '2025-01-17' },
      ],
      hotelOptions: [
        {
          id: 1,
          name: '조식 포함',
          priceByDate: {
            '2025-01-15': 100000,
            '2025-01-16': 150000,
            '2025-01-17': 100000,
          },
        },
        {
          id: 2,
          name: '레이트 체크아웃',
          priceByDate: {
            '2025-01-15': 130000,
            '2025-01-16': 200000,
            '2025-01-17': 130000,
          },
        },
      ],
    };

    it('호텔 옵션을 선택할 수 있어야 함', () => {
      const selector = new HotelOptionSelector(config);
      expect(() => selector.selectHotelOption(1)).not.toThrow();
      expect(selector.getSelectedHotelOptionId()).toBe(1);
    });

    it('존재하지 않는 옵션을 선택하면 에러를 발생시켜야 함', () => {
      const selector = new HotelOptionSelector(config);
      expect(() => selector.selectHotelOption(999)).toThrow(
        '존재하지 않는 옵션입니다'
      );
    });

    it('옵션을 선택 해제할 수 있어야 함', () => {
      const selector = new HotelOptionSelector(config);
      selector.selectHotelOption(1);
      selector.clearHotelOption();
      expect(selector.getSelectedHotelOptionId()).toBeNull();
    });

    it('1박 2일 + 조식 포함 요금을 올바르게 계산해야 함 (체크아웃 날짜 제외)', () => {
      const selector = new HotelOptionSelector(config);
      selector.setDateRange('2025-01-15', '2025-01-16');
      selector.selectHotelOption(1); // 조식 포함
      expect(selector.getTotalPrice()).toBe(100000); // 1/15만
    });

    it('2박 3일 + 조식 포함 요금을 올바르게 계산해야 함 (체크아웃 날짜 제외)', () => {
      const selector = new HotelOptionSelector(config);
      selector.setDateRange('2025-01-15', '2025-01-17');
      selector.selectHotelOption(1); // 조식 포함
      expect(selector.getTotalPrice()).toBe(250000); // 100000 + 150000
    });

    it('다른 옵션을 선택하면 요금이 변경되어야 함', () => {
      const selector = new HotelOptionSelector(config);
      selector.setDateRange('2025-01-15', '2025-01-17');
      selector.selectHotelOption(2); // 레이트 체크아웃
      expect(selector.getTotalPrice()).toBe(330000); // 130000 + 200000
    });

    it('옵션이 선택되지 않으면 0을 반환해야 함', () => {
      const selector = new HotelOptionSelector(config);
      selector.setDateRange('2025-01-15', '2025-01-16');
      expect(selector.getTotalPrice()).toBe(0);
    });

    it('날짜가 설정되지 않으면 0을 반환해야 함', () => {
      const selector = new HotelOptionSelector(config);
      selector.selectHotelOption(1);
      expect(selector.getTotalPrice()).toBe(0);
    });
  });

  describe('JSON 직렬화/역직렬화', () => {
    const config: HotelOptionSelectorConfig = {
      skus: [
        { id: 1, quantity: 5, date: '2025-01-15' },
        { id: 2, quantity: 3, date: '2025-01-16' },
      ],
      hotelOptions: [
        {
          id: 1,
          name: '조식 포함',
          priceByDate: {
            '2025-01-15': 100000,
            '2025-01-16': 150000,
          },
        },
      ],
    };

    it('현재 상태를 JSON으로 변환할 수 있어야 함', () => {
      const selector = new HotelOptionSelector(config);
      selector.setDateRange('2025-01-15', '2025-01-16');
      selector.selectHotelOption(1);

      const json = selector.toJSON();
      expect(json.checkInDate).toBe('2025-01-15');
      expect(json.checkOutDate).toBe('2025-01-16');
      expect(json.selectedHotelOptionId).toBe(1);
    });

    it('JSON에서 동일한 상태를 복원할 수 있어야 함', () => {
      const selector1 = new HotelOptionSelector(config);
      selector1.setDateRange('2025-01-15', '2025-01-16');
      selector1.selectHotelOption(1);

      const state = selector1.toJSON();
      const selector2 = HotelOptionSelector.fromJSON(config, state);

      expect(selector2.getTotalPrice()).toBe(selector1.getTotalPrice());
      expect(selector2.getStayNights()).toBe(selector1.getStayNights());
      expect(selector2.validateAvailability()).toBe(
        selector1.validateAvailability()
      );
      expect(selector2.getSelectedHotelOptionId()).toBe(
        selector1.getSelectedHotelOptionId()
      );
    });
  });

  describe('체크아웃 날짜 제외 검증', () => {
    const config: HotelOptionSelectorConfig = {
      skus: [
        { id: 1, quantity: 5, date: '2025-01-15' },
        { id: 2, quantity: 3, date: '2025-01-16' },
        { id: 3, quantity: 4, date: '2025-01-17' },
      ],
      hotelOptions: [
        {
          id: 1,
          name: '조식 포함',
          priceByDate: {
            '2025-01-15': 100000,
            '2025-01-16': 100000,
            '2025-01-17': 100000,
          },
        },
      ],
    };

    it('1박 2일 예약 시 체크아웃 날짜(1/16)의 가격은 포함되지 않아야 함', () => {
      const selector = new HotelOptionSelector(config);
      selector.setDateRange('2025-01-15', '2025-01-16');
      selector.selectHotelOption(1);

      expect(selector.getTotalPrice()).toBe(100000); // 1/15만
    });

    it('2박 3일 예약 시 체크아웃 날짜(1/17)의 가격은 포함되지 않아야 함', () => {
      const selector = new HotelOptionSelector(config);
      selector.setDateRange('2025-01-15', '2025-01-17');
      selector.selectHotelOption(1);

      expect(selector.getTotalPrice()).toBe(200000); // 1/15 + 1/16
    });
  });
});

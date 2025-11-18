import dayjs from 'dayjs';
import type {
  HotelOptionSelectorConfig,
  HotelOptionSelectorState,
  HotelSku,
  HotelOption,
} from './types';

/**
 * HotelOptionSelector
 *
 * 호텔 상품 예약을 위한 옵션 선택기
 *
 * 주요 기능:
 * - 체크인/체크아웃 날짜 선택
 * - 호텔 옵션 선택/해제
 * - 재고 확인 및 가격 계산
 * - 체크아웃 날짜는 재고 차감 및 가격 계산에서 제외됨
 */
export class HotelOptionSelector {
  private config: HotelOptionSelectorConfig;
  private checkInDate: string | null = null;
  private checkOutDate: string | null = null;
  private selectedHotelOptionId: number | null = null;

  constructor(config: HotelOptionSelectorConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * 설정 유효성 검증
   */
  private validateConfig(): void {
    // SKU 날짜 중복 체크
    const dates = this.config.skus.map((sku) => sku.date);
    const uniqueDates = new Set(dates);
    if (dates.length !== uniqueDates.size) {
      throw new Error('SKU에 중복된 날짜가 있습니다');
    }

    // 날짜 형식 검증 (YYYY-MM-DD)
    for (const sku of this.config.skus) {
      if (!dayjs(sku.date).isValid()) {
        throw new Error(`잘못된 날짜 형식입니다: ${sku.date}`);
      }
    }
  }

  /**
   * 체크인/체크아웃 날짜 설정
   *
   * @param checkInDate 체크인 날짜 (YYYY-MM-DD)
   * @param checkOutDate 체크아웃 날짜 (YYYY-MM-DD)
   */
  setDateRange(checkInDate: string, checkOutDate: string): void {
    const checkIn = dayjs(checkInDate);
    if (!checkIn.isValid()) {
      throw new Error(`잘못된 체크인 날짜 형식입니다: ${checkInDate}`);
    }
    
    const checkOut = dayjs(checkOutDate);
    if (!checkOut.isValid()) {
      throw new Error(`잘못된 체크아웃 날짜 형식입니다: ${checkOutDate}`);
    }

    if (checkIn.isSameOrAfter(checkOut)) {
      throw new Error('체크아웃 날짜는 체크인 날짜보다 이후여야 합니다');
    }

    this.checkInDate = checkInDate;
    this.checkOutDate = checkOutDate;
  }

  /**
   * 호텔 옵션 선택
   *
   * @param optionId 옵션 ID
   */
  selectHotelOption(optionId: number): void {
    const option = this.config.hotelOptions.find((opt) => opt.id === optionId);
    if (!option) {
      throw new Error(`존재하지 않는 옵션입니다: ${optionId}`);
    }

    this.selectedHotelOptionId = optionId;
  }

  /**
   * 호텔 옵션 선택 해제
   */
  clearHotelOption(): void {
    this.selectedHotelOptionId = null;
  }

  /**
   * 현재 선택된 호텔 옵션 ID 조회
   */
  getSelectedHotelOptionId(): number | null {
    return this.selectedHotelOptionId;
  }

  /**
   * 예약 가능한 날짜 목록 조회
   *
   * @returns 예약 가능한 날짜 배열 (정렬됨)
   */
  getAvailableDates(): string[] {
    return this.config.skus
      .filter((sku) => sku.quantity > 0)
      .map((sku) => sku.date)
      .sort();
  }

  /**
   * 숙박 일수 계산
   *
   * @returns 숙박 일수 (박)
   */
  getStayNights(): number {
    if (!this.checkInDate || !this.checkOutDate) {
      return 0;
    }

    const checkIn = dayjs(this.checkInDate);
    const checkOut = dayjs(this.checkOutDate);

    return checkOut.diff(checkIn, 'day');
  }

  /**
   * 체크인부터 체크아웃 전날까지의 날짜 목록 반환
   * (체크아웃 날짜는 포함하지 않음)
   *
   * @returns 날짜 목록 (YYYY-MM-DD)
   */
  private getStayDates(): string[] {
    if (!this.checkInDate || !this.checkOutDate) {
      return [];
    }

    const dates: string[] = [];
    let currentDate = dayjs(this.checkInDate);
    const checkOut = dayjs(this.checkOutDate);

    while (currentDate.isBefore(checkOut)) {
      dates.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }

    return dates;
  }

  /**
   * 선택한 기간의 재고 확인
   *
   * @returns 재고가 충분하면 true, 부족하면 false
   */
  validateAvailability(): boolean {
    if (!this.checkInDate || !this.checkOutDate) {
      return false;
    }

    const stayDates = this.getStayDates();

    // 모든 날짜에 재고가 있는지 확인
    for (const date of stayDates) {
      const sku = this.config.skus.find((s) => s.date === date);
      if (!sku || sku.quantity <= 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * 총 요금 계산
   * (선택한 옵션의 priceByDate를 체크인부터 체크아웃 전날까지 합산)
   * 
   * 옵션은 필수 선택이므로 옵션의 가격이 곧 총 가격입니다.
   *
   * @returns 총 요금
   */
  getTotalPrice(): number {
    if (!this.checkInDate || !this.checkOutDate || !this.selectedHotelOptionId) {
      return 0;
    }

    const option = this.config.hotelOptions.find(
      (opt) => opt.id === this.selectedHotelOptionId
    );
    if (!option) {
      throw new Error(`선택된 옵션을 찾을 수 없습니다: ${this.selectedHotelOptionId}`);
    }

    const stayDates = this.getStayDates();
    let totalPrice = 0;

    for (const date of stayDates) {
      const price = option.priceByDate[date];
      if (price === undefined) {
        throw new Error(`해당 날짜의 옵션 가격이 설정되지 않았습니다: ${date}`);
      }
      totalPrice += price;
    }

    return totalPrice;
  }

  /**
   * 현재 상태를 JSON으로 변환
   */
  toJSON(): HotelOptionSelectorState {
    return {
      checkInDate: this.checkInDate,
      checkOutDate: this.checkOutDate,
      selectedHotelOptionId: this.selectedHotelOptionId,
    };
  }

  /**
   * JSON에서 HotelOptionSelector 인스턴스 생성
   */
  static fromJSON(config: HotelOptionSelectorConfig, state: HotelOptionSelectorState): HotelOptionSelector {
    const selector = new HotelOptionSelector(config);
    if (state.checkInDate && state.checkOutDate) {
      selector.setDateRange(state.checkInDate, state.checkOutDate);
    }
    selector.selectedHotelOptionId = state.selectedHotelOptionId;
    return selector;
  }
}

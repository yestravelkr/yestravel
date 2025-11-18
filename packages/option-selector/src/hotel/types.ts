/**
 * Hotel SKU (Stock Keeping Unit) 관련 타입 정의
 * 
 * Hotel에서는 attributes가 없고 특정 날짜(체크인 날짜 기준)에
 * 방이 있는지 여부와 해당 방의 옵션별 금액만 체크합니다.
 */

/**
 * Hotel SKU - 특정 날짜의 방 재고
 * 
 * attributes가 없고 quantity만 관리합니다.
 * 
 * @property id - SKU 고유 ID
 * @property quantity - 해당 날짜(체크인 날짜)에 사용 가능한 방의 수량
 * @property date - 체크인 날짜 (YYYY-MM-DD 형식)
 */
export interface HotelSku {
  id: number;
  quantity: number;
  date: string; // 체크인 날짜 (YYYY-MM-DD)
}

/**
 * 호텔 옵션 (필수 선택)
 * 
 * 날짜마다 & 옵션마다 가격이 다를 수 있습니다.
 * 
 * @property id - 옵션 고유 ID
 * @property name - 옵션 이름 (예: "조식 포함", "레이트 체크아웃")
 * @property priceByDate - 날짜별 옵션 가격 { "YYYY-MM-DD": price }
 */
export interface HotelOption {
  id: number;
  name: string;
  priceByDate: Record<string, number>; // { "YYYY-MM-DD": price }
}

/**
 * HotelOptionSelector 설정을 위한 JSON 형식 인터페이스
 * 
 * SkuSelector 대신 시작일과 종료일을 입력받아
 * 그 기간 동안의 SKU에서 재고를 차감합니다.
 */
export interface HotelOptionSelectorConfig {
  /** 날짜별 SKU 재고 정보 */
  skus: HotelSku[];
  
  /** 선택 가능한 호텔 옵션 목록 (1개 필수 선택) */
  hotelOptions: HotelOption[];
}

/**
 * HotelOptionSelector의 현재 상태를 나타내는 인터페이스
 */
export interface HotelOptionSelectorState {
  /** 선택된 체크인 날짜 (YYYY-MM-DD) */
  checkInDate: string | null;
  
  /** 선택된 체크아웃 날짜 (YYYY-MM-DD) */
  checkOutDate: string | null;
  
  /** 선택된 호텔 옵션 ID (1개만 선택 가능) */
  selectedHotelOptionId: number | null;
}

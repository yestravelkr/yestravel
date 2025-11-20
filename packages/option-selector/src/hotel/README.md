# Hotel Option Selector

호텔 상품 예약을 위한 옵션 선택기입니다.

## 개요

HotelOptionSelector는 ProductOptionSelector와 달리 다음과 같은 특징을 가집니다:

- **SKU에 attributes가 없음**: 특정 날짜에 방이 있는지 여부와 수량만 관리
- **SkuSelector 대신 날짜 선택**: 시작일(체크인)과 종료일(체크아웃)을 입력
- **체크인 날짜 기준**: 모든 날짜는 체크인 날짜를 기준으로 관리
- **방 옵션 필수 선택**: 옵션 1개 필수 선택, 옵션의 가격이 곧 총 가격
- **날짜별 가격 차등**: 날짜마다 & 옵션마다 가격이 다를 수 있음

## 타입 구조

### HotelSku

특정 날짜(체크인 날짜)의 방 재고를 나타냅니다.

```typescript
interface HotelSku {
  id: number;
  quantity: number;      // 해당 날짜에 사용 가능한 방의 수량
  date: string;          // 체크인 날짜 (YYYY-MM-DD)
}
```

**특징:**
- attributes가 없음 (ProductSku와의 차이점)
- quantity만으로 재고 관리

### HotelOption

호텔 옵션을 나타냅니다. (필수 선택)

```typescript
interface HotelOption {
  id: number;
  name: string;                        // 옵션 이름 (예: "조식 포함", "레이트 체크아웃")
  priceByDate: Record<string, number>; // 날짜별 옵션 가격
}
```

**예시:**
```typescript
{
  id: 1,
  name: "조식 포함",
  priceByDate: {
    "2025-01-15": 150000,  // 평일 조식 포함 요금
    "2025-01-16": 200000,  // 주말 조식 포함 요금
  }
}
```

### HotelOptionSelectorConfig

HotelOptionSelector 초기화를 위한 설정입니다.

```typescript
interface HotelOptionSelectorConfig {
  skus: HotelSku[];                      // 날짜별 SKU 재고 정보
  hotelOptions: HotelOption[];           // 선택 가능한 호텔 옵션 목록 (1개 필수 선택)
}
```

### HotelOptionSelectorState

HotelOptionSelector의 현재 상태를 나타냅니다.

```typescript
interface HotelOptionSelectorState {
  checkInDate: string | null;            // 선택된 체크인 날짜 (YYYY-MM-DD)
  checkOutDate: string | null;           // 선택된 체크아웃 날짜 (YYYY-MM-DD)
  selectedHotelOptionId: number | null;  // 선택된 호텔 옵션 ID (1개만 선택 가능)
}
```

**참고**: `fromJSON()` 메서드를 사용할 때는 config와 state를 별도로 전달합니다.

## 사용 시나리오

### 1. 기본 숙박 예약

```typescript
// 설정 예시
const config: HotelOptionSelectorConfig = {
  skus: [
    { id: 1, quantity: 5, date: "2025-01-15" }, // 1/15 체크인 가능 방 5개
    { id: 2, quantity: 3, date: "2025-01-16" }, // 1/16 체크인 가능 방 3개
    { id: 3, quantity: 4, date: "2025-01-17" }, // 1/17 체크인 가능 방 4개
  ],
  hotelOptions: [
    {
      id: 1,
      name: "조식 포함",
      priceByDate: {
        "2025-01-15": 120000,
        "2025-01-16": 150000,
        "2025-01-17": 120000,
      }
    },
    {
      id: 2,
      name: "조식 미포함",
      priceByDate: {
        "2025-01-15": 100000,
        "2025-01-16": 130000,
        "2025-01-17": 100000,
      }
    }
  ]
};

// 1박 2일 예약 (1/15 체크인, 1/16 체크아웃)
// - 1/15 SKU에서 재고 차감
// - 조식 미포함 선택 시 요금: 100,000원
// - 조식 포함 선택 시 요금: 120,000원
```

### 2. 2박 3일 예약

```typescript
const selector = new HotelOptionSelector(config);

// 날짜 선택
selector.setDateRange("2025-01-15", "2025-01-17");

// 옵션 선택
selector.selectHotelOption(1); // 조식 포함

// 가격 계산
const totalPrice = selector.getTotalPrice();
// 1/15: 120,000 + 1/16: 150,000 = 270,000원

// 재고 확인
const isAvailable = selector.validateAvailability();
// 1/15, 1/16 모두 재고가 있는지 확인
```

## ProductOptionSelector와의 차이점

| 구분 | ProductOptionSelector | HotelOptionSelector |
|------|----------------------|-------------------|
| **SKU 구조** | id, quantity, attributes | id, quantity, date |
| **선택 방식** | SkuSelector로 attributes 선택 | 체크인/체크아웃 날짜 선택 |
| **재고 차감** | 선택한 SKU에서 quantity만큼 차감 | 기간 내 모든 날짜의 SKU에서 차감 |
| **가격 계산** | SKU 선택에 따라 결정 | 옵션의 날짜별 가격 합산 |
| **옵션** | 없음 (SKU 선택만) | 1개 필수 선택, 옵션 가격이 총 가격 |

## 재고 관리 원칙

1. **체크인 날짜 기준**: 모든 SKU는 체크인 날짜를 기준으로 생성됨
2. **기간 내 재고 차감**: 체크인부터 체크아웃 전날까지 모든 날짜의 SKU에서 재고 차감
   - 예: 1/15 체크인 ~ 1/17 체크아웃 → 1/15, 1/16 SKU에서 차감
   - **⚠️ 중요**: 체크아웃 날짜는 재고 차감 및 가격 계산에 포함되지 않음
3. **재고 부족 처리**: 기간 내 하나라도 재고가 부족하면 예약 불가

## 가격 계산 원칙

1. **옵션 필수 선택**: 반드시 1개의 옵션을 선택해야 함
2. **총 가격**: 선택한 옵션의 priceByDate를 체크인부터 체크아웃 전날까지 합산
   - **⚠️ 중요**: 체크아웃 날짜의 가격은 포함되지 않음
3. **날짜별 가격 차등**: 평일/주말, 성수기/비수기에 따라 다른 가격 적용 가능

## 구현된 기능

HotelOptionSelector 클래스에서 제공하는 기능:

- `setDateRange(checkIn: string, checkOut: string)`: 날짜 선택
- `selectHotelOption(optionId: number)`: 호텔 옵션 선택 (1개만 선택 가능)
- `clearHotelOption()`: 호텔 옵션 선택 해제
- `getSelectedHotelOptionId()`: 현재 선택된 호텔 옵션 ID 조회
- `getTotalPrice()`: 총 요금 계산 (선택한 옵션의 가격 합산)
- `getStayNights()`: 숙박 일수 계산
- `validateAvailability()`: 선택한 기간의 재고 확인
- `toJSON()`: 현재 상태를 JSON으로 변환
- `fromJSON(config, state)`: config와 state를 받아 인스턴스 생성

## 상태 저장/복원

HotelOptionSelector는 config와 state를 분리하여 관리합니다:

```typescript
// 상태 저장
const selector = new HotelOptionSelector(config);
selector.setDateRange("2025-01-15", "2025-01-17");
selector.selectHotelOption(1);

const state = selector.toJSON();
// localStorage 등에 state만 저장
localStorage.setItem('hotelState', JSON.stringify(state));

// 상태 복원
const savedState = JSON.parse(localStorage.getItem('hotelState'));
const restoredSelector = HotelOptionSelector.fromJSON(config, savedState);
```

**장점:**
- config는 서버에서 받아오고, state만 클라이언트에서 관리
- state는 사용자의 선택 정보만 포함하여 용량이 작음
- config 업데이트 시 state는 유지 가능


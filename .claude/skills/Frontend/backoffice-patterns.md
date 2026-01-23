# 백오피스 페이지 패턴

## 리스트 페이지 구조

### 필수 컴포넌트

```
MajorPageLayout
└── ListPageLayout
    ├── StatusTabs (상태별 탭)
    ├── OrderFilters 또는 커스텀 필터
    ├── TableToolbar (n개씩 보기)
    ├── Table
    └── Pagination
```

### 파일 구조

```
routes/_auth/{도메인}/
├── index.tsx              # 리다이렉트 (기본 search params 포함)
├── {도메인}.index.tsx     # 리스트 페이지
├── _{id}.tsx              # 상세 페이지
├── _components/           # 페이지 전용 컴포넌트
│   └── {Domain}Filters.tsx
└── _mocks/                # Mock 데이터
    └── {domain}Mock.ts
```

### Search Params (URL 쿼리스트링) 패턴

```typescript
// 1. SearchParams 타입 정의
interface {Domain}SearchParams {
  page: number;
  limit: number;
  status: string;        // 상태 필터
  periodType: string;    // 기간 타입
  periodPreset: string;  // 기간 프리셋
  startDate: string;     // 시작일
  endDate: string;       // 종료일
  searchQuery: string;   // 검색어
  // ... 도메인별 추가 필터
}

// 2. Route 정의 (validateSearch 필수)
export const Route = createFileRoute('/_auth/{domain}/{domain}/')(  {
  component: {Domain}ListPage,
  validateSearch: (search: Record<string, unknown>): {Domain}SearchParams => ({
    page: Number(search.page) || 1,
    limit: Number(search.limit) || 50,
    status: (search.status as string) || '',
    // ... 모든 필드에 기본값 설정
  }),
});

// 3. 컴포넌트에서 사용
const searchParams = Route.useSearch();
const navigate = Route.useNavigate();

// 필터 변경 시
const handleFiltersChange = (updates: Partial<FiltersState>) => {
  navigate({ search: { ...searchParams, page: 1, ...updates } });
};

// 페이지 변경 시
const handlePageChange = (newPage: number) => {
  navigate({ search: { ...searchParams, page: newPage } });
};
```

### 리다이렉트 설정 (index.tsx)

```typescript
export const Route = createFileRoute('/_auth/{domain}/')(  {
  beforeLoad: () => {
    throw redirect({
      to: '/{domain}/{subpath}',
      search: {
        page: 1,
        limit: 50,
        status: '',
        periodType: '',
        periodPreset: '',
        startDate: '',
        endDate: '',
        searchQuery: '',
        // 모든 search params 기본값 명시
      },
    });
  },
  component: () => null,
});
```

---

## 필터 컴포넌트

### 사용 가능한 필터 컴포넌트

| 컴포넌트 | 용도 | import |
|---------|------|--------|
| `CascadingPeriodFilter` | 기간 필터 (타입→프리셋→캘린더) | `@/shared/components` |
| `SearchableSelect` | 검색 + 단일 선택 | `@/shared/components` |
| `MultiSelectDropdown` | 검색 + 다중 선택 | `@/shared/components` |
| `Input` | 텍스트 검색 | `@/shared/components` |

### 필터 스타일 규칙

- **기본 상태**: `bg-[var(--bg-neutral)]` (회색)
- **선택 상태**: `bg-[var(--bg-neutral-solid)]` (검정) + 흰색 텍스트
- **형태**: pill (rounded-full, h-9, px-2)
- **선택 시 표시**: `라벨: 선택값` 또는 `라벨: 값 외 N개`
- **X 버튼**: 선택 상태에서 클리어 버튼 표시

### 필터 컴포넌트 예시

```tsx
<OrderFilters
  filters={filters}
  onFiltersChange={handleFiltersChange}
  periodTypeOptions={PERIOD_TYPE_OPTIONS}
  periodPresetOptions={PERIOD_PRESET_OPTIONS}
  orderStatusOptions={ORDER_STATUS_OPTIONS}
  campaignOptions={CAMPAIGN_OPTIONS}
  influencerOptions={INFLUENCER_OPTIONS}
  productOptions={PRODUCT_OPTIONS}
  optionOptions={OPTION_OPTIONS}
  onExcelDownload={handleExcelDownload}
/>
```

---

## 테이블 컴포넌트

### Table + TableToolbar 사용법

```tsx
import { Table, TableToolbar } from '@/shared/components';
import { createColumnHelper } from '@tanstack/react-table';

// 1. Column Helper 생성
const columnHelper = createColumnHelper<{DataType}>();

// 2. Columns 정의
const columns = [
  columnHelper.accessor('fieldName', {
    header: '헤더명',
    size: 100,  // 너비 (선택)
    cell: (info) => info.getValue(),  // 커스텀 렌더링 (선택)
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: () => <ActionButton>상세보기</ActionButton>,
    size: 100,
  }),
];

// 3. 렌더링
<TableToolbar
  label="주문"
  totalCount={totalCount}
  pageSize={limit}
  onPageSizeChange={handlePageSizeChange}
/>
<Table columns={columns} data={data} />
```

---

## StatusTabs 사용법

```tsx
import { StatusTabs, type StatusTabItem } from '@/shared/components';

// Mock 데이터에서 탭 목록 생성 함수 정의
export function getStatusTabs(): StatusTabItem<StatusType>[] {
  return [
    { key: 'ALL', label: '전체', count: 100 },
    { key: 'PENDING', label: '대기', count: 10, hasAlert: true },
    { key: 'COMPLETED', label: '완료', count: 90 },
  ];
}

// 컴포넌트에서 사용
const statusTabs = getStatusTabs();

<StatusTabs
  tabs={statusTabs}
  activeTab={currentStatus}
  onTabChange={(tab) => navigate({ search: { ...searchParams, status: tab } })}
/>
```

---

## ListPageLayout 사용법

```tsx
import { ListPageLayout } from '@/shared/components';

<MajorPageLayout title="페이지 제목">
  <ListPageLayout
    tabs={<StatusTabs ... />}
    filters={<Filters ... />}
    toolbar={<TableToolbar ... />}
    table={<Table ... />}
    pagination={<Pagination ... />}
  />
</MajorPageLayout>
```

---

## Pagination 사용법

```tsx
import { Pagination } from '@/shared/components';

const totalPages = Math.ceil(totalCount / limit);

<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={handlePageChange}
/>
```

---

## Mock 데이터 패턴

```typescript
// _mocks/{domain}Mock.ts

// 1. 상태 타입 정의
export type {Domain}Status = 'PENDING' | 'COMPLETED' | ...;
export type StatusTab = 'ALL' | {Domain}Status;

// 2. 상태 라벨
export const STATUS_LABELS: Record<StatusTab, string> = {
  ALL: '전체',
  PENDING: '대기',
  COMPLETED: '완료',
};

// 3. 상태별 카운트
export const mockStatusCounts: Record<StatusTab, number> = { ... };

// 4. 탭 목록 생성 함수
export function getStatusTabs(): StatusTabItem<StatusTab>[] { ... }

// 5. 필터 옵션들
export const PERIOD_TYPE_OPTIONS = [
  { value: 'payment', label: '결제일' },
  { value: 'order', label: '주문일' },
];

export const PERIOD_PRESET_OPTIONS = [
  { value: 'today', label: '오늘' },
  { value: '7days', label: '최근 7일' },
  { value: '1month', label: '1개월' },
  { value: 'custom', label: '직접입력' },
];

// 6. 데이터 인터페이스
export interface {Domain}Item { ... }

// 7. Mock 데이터 생성
export const mockData: {Domain}Item[] = generateMockData();

// 8. 필터링 + 페이지네이션 함수
export function getFilteredData(
  status: StatusTab,
  page: number,
  limit: number,
): { data: {Domain}Item[]; totalCount: number } { ... }
```

---

## 체크리스트

### 리스트 페이지 구현 시

- [ ] `validateSearch`로 모든 search params 정의
- [ ] 기본 리다이렉트 (index.tsx)에 모든 search params 포함
- [ ] `ListPageLayout` 사용
- [ ] 필터 변경 시 `page: 1`로 리셋
- [ ] Mock 데이터에 상태별 카운트 및 탭 목록 함수 포함
- [ ] 테이블 가로 스크롤 지원 (Table 컴포넌트 기본 제공)

### 상세 페이지 구현 시

- [ ] `MajorPageLayout` 사용
- [ ] 뒤로가기 버튼 포함
- [ ] 폼은 `react-hook-form` + `zod` 사용
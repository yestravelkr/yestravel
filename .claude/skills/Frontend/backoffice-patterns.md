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

## FormPageLayout 사용법 (생성/수정 폼 페이지)

생성, 상세/수정 페이지에서 사용하는 1컬럼 중앙 정렬 레이아웃

### 구성 요소

| 컴포넌트 | 설명 |
|---------|------|
| `FormPageLayout.Container` | 페이지 컨테이너 (회색 배경, 중앙 정렬) |
| `FormPageLayout.Content` | 콘텐츠 래퍼 (width 860px, gap-8) |
| `FormPageLayout.Header` | 헤더 (뒤로가기 + 타이틀 + 액션) |
| `FormPageLayout.Cards` | 카드 영역 (gap-5) |

### 버튼 컴포넌트

| 컴포넌트 | 설명 |
|---------|------|
| `PrimaryButton` | 검정 배경 기본 버튼 |
| `SecondaryButton` | 흰색 배경 아웃라인 버튼 |
| `ButtonGroup` | 버튼 그룹 래퍼 |

### 생성 페이지 예시

```tsx
import { FormPageLayout, PrimaryButton } from '@/shared/components/layout';
import { Card } from '@/shared/components/card/Card';
import { SelectDropdown } from '@/shared/components/SelectDropdown';
import { ImageFileField } from '@/shared/components/brand/LicenseFileField';

function CreatePage() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  return (
    <FormPageLayout.Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormPageLayout.Content>
          <FormPageLayout.Header title="새 브랜드" onBack={() => navigate({ to: '/brand' })}>
            <PrimaryButton type="submit" disabled={isPending}>
              {isPending ? '저장 중...' : '저장'}
            </PrimaryButton>
          </FormPageLayout.Header>

          <FormPageLayout.Cards>
            <Card title="기본정보">
              {/* 폼 필드들 */}
            </Card>
            <Card title="사업자정보">
              {/* SelectDropdown 사용 */}
              <SelectDropdown
                variant="form"
                options={businessTypeOptions}
                value={watch('businessInfo.type')}
                onChange={(v) => setValue('businessInfo.type', v)}
                error={!!errors.businessInfo?.type}
                placeholder="선택해주세요"
              />
              {/* ImageFileField 사용 */}
              <ImageFileField
                label="사업자등록증 사본"
                isEditMode={true}
                fileUrl={watch('licenseFileUrl')}
                onChange={(url) => setValue('licenseFileUrl', url)}
                error={errors.licenseFileUrl?.message}
                uploadPath="business-license"
              />
            </Card>
          </FormPageLayout.Cards>
        </FormPageLayout.Content>
      </form>
    </FormPageLayout.Container>
  );
}
```

### 상세/수정 페이지 예시 (view/edit 모드 전환)

```tsx
import { FormPageLayout, PrimaryButton, SecondaryButton, ButtonGroup } from '@/shared/components/layout';

function DetailPage() {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <FormPageLayout.Container>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormPageLayout.Content>
          <FormPageLayout.Header title={brand.name} onBack={() => navigate({ to: '/brand' })}>
            {isEditMode ? (
              <ButtonGroup>
                <SecondaryButton type="button" onClick={() => setIsEditMode(false)}>
                  취소
                </SecondaryButton>
                <PrimaryButton type="submit" disabled={isPending}>
                  저장
                </PrimaryButton>
              </ButtonGroup>
            ) : (
              <PrimaryButton type="button" onClick={() => setIsEditMode(true)}>
                저장
              </PrimaryButton>
            )}
          </FormPageLayout.Header>

          <FormPageLayout.Cards>
            <Card title="기본정보">
              {isEditMode ? (
                <StyledInput {...register('name')} />
              ) : (
                <FieldValue>{brand.name}</FieldValue>
              )}
            </Card>
          </FormPageLayout.Cards>
        </FormPageLayout.Content>
      </form>
    </FormPageLayout.Container>
  );
}
```

### 폼 필드 스타일 컴포넌트

```tsx
// 2컬럼 레이아웃
const FormRow = tw.div`flex gap-2 w-full`;

// 필드 래퍼 (flex-1)
const FormFieldWrapper = tw.div`flex flex-col gap-2 flex-1 min-w-0`;

// 전체 너비 필드 래퍼
const FormFieldWrapperFull = tw.div`flex flex-col gap-2 w-full`;

// 라벨
const FieldLabel = tw.label`
  text-[15px] leading-5
  text-[var(--fg-muted,#71717A)]
`;

// 값 표시 (view 모드)
const FieldValue = tw.div`
  h-11 flex items-center
  text-[16.5px] leading-[22px]
  text-[var(--fg-neutral,#18181B)]
`;

// Input
const StyledInput = tw.input<{ $error?: boolean }>`
  w-full h-11 px-4
  bg-white border rounded-xl
  text-[16.5px] leading-[22px]
  text-[var(--fg-neutral,#18181B)]
  placeholder:text-[var(--fg-placeholder,#9E9E9E)]
  outline-none transition-colors
  focus:ring-2 focus:ring-blue-500
  ${({ $error }) => $error
    ? 'border-[var(--stroke-critical,#EB3D3D)]'
    : 'border-[var(--stroke-neutral,#E4E4E7)]'}
`;

// 에러 메시지
const ErrorMessage = tw.p`text-sm text-[var(--fg-critical,#EB3D3D)]`;
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

- [ ] `FormPageLayout` 사용 (생성/수정 폼 페이지)
- [ ] 뒤로가기 버튼 포함
- [ ] 폼은 `react-hook-form` + `zod` 사용
- [ ] `SelectDropdown` variant="form" 사용 (native select 금지)
- [ ] `ImageFileField` 사용 (이미지 업로드)

---

## 간단한 리스트 페이지 패턴

필터/탭 없이 검색 + 테이블만 필요한 경우 (예: 브랜드 관리)

### 파일 구조

```
routes/_auth/{도메인}/
├── index.tsx              # 리스트 페이지
├── create.tsx             # 생성 페이지
├── $id.tsx                # 상세/수정 페이지
└── _components/
    └── {Domain}List.tsx   # 리스트 컴포넌트
```

### 예시 코드

```tsx
// index.tsx
import { MajorPageLayout } from '@/components/layout';
import { TableSkeleton } from '@/shared/components';

export const Route = createFileRoute('/_auth/{domain}/')({
  component: {Domain}ListPage,
});

function {Domain}ListPage() {
  return (
    <MajorPageLayout
      title="{도메인} 관리"
      headerActions={
        <Link to="/{domain}/create">
          <Button kind="neutral" variant="solid" size="medium" leadingIcon={<Plus size={20} />}>
            {도메인} 등록
          </Button>
        </Link>
      }
    >
      <Suspense fallback={<TableSkeleton columns={6} rows={5} />}>
        <{Domain}List />
      </Suspense>
    </MajorPageLayout>
  );
}
```

```tsx
// _components/{Domain}List.tsx
import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Table, ListPageLayout, Input, EmptyState, openDeleteConfirmModal } from '@/shared/components';
import { toast } from 'sonner';

const columnHelper = createColumnHelper<{DataType}>();

export function {Domain}List() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [data] = trpc.backoffice{Domain}.findAll.useSuspenseQuery();
  const [searchQuery, setSearchQuery] = useState('');

  // 삭제 mutation
  const deleteMutation = trpc.backoffice{Domain}.delete.useMutation({
    onSuccess: () => {
      toast.success('{도메인}이(가) 삭제되었습니다.');
      utils.backoffice{Domain}.findAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || '{도메인} 삭제에 실패했습니다.');
    },
  });

  // 검색 필터링
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item) => item.name.toLowerCase().includes(query));
  }, [data, searchQuery]);

  // 삭제 핸들러
  const handleDelete = async (item: {DataType}) => {
    const confirmed = await openDeleteConfirmModal({
      targetName: '{도메인}',
    });
    if (confirmed) {
      await deleteMutation.mutateAsync({ id: item.id });
    }
  };

  const columns = [
    columnHelper.accessor('name', {
      header: '이름',
      size: 160,
    }),
    columnHelper.accessor('createdAt', {
      header: '등록일',
      cell: (info) => dayjs(info.getValue()).format('YY.MM.DD'),
      size: 120,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <ActionButtons>
          <Button kind="neutral" variant="outline" size="small" onClick={(e) => { e.stopPropagation(); navigate({ to: `/{domain}/${info.row.original.id}` }); }}>
            수정
          </Button>
          <Button kind="critical" variant="outline" size="small" onClick={(e) => { e.stopPropagation(); handleDelete(info.row.original); }}>
            삭제
          </Button>
        </ActionButtons>
      ),
      size: 140,
    }),
  ];

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<InboxIcon />}
        title="등록된 {도메인}이(가) 없습니다"
        description="새로운 {도메인}을(를) 등록하여 관리를 시작하세요."
        action={<Link to="/{domain}/create"><Button>첫 {도메인} 등록하기</Button></Link>}
      />
    );
  }

  return (
    <ListPageLayout
      filters={
        <SearchWrapper>
          <Input prefix={<Search size={20} />} placeholder="이름 검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </SearchWrapper>
      }
      table={<Table columns={columns} data={filteredData} onRowClick={(row) => navigate({ to: `/{domain}/${row.id}` })} />}
    />
  );
}

const SearchWrapper = tw.div`w-[280px]`;
const ActionButtons = tw.div`flex items-center gap-1`;
```

---

## 삭제 확인 모달

### openDeleteConfirmModal 사용법

```tsx
import { openDeleteConfirmModal } from '@/shared/components';
import { toast } from 'sonner';

const handleDelete = async (item: DataType) => {
  // 모달로 확인
  const confirmed = await openDeleteConfirmModal({
    targetName: '브랜드',  // "선택한 브랜드을(를) 삭제할까요?" 형태로 표시
    description: '삭제된 데이터는 복구할 수 없습니다.',  // 선택사항
  });

  if (confirmed) {
    // 삭제 실행
    await deleteMutation.mutateAsync({ id: item.id });
  }
};
```

### DeleteConfirmModal Props

| prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `targetName` | `string` | O | 삭제 대상 이름 (브랜드, 상품 등) |
| `description` | `string` | X | 추가 설명 메시지 |

---

## Toast 사용법 (sonner)

### 기본 사용

```tsx
import { toast } from 'sonner';

// 성공
toast.success('저장되었습니다.');

// 에러
toast.error('저장에 실패했습니다.');
toast.error(error.message || '기본 에러 메시지');

// 정보
toast.info('처리 중입니다.');

// 경고
toast.warning('주의가 필요합니다.');
```

### Mutation과 함께 사용

```tsx
const deleteMutation = trpc.backoffice{Domain}.delete.useMutation({
  onSuccess: () => {
    toast.success('{도메인}이(가) 삭제되었습니다.');
    utils.backoffice{Domain}.findAll.invalidate();  // 캐시 무효화
  },
  onError: (error) => {
    toast.error(error.message || '{도메인} 삭제에 실패했습니다.');
  },
});
```

### 주의사항

- `alert()` 사용 금지 → `toast` 사용
- 삭제 확인은 `openDeleteConfirmModal` 사용
- 작업 완료 시에만 `toast.success` 표시

---

## SelectDropdown 사용법 (폼용)

native `<select>` 대신 커스텀 드롭다운 사용

```tsx
import { SelectDropdown } from '@/shared/components/SelectDropdown';

// 옵션 목록 (빈 값 없이 정의)
const options = [
  { value: 'INDIVIDUAL', label: '개인사업자' },
  { value: 'CORPORATION', label: '법인사업자' },
];

// 폼에서 사용
<SelectDropdown
  variant="form"
  options={options}
  value={watch('type')}
  onChange={(v) => setValue('type', v)}
  error={!!errors.type}
  placeholder="선택해주세요"
/>
```

### Props

| prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `variant` | `'default' \| 'form'` | X | 스타일 (폼에서는 `"form"` 필수) |
| `options` | `{ value: string; label: string }[]` | O | 옵션 목록 |
| `value` | `string \| null \| undefined` | O | 현재 값 |
| `onChange` | `(value: string) => void` | O | 값 변경 핸들러 |
| `error` | `boolean` | X | 에러 상태 |
| `placeholder` | `string` | X | placeholder 텍스트 |
| `disabled` | `boolean` | X | 비활성화 |

---

## ImageFileField 사용법

이미지 업로드 필드 (편집 모드: FileUpload, 보기 모드: 썸네일)

```tsx
import { ImageFileField } from '@/shared/components/brand/LicenseFileField';

<ImageFileField
  label="사업자등록증 사본"
  isEditMode={isEditMode}
  fileUrl={watch('licenseFileUrl')}
  onChange={(url) => setValue('licenseFileUrl', url)}
  error={errors.licenseFileUrl?.message}
  uploadPath="business-license"
/>
```

### Props

| prop | 타입 | 필수 | 설명 |
|------|------|------|------|
| `label` | `string` | O | 필드 라벨 |
| `isEditMode` | `boolean` | O | 편집 모드 여부 |
| `fileUrl` | `string \| null \| undefined` | X | 파일 URL |
| `onChange` | `(url: string \| null) => void` | O | 값 변경 핸들러 |
| `error` | `string` | X | 에러 메시지 |
| `uploadPath` | `string` | X | 업로드 경로 (기본: `images`) |
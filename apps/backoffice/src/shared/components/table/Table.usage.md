# Table 컴포넌트 사용 가이드

TanStack Table v8 기반 테이블 컴포넌트 사용 예시입니다.

## 기본 사용법

```tsx
import { Table } from '@/shared/components/table/Table';
import { createColumnHelper } from '@tanstack/react-table';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    size: 60,
  }),
  columnHelper.accessor('name', {
    header: '이름',
    size: 120,
  }),
  columnHelper.accessor('email', {
    header: '이메일',
  }),
  columnHelper.accessor('role', {
    header: '역할',
    size: 100,
  }),
];

function UserList() {
  const users: User[] = [
    { id: 1, name: '홍길동', email: 'hong@example.com', role: '관리자' },
    { id: 2, name: '김철수', email: 'kim@example.com', role: '사용자' },
  ];

  return (
    <Table
      columns={columns}
      data={users}
      onRowClick={(user) => console.log('클릭된 사용자:', user)}
    />
  );
}
```

## 커스텀 렌더링

```tsx
const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
  }),
  columnHelper.accessor('name', {
    header: '이름',
  }),
  columnHelper.accessor('status', {
    header: '상태',
    cell: (info) => {
      const status = info.getValue();
      return (
        <span
          className={`px-2 py-1 rounded ${
            status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
          }`}
        >
          {status === 'active' ? '활성' : '비활성'}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: '작업',
    cell: (info) => (
      <button onClick={() => handleEdit(info.row.original)}>수정</button>
    ),
  }),
];
```

## 기존 코드 마이그레이션

### 이전 방식 (기존 Column 인터페이스)

```tsx
// ❌ 이전 방식
const columns: Column<Product>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (item) => item.id,
    width: '60px',
  },
  {
    key: 'name',
    header: '상품명',
    render: (item) => item.name,
  },
];

<Table columns={columns} data={products} onRowClick={handleRowClick} />
```

### TanStack Table 방식 (권장)

```tsx
// ✅ TanStack Table 방식
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<Product>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    size: 60,
  }),
  columnHelper.accessor('name', {
    header: '상품명',
  }),
];

<Table columns={columns} data={products} onRowClick={handleRowClick} />
```

## 주요 차이점

| 항목 | 이전 방식 | TanStack Table |
|------|----------|----------------|
| 타입 안전성 | 제한적 | 완전한 타입 추론 |
| 컬럼 너비 | `width: '60px'` | `size: 60` |
| 렌더링 | `render: (item) => ...` | `cell: (info) => ...` |
| accessor | `key: 'field'` | `accessor: 'field'` |
| 정렬/필터 | 미지원 | 내장 지원 |

## 고급 기능

### 정렬 기능 추가

```tsx
import { getSortedRowModel } from '@tanstack/react-table';

// Table 컴포넌트에 정렬 옵션 추가 필요
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});
```

### 필터링 기능 추가

```tsx
import { getFilteredRowModel } from '@tanstack/react-table';

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
});
```

## 참고 자료

- [TanStack Table 공식 문서](https://tanstack.com/table/v8/docs/api/core/table)
- [TanStack Table React 가이드](https://tanstack.com/table/v8/docs/framework/react/react-table)

import { useNavigate, Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import { Table, EmptyState } from '@/shared/components';
import { trpc } from '@/shared/trpc';

// Product 타입 정의 (API 응답 기반)
interface Product {
  id: number;
  type: 'HOTEL' | 'E-TICKET' | 'DELIVERY';
  name: string;
  brand: {
    id: number;
    name: string;
  };
  price: number;
  status: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT';
  useStock: boolean;
  useCalendar: boolean;
  createdAt: string;
  updatedAt: string;
}

export function ProductList() {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const utils = trpc.useUtils();

  // 상품 리스트 조회 (페이지네이션 포함)
  const [data] = trpc.backofficeProduct.findAll.useSuspenseQuery({
    page: 1,
    limit: 50,
  });
  const products = data?.data || [];

  // 상품 삭제 mutation
  const deleteMutation = trpc.backofficeProduct.delete.useMutation({
    onSuccess: () => {
      toast.success('상품이 삭제되었습니다.');
      utils.backofficeProduct.findAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || '상품 삭제에 실패했습니다.');
    },
  });

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map((item: Product) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  // 개별 선택/해제
  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  // 삭제 처리
  const handleDelete = async (id: number, name: string) => {
    if (confirm(`"${name}" 상품을 삭제하시겠습니까?`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const columnHelper = createColumnHelper<Product>();

  const columns = [
    columnHelper.display({
      id: 'checkbox',
      header: () => (
        <Checkbox
          type="checkbox"
          checked={
            products.length > 0 && selectedIds.length === products.length
          }
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleSelectAll(e.target.checked)
          }
        />
      ),
      cell: (info) => (
        <Checkbox
          type="checkbox"
          checked={selectedIds.includes(info.row.original.id)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleSelectOne(info.row.original.id, e.target.checked)
          }
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        />
      ),
      size: 50,
    }),
    columnHelper.accessor('name', {
      header: '상품명',
      cell: (info) => (
        <div>
          <ProductName>{info.getValue()}</ProductName>
          <TypeBadge type={info.row.original.type}>
            {getTypeLabel(info.row.original.type)}
          </TypeBadge>
        </div>
      ),
      size: 250,
    }),
    columnHelper.accessor('brand.name', {
      header: '브랜드',
      cell: (info) => <BrandName>{info.getValue()}</BrandName>,
      size: 150,
    }),
    columnHelper.accessor('status', {
      header: '상태',
      cell: (info) => (
        <StatusBadge status={info.getValue()}>
          {getStatusLabel(info.getValue())}
        </StatusBadge>
      ),
      size: 80,
    }),
    columnHelper.accessor('createdAt', {
      header: '등록일',
      cell: (info) => (
        <DateText>
          {new Date(info.getValue()).toLocaleDateString('ko-KR')}
        </DateText>
      ),
      size: 100,
    }),
    columnHelper.accessor('updatedAt', {
      header: '수정일',
      cell: (info) => (
        <DateText>
          {new Date(info.getValue()).toLocaleDateString('ko-KR')}
        </DateText>
      ),
      size: 100,
    }),
    columnHelper.display({
      id: 'actions',
      header: '부가기능',
      cell: (info) => (
        <ActionsContainer
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <EditButton
            to={`/product/${info.row.original.id}/edit`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            수정
          </EditButton>
          <DeleteButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleDelete(info.row.original.id, info.row.original.name);
            }}
          >
            삭제
          </DeleteButton>
        </ActionsContainer>
      ),
      size: 140,
    }),
  ];

  if (products && products.length > 0) {
    return <Table columns={columns} data={products} />;
  }

  return (
    <EmptyState
      icon={<InboxIcon />}
      title="등록된 상품이 없습니다"
      description="새로운 상품을 등록하여 판매를 시작하세요."
      action={
        <CreateButton to="/product/create">첫 상품 등록하기</CreateButton>
      }
    />
  );
}

// 타입 라벨 변환 함수
function getTypeLabel(type: 'HOTEL' | 'E-TICKET' | 'DELIVERY'): string {
  const labels = {
    HOTEL: '숙박',
    'E-TICKET': '티켓',
    DELIVERY: '배송',
  };
  return labels[type] || type;
}

// 상태 라벨 변환 함수
function getStatusLabel(status: 'VISIBLE' | 'HIDDEN' | 'SOLD_OUT'): string {
  const labels = {
    VISIBLE: '판매중',
    HIDDEN: '숨김',
    SOLD_OUT: '품절',
  };
  return labels[status] || status;
}

// 체크박스
const Checkbox = tw.input`
  w-4
  h-4
  text-blue-600
  border-gray-300
  rounded
  focus:ring-blue-500
  cursor-pointer
`;

// 타입별 색상 뱃지
const TypeBadge = tw.span<{ type: string }>`
  inline-flex
  items-center
  px-2
  py-0.5
  rounded
  text-xs
  font-medium
  ml-2
  ${(props) => {
    switch (props.type) {
      case 'HOTEL':
        return 'bg-blue-100 text-blue-800';
      case 'E-TICKET':
        return 'bg-green-100 text-green-800';
      case 'DELIVERY':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }}
`;

// 상태 뱃지
const StatusBadge = tw.span<{ status: string }>`
  inline-flex
  items-center
  px-2
  py-0.5
  rounded
  text-xs
  font-medium
  ${(props) => {
    switch (props.status) {
      case 'VISIBLE':
        return 'bg-green-100 text-green-800';
      case 'HIDDEN':
        return 'bg-gray-100 text-gray-600';
      case 'SOLD_OUT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }}
`;

// 상품명 표시
const ProductName = tw.div`
  font-medium
  text-gray-900
  inline
`;

// 브랜드명 표시
const BrandName = tw.div`
  text-sm
  text-gray-900
`;

// 가격 표시
const PriceText = tw.div`
  text-sm
  font-medium
  text-gray-900
`;

// Y/N 상태 표시
const StatusValue = tw.div`
  text-sm
  font-medium
  text-gray-900
`;

// 날짜 표시
const DateText = tw.div`
  text-sm
  text-gray-600
`;

// 액션 버튼 컨테이너
const ActionsContainer = tw.div`
  flex
  gap-2
  justify-start
`;

// 수정 버튼
const EditButton = tw(Link)`
  text-sm
  text-blue-600
  hover:text-blue-800
  font-medium
  cursor-pointer
  transition-colors
`;

// 삭제 버튼
const DeleteButton = tw.button`
  text-sm
  text-red-600
  hover:text-red-800
  font-medium
  cursor-pointer
  transition-colors
`;

// 새 상품 등록 버튼
const CreateButton = tw(Link)`
  px-4
  py-2
  bg-blue-600
  text-white
  rounded-lg
  hover:bg-blue-700
  transition-colors
  font-medium
  inline-block
`;

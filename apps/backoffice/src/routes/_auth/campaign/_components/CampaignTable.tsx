/**
 * CampaignTable - 캠페인 테이블 컴포넌트
 *
 * 캠페인보기 / 상품별보기 두 가지 뷰 모드를 지원하는 TanStack Table 기반 테이블입니다.
 */

import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import tw from 'tailwind-styled-components';

import { Table } from '@/shared/components';

/** 캠페인 뷰 모드 */
export type CampaignViewMode = 'campaign' | 'product';

/** 캠페인 테이블 데이터 타입 */
export interface CampaignTableData {
  id: number;
  title: string;
  startAt: Date;
  endAt: Date;
  description: string | null;
  thumbnail: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** 상품별보기 테이블 데이터 타입 (추후 API 구현 예정) */
export interface ProductViewTableData {
  id: number;
  productName: string;
  campaignName: string;
  startAt: Date;
  endAt: Date;
  brand: string;
  category: string;
  orderCount: number;
  revenue: number;
}

interface CampaignTableProps {
  /** 뷰 모드 */
  viewMode: CampaignViewMode;
  /** 캠페인 데이터 */
  campaigns: CampaignTableData[];
  /** 행 클릭 핸들러 */
  onRowClick?: (campaign: CampaignTableData) => void;
  /** 판매링크(매출상세) 클릭 핸들러 */
  onSalesLinkClick?: (campaign: CampaignTableData) => void;
  /** 수정 클릭 핸들러 */
  onEditClick?: (campaign: CampaignTableData) => void;
  /** 삭제 클릭 핸들러 */
  onDeleteClick?: (campaign: CampaignTableData) => void;
}

const campaignColumnHelper = createColumnHelper<CampaignTableData>();
const productColumnHelper = createColumnHelper<ProductViewTableData>();

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('ko-KR').format(amount) + '원';

/**
 * Usage:
 * <CampaignTable
 *   viewMode="campaign"
 *   campaigns={campaigns}
 *   onRowClick={handleRowClick}
 *   onSalesLinkClick={handleSalesLink}
 *   onEditClick={handleEdit}
 *   onDeleteClick={handleDelete}
 * />
 */
export function CampaignTable({
  viewMode,
  campaigns,
  onRowClick,
  onSalesLinkClick,
  onEditClick,
  onDeleteClick,
}: CampaignTableProps) {
  if (viewMode === 'product') {
    return <ProductViewTable />;
  }

  return (
    <CampaignViewTable
      campaigns={campaigns}
      onRowClick={onRowClick}
      onSalesLinkClick={onSalesLinkClick}
      onEditClick={onEditClick}
      onDeleteClick={onDeleteClick}
    />
  );
}

/** 캠페인보기 테이블 */
function CampaignViewTable({
  campaigns,
  onRowClick,
  onSalesLinkClick,
  onEditClick,
  onDeleteClick,
}: Omit<CampaignTableProps, 'viewMode'>) {
  const columns = [
    campaignColumnHelper.accessor('title', {
      header: '캠페인',
      size: 200,
    }),
    campaignColumnHelper.display({
      id: 'period',
      header: '캠페인 기간',
      cell: (info) => {
        const { startAt, endAt } = info.row.original;
        return `${dayjs(startAt).format('YYYY.MM.DD')} ~ ${dayjs(endAt).format('YYYY.MM.DD')}`;
      },
      size: 200,
    }),
    campaignColumnHelper.display({
      id: 'influencer',
      header: '인플루언서',
      cell: () => '-',
      size: 120,
    }),
    campaignColumnHelper.display({
      id: 'brand',
      header: '브랜드',
      cell: () => '-',
      size: 120,
    }),
    campaignColumnHelper.display({
      id: 'orderCount',
      header: '주문수',
      cell: () => '-',
      size: 80,
    }),
    campaignColumnHelper.display({
      id: 'revenue',
      header: '매출',
      cell: () => '-',
      size: 100,
    }),
    campaignColumnHelper.display({
      id: 'dates',
      header: '등록일/수정일',
      cell: (info) => {
        const { createdAt, updatedAt } = info.row.original;
        return (
          <DateColumn>
            <span>{dayjs(createdAt).format('YY/MM/DD')}</span>
            <DateDivider>/</DateDivider>
            <span>{dayjs(updatedAt).format('YY/MM/DD')}</span>
          </DateColumn>
        );
      },
      size: 140,
    }),
    campaignColumnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => {
        const campaign = info.row.original;
        return (
          <ActionCell>
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                onSalesLinkClick?.(campaign);
              }}
            >
              매출 상세
            </ActionButton>
            <ActionButton
              onClick={(e) => {
                e.stopPropagation();
                onEditClick?.(campaign);
              }}
            >
              수정
            </ActionButton>
            <DeleteButton
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick?.(campaign);
              }}
            >
              삭제
            </DeleteButton>
          </ActionCell>
        );
      },
      size: 280,
    }),
  ];

  return <Table columns={columns} data={campaigns} onRowClick={onRowClick} />;
}

/** 상품별보기 테이블 (데이터 없음 - 빈 상태) */
function ProductViewTable() {
  const columns = [
    productColumnHelper.accessor('productName', {
      header: '상품',
      size: 200,
    }),
    productColumnHelper.accessor('campaignName', {
      header: '캠페인',
      size: 150,
    }),
    productColumnHelper.display({
      id: 'period',
      header: '캠페인 기간',
      cell: (info) => {
        const { startAt, endAt } = info.row.original;
        return `${dayjs(startAt).format('YYYY.MM.DD')} ~ ${dayjs(endAt).format('YYYY.MM.DD')}`;
      },
      size: 200,
    }),
    productColumnHelper.accessor('brand', {
      header: '브랜드',
      size: 120,
    }),
    productColumnHelper.accessor('category', {
      header: '카테고리',
      size: 120,
    }),
    productColumnHelper.accessor('orderCount', {
      header: '주문수',
      size: 80,
    }),
    productColumnHelper.accessor('revenue', {
      header: '매출',
      cell: (info) => formatPrice(info.getValue()),
      size: 100,
    }),
    productColumnHelper.display({
      id: 'actions',
      header: '',
      cell: () => {
        return (
          <ActionCell>
            <ActionButton>매출 상세</ActionButton>
            <ActionButton>수정</ActionButton>
            <DeleteButton>삭제</DeleteButton>
          </ActionCell>
        );
      },
      size: 280,
    }),
  ];

  const emptyData: ProductViewTableData[] = [];

  return <Table columns={columns} data={emptyData} />;
}

/** Styled Components */

const DateColumn = tw.div`
  flex
  items-center
  gap-1
  text-sm
`;

const DateDivider = tw.span`
  text-[var(--fg-muted)]
`;

const ActionCell = tw.div`
  flex
  items-center
  gap-1
`;

const ActionButton = tw.button`
  flex
  items-center
  justify-center
  h-8
  px-2.5
  bg-white
  border
  border-[#e4e4e7]
  rounded-xl
  text-[15px]
  leading-5
  whitespace-nowrap
  text-[#18181b]
  cursor-pointer
  transition-colors
  hover:bg-gray-50
`;

const DeleteButton = tw.button`
  flex
  items-center
  justify-center
  h-8
  px-2.5
  bg-white
  border
  border-[#e4e4e7]
  rounded-xl
  text-[15px]
  leading-5
  whitespace-nowrap
  text-[#eb3d3d]
  cursor-pointer
  transition-colors
  hover:bg-red-50
`;

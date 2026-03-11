/**
 * CampaignTable - 캠페인 테이블 컴포넌트
 *
 * 캠페인보기 / 상품별보기 두 가지 뷰 모드를 지원하는 TanStack Table 기반 테이블입니다.
 */

import { createColumnHelper } from '@tanstack/react-table';
import dayjs from 'dayjs';
import type React from 'react';
import tw from 'tailwind-styled-components';

import { Table } from '@/shared/components';
import type { RouterOutputs } from '@/shared/trpc';

/** 캠페인 뷰 모드 */
export type CampaignViewMode = 'campaign' | 'product';

/** 캠페인 테이블 데이터 타입 (API 응답에서 추론) */
export type CampaignTableData =
  RouterOutputs['backofficeCampaign']['findAll']['data'][number];

/** 상품별보기 테이블 데이터 타입 (API 응답에서 추론) */
export type ProductViewTableData =
  RouterOutputs['backofficeCampaign']['findAllByProduct']['data'][number];

interface CampaignTableProps {
  /** 뷰 모드 */
  viewMode: CampaignViewMode;
  /** 캠페인 데이터 */
  campaigns: CampaignTableData[];
  /** 상품별 데이터 */
  products?: ProductViewTableData[];
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
 *   products={products}
 *   onRowClick={handleRowClick}
 *   onSalesLinkClick={handleSalesLink}
 *   onEditClick={handleEdit}
 *   onDeleteClick={handleDelete}
 * />
 */
export function CampaignTable({
  viewMode,
  campaigns,
  products = [],
  onRowClick,
  onSalesLinkClick,
  onEditClick,
  onDeleteClick,
}: CampaignTableProps) {
  if (viewMode === 'product') {
    return <ProductViewTable products={products} />;
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
}: Omit<CampaignTableProps, 'viewMode' | 'products'>) {
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
      cell: (info) => {
        const { influencers } = info.row.original;
        if (influencers.length === 0) return '-';
        const names = influencers.map((inf) => inf.name);
        return names.length <= 2
          ? names.join(', ')
          : `${names[0]} 외 ${names.length - 1}명`;
      },
      size: 120,
    }),
    campaignColumnHelper.display({
      id: 'brand',
      header: '브랜드',
      cell: (info) => {
        const { brands } = info.row.original;
        if (brands.length === 0) return '-';
        const names = brands.map((b) => b.name);
        return names.length <= 2
          ? names.join(', ')
          : `${names[0]} 외 ${names.length - 1}개`;
      },
      size: 120,
    }),
    campaignColumnHelper.accessor('orderCount', {
      header: '주문수',
      cell: (info) => {
        const value = info.getValue();
        return value > 0 ? value.toLocaleString() : '-';
      },
      size: 80,
    }),
    campaignColumnHelper.accessor('revenue', {
      header: '매출',
      cell: (info) => {
        const value = info.getValue();
        return value > 0 ? formatPrice(value) : '-';
      },
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
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onSalesLinkClick?.(campaign);
              }}
            >
              매출 상세
            </ActionButton>
            <ActionButton
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onEditClick?.(campaign);
              }}
            >
              수정
            </ActionButton>
            <DeleteButton
              onClick={(e: React.MouseEvent) => {
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

/** 상품별보기 테이블 */
function ProductViewTable({ products }: { products: ProductViewTableData[] }) {
  const columns = [
    productColumnHelper.display({
      id: 'product',
      header: '상품',
      cell: (info) => {
        const { productName, productThumbnail } = info.row.original;
        return (
          <ProductCell>
            {productThumbnail ? (
              <ProductThumbnail src={productThumbnail} alt={productName} />
            ) : null}
            <span>{productName}</span>
          </ProductCell>
        );
      },
      size: 250,
    }),
    productColumnHelper.accessor('campaignTitle', {
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
    productColumnHelper.accessor('brandName', {
      header: '브랜드',
      size: 120,
    }),
    productColumnHelper.display({
      id: 'category',
      header: '카테고리',
      cell: (info) => info.row.original.categoryName ?? '-',
      size: 120,
    }),
    productColumnHelper.accessor('orderCount', {
      header: '주문수',
      cell: (info) => {
        const value = info.getValue();
        return value > 0 ? value.toLocaleString() : '-';
      },
      size: 80,
    }),
    productColumnHelper.accessor('revenue', {
      header: '매출',
      cell: (info) => {
        const value = info.getValue();
        return value > 0 ? formatPrice(value) : '-';
      },
      size: 100,
    }),
  ];

  return <Table columns={columns} data={products} />;
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

const ProductCell = tw.div`
  flex
  items-center
  gap-2
`;

const ProductThumbnail = tw.img`
  w-8
  h-8
  rounded
  object-cover
  flex-shrink-0
`;

/**
 * Product List Page - 상품 관리 페이지
 *
 * 등록된 상품들의 목록을 조회하고 관리하는 페이지입니다.
 * 상품 등록 버튼을 통해 새로운 상품을 추가할 수 있습니다.
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import { Suspense } from 'react';
import tw from 'tailwind-styled-components';

import { ProductList } from './_components/ProductList';

import { MajorPageLayout } from '@/components/layout';
import { ProductTypeTabs } from '@/components/product/ProductTypeTabs';
import { TableSkeleton } from '@/shared/components';

export const Route = createFileRoute('/_auth/product/hotel/')({
  component: ProductPage,
});

function ProductPage() {
  return (
    <MajorPageLayout
      title="상품 관리"
      description="등록된 상품을 조회하고 관리할 수 있습니다."
      headerActions={
        <CreateButton to="/product/hotel/create">새 상품 등록</CreateButton>
      }
    >
      <ProductTypeTabs basePath="product" />
      <Suspense fallback={<TableSkeleton columns={6} rows={5} />}>
        <ProductList />
      </Suspense>
    </MajorPageLayout>
  );
}

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
`;

/**
 * Usage:
 *
 * 상품 리스트 페이지는 Suspense 패턴으로 로딩 상태를 처리하며,
 * ProductList 컴포넌트에서 실제 데이터 조회 및 테이블 렌더링을 담당합니다.
 *
 * 라우트: /product/hotel
 */

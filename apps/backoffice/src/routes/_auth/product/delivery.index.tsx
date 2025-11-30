/**
 * Delivery Product List Page - 배송 상품 관리 페이지
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import { MajorPageLayout } from '@/components/layout';
import { ProductTypeTabs } from '@/components/product/ProductTypeTabs';
import { EmptyState } from '@/shared/components';

export const Route = createFileRoute('/_auth/product/delivery/')({
  component: DeliveryProductPage,
});

function DeliveryProductPage() {
  return (
    <MajorPageLayout
      title="상품 관리"
      description="등록된 배송 상품을 조회하고 관리할 수 있습니다."
      headerActions={
        <CreateButton to="/product/delivery/create">새 상품 등록</CreateButton>
      }
    >
      <ProductTypeTabs basePath="product" />
      <EmptyState
        icon={<InboxIcon />}
        title="등록된 배송 상품이 없습니다"
        description="새로운 배송 상품을 등록하여 판매를 시작하세요."
        action={
          <CreateButton to="/product/delivery/create">
            첫 상품 등록하기
          </CreateButton>
        }
      />
    </MajorPageLayout>
  );
}

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

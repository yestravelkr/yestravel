/**
 * Delivery Product Template List Page - 배송 품목 관리 페이지
 */

import { createFileRoute, Link } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { InboxIcon } from '@/components/icons';
import { MajorPageLayout } from '@/components/layout';
import { ProductTypeTabs } from '@/components/product/ProductTypeTabs';
import { EmptyState } from '@/shared/components';

export const Route = createFileRoute('/_auth/product-template/delivery/')({
  component: DeliveryProductTemplatePage,
});

function DeliveryProductTemplatePage() {
  return (
    <MajorPageLayout
      title="품목 관리"
      headerActions={
        <CreateButton to="/product-template/delivery/create">
          새 품목 등록
        </CreateButton>
      }
    >
      <ProductTypeTabs basePath="product-template" />
      <EmptyState
        icon={<InboxIcon />}
        title="등록된 배송 품목이 없습니다"
        description="새로운 배송 품목을 등록하여 관리를 시작하세요."
        action={
          <CreateButton to="/product-template/delivery/create">
            첫 품목 등록하기
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

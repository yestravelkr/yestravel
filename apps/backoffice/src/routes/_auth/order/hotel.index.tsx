import { createFileRoute } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

import { MajorPageLayout } from '@/components/layout';

export const Route = createFileRoute('/_auth/order/hotel/')({
  component: HotelOrderListPage,
});

function HotelOrderListPage() {
  return (
    <MajorPageLayout title="숙박 주문 관리">
      <EmptyContainer>
        <EmptyText>숙박 주문 목록이 여기에 표시됩니다.</EmptyText>
      </EmptyContainer>
    </MajorPageLayout>
  );
}

const EmptyContainer = tw.div`
  flex
  items-center
  justify-center
  h-64
  text-gray-500
`;

const EmptyText = tw.p`
  text-lg
`;

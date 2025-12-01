/**
 * E-Ticket Product Template Create Page - 티켓 품목 등록 페이지
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system';
import { Ticket } from 'lucide-react';
import tw from 'tailwind-styled-components';

import { MajorPageLayout } from '@/components/layout';
import { ProductTypeTabs } from '@/components/product/ProductTypeTabs';

export const Route = createFileRoute('/_auth/product-template/eticket/create')({
  component: CreateETicketProductTemplatePage,
});

function CreateETicketProductTemplatePage() {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate({ to: '/product-template/eticket' });
  };

  return (
    <MajorPageLayout
      title="새 티켓 품목 등록"
      description="새로운 티켓 품목을 등록합니다."
      headerActions={
        <Button kind="neutral" variant="outline" onClick={handleCancel}>
          취소
        </Button>
      }
    >
      <ProductTypeTabs basePath="product-template" />
      <CardContent>
        <EmptyMessage>
          <EmptyIconWrapper>
            <Ticket size={48} />
          </EmptyIconWrapper>
          <EmptyTitle>티켓 품목 등록 폼 준비 중</EmptyTitle>
          <EmptyDescription>
            티켓 품목 등록 기능은 준비 중입니다.
          </EmptyDescription>
        </EmptyMessage>
      </CardContent>
    </MajorPageLayout>
  );
}

const CardContent = tw.div`
  bg-white
  rounded-lg
  shadow-sm
  border
  border-gray-200
  p-8
`;

const EmptyMessage = tw.div`
  flex
  flex-col
  items-center
  justify-center
  py-12
  text-center
`;

const EmptyIconWrapper = tw.div`
  text-gray-400
  mb-4
`;

const EmptyTitle = tw.h2`
  text-xl
  font-semibold
  text-gray-900
  mb-2
`;

const EmptyDescription = tw.p`
  text-gray-600
`;

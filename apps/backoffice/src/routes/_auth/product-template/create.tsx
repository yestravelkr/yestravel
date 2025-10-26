import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system/button';
import { type FormEvent, useState } from 'react';

import { BasicInfoCard } from './_components/create/BasicInfoCard';
import { ProductTemplateAssociationCard } from './_components/create/ProductTemplateAssociationCard';
import { ProductTemplateDetailInfoCard } from './_components/create/ProductTemplateDetailInfoCard';
import { ProductTemplateDetailPageCard } from './_components/create/ProductTemplateDetailPageCard';
import {
  CancelButton,
  Form,
  FormActions,
  FormColumns,
  FormContainer,
  LeftColumn,
  RightColumn,
  SecondaryButton,
} from './_components/create/styled';

import { MajorPageLayout } from '@/components/layout';
import { Toast, ToastsContainer } from '@/shared/components/toast/Toast';
import { useToast } from '@/shared/hooks';
import { trpc } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/product-template/create')({
  component: CreateProductTemplatePage,
});

function CreateProductTemplatePage() {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error } = useToast();
  const createMutation = trpc.backofficeProductTemplate.create.useMutation();

  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const handleCancel = () => {
    navigate({ to: '/product-template' });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      // HOTEL 타입 품목 생성 (임의의 데이터)
      await createMutation.mutateAsync({
        type: 'HOTEL',
        name: '테스트 호텔 상품',
        brandId: 1, // 임의의 브랜드 ID
        thumbnailUrls: thumbnails,
        description: '테스트 설명입니다.',
        detailContent: '<p>테스트 상세 내용입니다.</p>',
        useStock: false,
        baseCapacity: 2,
        maxCapacity: 4,
        checkInTime: '15:00',
        checkOutTime: '11:00',
        bedTypes: ['퀸베드 1개'],
        tags: ['바다 전망', '조식 포함'],
      });

      success('품목이 성공적으로 등록되었습니다.');
      setTimeout(() => {
        navigate({ to: '/product-template' });
      }, 1000);
    } catch (err) {
      console.error('품목 등록 실패:', err);
      error('품목 등록에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleAddThumbnail = (url: string) => {
    setThumbnails((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const handleRemoveThumbnail = (target: string) => {
    setThumbnails((prev) => prev.filter((item) => item !== target));
  };

  return (
    <>
      <MajorPageLayout
        title="새 품목 등록"
        description="새로운 품목을 등록하여 관리를 시작하세요."
        headerActions={<CancelButton to="/product-template">취소</CancelButton>}
      >
        <FormContainer>
          <Form onSubmit={handleSubmit}>
            <FormColumns>
              <LeftColumn>
                <BasicInfoCard
                  thumbnails={thumbnails}
                  onAddThumbnail={handleAddThumbnail}
                  onRemoveThumbnail={handleRemoveThumbnail}
                />
                <ProductTemplateAssociationCard />
                <ProductTemplateDetailInfoCard />
              </LeftColumn>

              <RightColumn>
                <ProductTemplateDetailPageCard />
              </RightColumn>
            </FormColumns>

            <FormActions>
              <SecondaryButton type="button" onClick={handleCancel}>
                취소
              </SecondaryButton>
              <Button
                type="submit"
                kind="primary"
                variant="solid"
                size="large"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? '등록 중...' : '품목 등록'}
              </Button>
            </FormActions>
          </Form>
        </FormContainer>
      </MajorPageLayout>

      <ToastsContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </ToastsContainer>
    </>
  );
}

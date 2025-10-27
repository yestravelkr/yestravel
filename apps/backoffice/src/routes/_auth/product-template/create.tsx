import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system/button';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

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

// React Hook Form용 타입 정의
interface HotelTemplateFormData {
  name: string;
  description: string;
  brandId: number;
  baseCapacity: number;
  maxCapacity: number;
  checkInTime: string;
  checkOutTime: string;
  bedTypes: string[];
  tags: string[];
  detailContent: string;
  useStock: boolean;
  thumbnailUrls: string[];
}

function CreateProductTemplatePage() {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error } = useToast();
  const createMutation = trpc.backofficeProductTemplate.create.useMutation();

  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<HotelTemplateFormData>({
    defaultValues: {
      name: '',
      description: '',
      brandId: 0,
      baseCapacity: 2,
      maxCapacity: 4,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      bedTypes: [],
      tags: [],
      detailContent: '',
      useStock: false,
      thumbnailUrls: [],
    },
  });

  const handleCancel = () => {
    navigate({ to: '/product-template' });
  };

  const onSubmit = async (formData: HotelTemplateFormData) => {
    console.log(formData);
    try {
      // HOTEL 타입 품목 생성
      await createMutation.mutateAsync({
        type: 'HOTEL',
        name: formData.name,
        brandId: formData.brandId,
        thumbnailUrls: thumbnails, // 썸네일은 별도 상태로 관리
        description: formData.description,
        detailContent: formData.detailContent,
        useStock: formData.useStock,
        baseCapacity: formData.baseCapacity,
        maxCapacity: formData.maxCapacity,
        checkInTime: formData.checkInTime,
        checkOutTime: formData.checkOutTime,
        bedTypes: formData.bedTypes,
        tags: formData.tags,
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
          <Form onSubmit={handleSubmit(onSubmit)}>
            <FormColumns>
              <LeftColumn>
                <BasicInfoCard
                  thumbnails={thumbnails}
                  onAddThumbnail={handleAddThumbnail}
                  onRemoveThumbnail={handleRemoveThumbnail}
                  register={register}
                />
                <ProductTemplateAssociationCard register={register} />
                <ProductTemplateDetailInfoCard
                  register={register}
                  setValue={setValue}
                  watch={watch}
                />
              </LeftColumn>

              <RightColumn>
                <ProductTemplateDetailPageCard
                  setValue={setValue}
                  watch={watch}
                />
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
                disabled={createMutation.isPending || isSubmitting}
              >
                {createMutation.isPending || isSubmitting
                  ? '등록 중...'
                  : '품목 등록'}
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

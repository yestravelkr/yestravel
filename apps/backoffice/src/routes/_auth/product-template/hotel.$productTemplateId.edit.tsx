import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system/button';
import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

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

export const Route = createFileRoute(
  '/_auth/product-template/hotel/$productTemplateId/edit',
)({
  component: EditProductTemplatePage,
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

function EditProductTemplatePage() {
  const navigate = useNavigate();
  const { productTemplateId } = Route.useParams();
  const { toasts, removeToast, success, error } = useToast();

  // 품목 템플릿 상세 조회
  const { data: productTemplate, isLoading } =
    trpc.backofficeProductTemplate.findById.useQuery({
      id: Number(productTemplateId),
    });

  // 품목 템플릿 수정 mutation
  const updateMutation = trpc.backofficeProductTemplate.update.useMutation();

  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const methods = useForm<HotelTemplateFormData>({
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

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
    reset,
  } = methods;

  // 데이터 로드 후 폼에 설정
  useEffect(() => {
    if (productTemplate && productTemplate.type === 'HOTEL') {
      reset({
        name: productTemplate.name,
        description: productTemplate.description,
        brandId: productTemplate.brandId,
        baseCapacity: productTemplate.baseCapacity,
        maxCapacity: productTemplate.maxCapacity,
        checkInTime: productTemplate.checkInTime,
        checkOutTime: productTemplate.checkOutTime,
        bedTypes: productTemplate.bedTypes,
        tags: productTemplate.tags,
        detailContent: productTemplate.detailContent,
        useStock: productTemplate.useStock,
        thumbnailUrls: productTemplate.thumbnailUrls,
      });
      setThumbnails(productTemplate.thumbnailUrls);
    }
  }, [productTemplate, reset]);

  const handleCancel = () => {
    navigate({ to: '/product-template' });
  };

  const onSubmit = async (formData: HotelTemplateFormData) => {
    try {
      await updateMutation.mutateAsync({
        id: Number(productTemplateId),
        name: formData.name,
        brandId: formData.brandId,
        categoryIds: [],
        thumbnailUrls: thumbnails,
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

      success('품목이 성공적으로 수정되었습니다.');
      setTimeout(() => {
        navigate({ to: '/product-template' });
      }, 1000);
    } catch (err) {
      console.error('품목 수정 실패:', err);
      error('품목 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleAddThumbnail = (url: string) => {
    setThumbnails((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const handleRemoveThumbnail = (target: string) => {
    setThumbnails((prev) => prev.filter((item) => item !== target));
  };

  if (isLoading) {
    return (
      <MajorPageLayout
        title="품목 수정"
        description="품목 정보를 불러오는 중..."
      >
        <div>로딩 중...</div>
      </MajorPageLayout>
    );
  }

  if (!productTemplate) {
    return (
      <MajorPageLayout title="품목 수정" description="품목을 찾을 수 없습니다.">
        <div>품목을 찾을 수 없습니다.</div>
      </MajorPageLayout>
    );
  }

  if (productTemplate.type !== 'HOTEL') {
    return (
      <MajorPageLayout
        title="품목 수정"
        description="현재 HOTEL 타입만 수정 가능합니다."
      >
        <div>현재 HOTEL 타입만 수정 가능합니다.</div>
      </MajorPageLayout>
    );
  }

  return (
    <>
      <MajorPageLayout
        title="품목 수정"
        description="품목 정보를 수정합니다."
        headerActions={<CancelButton to="/product-template">취소</CancelButton>}
      >
        <FormContainer>
          <FormProvider {...methods}>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormColumns>
                <LeftColumn>
                  <BasicInfoCard
                    thumbnails={thumbnails}
                    onAddThumbnail={handleAddThumbnail}
                    onRemoveThumbnail={handleRemoveThumbnail}
                    register={register}
                  />
                  <ProductTemplateAssociationCard />
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
                  disabled={updateMutation.isPending || isSubmitting}
                >
                  {updateMutation.isPending || isSubmitting
                    ? '수정 중...'
                    : '품목 수정'}
                </Button>
              </FormActions>
            </Form>
          </FormProvider>
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

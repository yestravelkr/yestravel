/**
 * Product Create Page - 상품 등록 페이지
 *
 * ProductTemplate과 동일한 폼 구조를 사용합니다.
 * - 기본 정보 (썸네일, 상품명, 설명)
 * - 상품 구분 (브랜드, 연결된 품목)
 * - 상세 정보 (기준/최대 인원, 입/퇴실 시간, 침대 구성, 태그)
 * - 상세 페이지 (리치 텍스트 에디터)
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system';
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { BasicInfoCard } from '../product-template/_components/create/BasicInfoCard';
import { ProductTemplateAssociationCard } from '../product-template/_components/create/ProductTemplateAssociationCard';
import { ProductTemplateDetailInfoCard } from '../product-template/_components/create/ProductTemplateDetailInfoCard';
import { ProductTemplateDetailPageCard } from '../product-template/_components/create/ProductTemplateDetailPageCard';
import {
  Form,
  FormActions,
  FormColumns,
  FormContainer,
  LeftColumn,
  RightColumn,
} from '../product-template/_components/create/styled';

import { ProductOptionsPricingCard } from './_components/create/ProductOptionsPricingCard';

import { MajorPageLayout } from '@/components/layout';
import { openLoadProductTemplateModal } from '@/components/product/LoadProductTemplateModal';
import { trpc, trpcClient } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/product/create')({
  component: CreateProductPage,
});

// React Hook Form용 타입 정의
interface ProductFormData {
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
  hotelOptions: Array<{
    id: number;
    name: string;
    priceByDate: Record<string, number>;
    optionId?: number;
    anotherPriceByDate?: Record<
      string,
      { supplyPrice: number; commission: number }
    >;
  }>;
}

function CreateProductPage() {
  const navigate = useNavigate();
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const methods = useForm<ProductFormData>({
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
      hotelOptions: [],
    },
  });

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = methods;

  const handleCancel = () => {
    navigate({ to: '/product' });
  };

  const onSubmit = async (formData: ProductFormData) => {
    // TODO: 실제 상품 생성 API 연결
    console.log('상품 생성 처리', formData);
  };

  const handleAddThumbnail = (url: string) => {
    setThumbnails((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const handleRemoveThumbnail = (target: string) => {
    setThumbnails((prev) => prev.filter((item) => item !== target));
  };

  const handleImportProduct = () => {
    openLoadProductTemplateModal()
      .then((templateId) => {
        if (!templateId) return;

        return trpcClient.backofficeProductTemplate.findById.query({
          id: templateId,
        });
      })
      .then((templateData) => {
        if (!templateData) return;
        if (templateData.type !== 'HOTEL') return;

        // 품목 데이터를 폼에 채우기
        setValue('name', templateData.name);
        setValue('description', templateData.description);
        setValue('brandId', templateData.brandId);
        setValue('thumbnailUrls', templateData.thumbnailUrls);
        setValue('detailContent', templateData.detailContent);
        setValue('useStock', templateData.useStock);
        setValue('baseCapacity', templateData.baseCapacity);
        setValue('maxCapacity', templateData.maxCapacity);
        setValue('checkInTime', templateData.checkInTime);
        setValue('checkOutTime', templateData.checkOutTime);
        setValue('bedTypes', templateData.bedTypes);
        setValue('tags', templateData.tags);

        // 썸네일 상태도 업데이트
        setThumbnails(templateData.thumbnailUrls);
      })
      .catch((error) => {
        console.error('품목 데이터 로드 실패:', error);
        alert('품목 데이터를 불러오는데 실패했습니다.');
      });
  };

  return (
    <MajorPageLayout
      title="새 상품 등록"
      description="새로운 상품을 등록하여 판매를 시작하세요."
      headerActions={
        <>
          <Button
            kind="neutral"
            variant="outline"
            onClick={handleImportProduct}
          >
            품목 불러오기
          </Button>
          <Button kind="neutral" variant="outline" onClick={handleCancel}>
            취소
          </Button>
        </>
      }
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
                <ProductOptionsPricingCard />
              </LeftColumn>

              <RightColumn>
                <ProductTemplateDetailPageCard
                  setValue={setValue}
                  watch={watch}
                />
              </RightColumn>
            </FormColumns>

            <FormActions>
              <Button
                type="button"
                kind="neutral"
                variant="outline"
                size="large"
                onClick={handleCancel}
              >
                취소
              </Button>
              <Button
                type="submit"
                kind="primary"
                variant="solid"
                size="large"
                disabled={isSubmitting}
              >
                {isSubmitting ? '등록 중...' : '상품 등록'}
              </Button>
            </FormActions>
          </Form>
        </FormProvider>
      </FormContainer>
    </MajorPageLayout>
  );
}

/**
 * Usage:
 *
 * Product 등록 페이지는 ProductTemplate과 동일한 구조를 사용합니다.
 * (판매 정보는 추후 추가 예정)
 *
 * 라우트: /product/create
 */

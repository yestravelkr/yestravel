/**
 * ProductForm - 상품 생성/수정 공통 폼 컴포넌트
 *
 * Create와 Edit 페이지에서 공통으로 사용되는 폼 컴포넌트입니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import { BasicInfoCard } from '../../../product-template/_components/create/BasicInfoCard';
import { ProductTemplateAssociationCard } from '../../../product-template/_components/create/ProductTemplateAssociationCard';
import { ProductTemplateDetailInfoCard } from '../../../product-template/_components/create/ProductTemplateDetailInfoCard';
import { ProductTemplateDetailPageCard } from '../../../product-template/_components/create/ProductTemplateDetailPageCard';
import {
  Form,
  FormActions,
  FormColumns,
  FormContainer,
  LeftColumn,
  RightColumn,
} from '../../../product-template/_components/create/styled';

import { ProductOptionsPricingCard } from './ProductOptionsPricingCard';

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

interface ProductFormProps {
  /** React Hook Form methods */
  methods: UseFormReturn<ProductFormData>;
  /** 폼 제출 핸들러 */
  onSubmit: (data: ProductFormData) => void | Promise<void>;
  /** 취소 버튼 클릭 핸들러 */
  onCancel: () => void;
  /** 썸네일 URL 목록 */
  thumbnails: string[];
  /** 썸네일 추가 핸들러 */
  onAddThumbnail: (url: string) => void;
  /** 썸네일 제거 핸들러 */
  onRemoveThumbnail: (url: string) => void;
  /** 제출 버튼 텍스트 (기본: '상품 등록') */
  submitButtonText?: string;
  /** 제출 중 여부 */
  isSubmitting?: boolean;
}

export function ProductForm({
  methods,
  onSubmit,
  onCancel,
  thumbnails,
  onAddThumbnail,
  onRemoveThumbnail,
  submitButtonText = '상품 등록',
  isSubmitting = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting: formIsSubmitting },
    setValue,
    watch,
  } = methods;

  const submitting = isSubmitting || formIsSubmitting;

  return (
    <FormContainer>
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormColumns>
            <LeftColumn>
              <BasicInfoCard
                thumbnails={thumbnails}
                onAddThumbnail={onAddThumbnail}
                onRemoveThumbnail={onRemoveThumbnail}
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
              onClick={onCancel}
            >
              취소
            </Button>
            <Button
              type="submit"
              kind="primary"
              variant="solid"
              size="large"
              disabled={submitting}
            >
              {submitting ? '처리 중...' : submitButtonText}
            </Button>
          </FormActions>
        </Form>
      </FormProvider>
    </FormContainer>
  );
}

/**
 * Usage:
 *
 * // Create 페이지
 * <ProductForm
 *   methods={methods}
 *   onSubmit={handleCreate}
 *   onCancel={handleCancel}
 *   thumbnails={thumbnails}
 *   onAddThumbnail={handleAddThumbnail}
 *   onRemoveThumbnail={handleRemoveThumbnail}
 *   submitButtonText="상품 등록"
 * />
 *
 * // Edit 페이지
 * <ProductForm
 *   methods={methods}
 *   onSubmit={handleUpdate}
 *   onCancel={handleCancel}
 *   thumbnails={thumbnails}
 *   onAddThumbnail={handleAddThumbnail}
 *   onRemoveThumbnail={handleRemoveThumbnail}
 *   submitButtonText="상품 수정"
 *   isSubmitting={updateMutation.isPending}
 * />
 */

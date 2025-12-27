/**
 * Product Create Page - 상품 등록 페이지
 *
 * ProductTemplate과 동일한 폼 구조를 사용합니다.
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ProductForm } from './_components/create/ProductForm';

import { MajorPageLayout } from '@/components/layout';
import { openLoadProductTemplateModal } from '@/components/product/LoadProductTemplateModal';
import { trpc, trpcClient } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/product/hotel/create')({
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
    id?: number;
    name: string;
    priceByDate: Record<string, number>;
    anotherPriceByDate?: Record<
      string,
      { supplyPrice: number; commission: number }
    >;
  }>;
  hotelSkus: Array<{
    checkInDate: string;
    quantity: number;
  }>;
}

function CreateProductPage() {
  const navigate = useNavigate();
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const createProductMutation = trpc.backofficeProduct.create.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      navigate({ to: '/product/hotel' });
    },
    onError: (error) => {
      toast.error(error.message || '상품 생성에 실패했습니다.');
    },
  });

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
      hotelSkus: [],
    },
  });

  const { setValue } = methods;

  const handleCancel = () => {
    navigate({ to: '/product/hotel' });
  };

  const onSubmit = async (formData: ProductFormData) => {
    await createProductMutation.mutateAsync({
      type: 'HOTEL',
      name: formData.name,
      brandId: formData.brandId,
      productTemplateId: undefined,
      campaignId: undefined,
      categoryIds: [],
      thumbnailUrls: thumbnails,
      description: formData.description,
      detailContent: formData.detailContent,
      useCalendar: true,
      useStock: formData.useStock,
      useOptions: formData.hotelOptions.length > 0,
      price:
        formData.hotelOptions.length > 0
          ? Math.min(
              ...formData.hotelOptions.map((opt) =>
                Math.min(...Object.values(opt.priceByDate)),
              ),
            )
          : 0,
      status: 'VISIBLE',
      displayOrder: undefined,
      baseCapacity: formData.baseCapacity,
      maxCapacity: formData.maxCapacity,
      checkInTime: formData.checkInTime,
      checkOutTime: formData.checkOutTime,
      bedTypes: formData.bedTypes,
      tags: formData.tags,
      hotelOptions: formData.hotelOptions,
      hotelSkus: formData.hotelSkus,
    });
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
        setThumbnails(templateData.thumbnailUrls);
      })
      .catch((error) => {
        console.error('품목 데이터 로드 실패:', error);
        toast.error('품목 데이터를 불러오는데 실패했습니다.');
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
      <ProductForm
        methods={methods}
        onSubmit={onSubmit}
        onCancel={handleCancel}
        thumbnails={thumbnails}
        onAddThumbnail={handleAddThumbnail}
        onRemoveThumbnail={handleRemoveThumbnail}
        submitButtonText="상품 등록"
        isSubmitting={createProductMutation.isPending}
      />
    </MajorPageLayout>
  );
}

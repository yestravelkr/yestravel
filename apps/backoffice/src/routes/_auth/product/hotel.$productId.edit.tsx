/**
 * Product Edit Page - 상품 수정 페이지
 *
 * ProductTemplate과 동일한 폼 구조를 사용합니다.
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@yestravelkr/min-design-system';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ProductForm } from './_components/create/ProductForm';

import { MajorPageLayout } from '@/components/layout';
import { trpc } from '@/shared/trpc';

export const Route = createFileRoute('/_auth/product/hotel/$productId/edit')({
  component: EditProductPage,
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

function EditProductPage() {
  const navigate = useNavigate();
  const { productId } = Route.useParams();
  const [thumbnails, setThumbnails] = useState<string[]>([]);

  const { data: product, isLoading } = trpc.backofficeProduct.findById.useQuery(
    {
      id: Number(productId),
    },
  );

  const updateProductMutation = trpc.backofficeProduct.update.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      navigate({ to: '/product/hotel' });
    },
    onError: (error) => {
      toast.error(error.message || '상품 수정에 실패했습니다.');
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
    },
  });

  const { reset } = methods;

  useEffect(() => {
    if (product && product.type === 'HOTEL') {
      reset({
        name: product.name,
        description: product.description,
        brandId: product.brandId,
        baseCapacity: product.baseCapacity,
        maxCapacity: product.maxCapacity,
        checkInTime: product.checkInTime,
        checkOutTime: product.checkOutTime,
        bedTypes: product.bedTypes,
        tags: product.tags,
        detailContent: product.detailContent,
        useStock: product.useStock,
        thumbnailUrls: product.thumbnailUrls,
        hotelOptions: [],
      });
      setThumbnails(product.thumbnailUrls);
    }
  }, [product, reset]);

  const handleCancel = () => {
    navigate({ to: '/product/hotel' });
  };

  const onSubmit = async (formData: ProductFormData) => {
    await updateProductMutation.mutateAsync({
      id: Number(productId),
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
    });
  };

  const handleAddThumbnail = (url: string) => {
    setThumbnails((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const handleRemoveThumbnail = (target: string) => {
    setThumbnails((prev) => prev.filter((item) => item !== target));
  };

  if (isLoading) {
    return (
      <MajorPageLayout title="상품 수정" description="상품 정보를 수정합니다.">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </MajorPageLayout>
    );
  }

  if (!product) {
    return (
      <MajorPageLayout title="상품 수정" description="상품 정보를 수정합니다.">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">상품을 찾을 수 없습니다.</div>
        </div>
      </MajorPageLayout>
    );
  }

  return (
    <MajorPageLayout
      title="상품 수정"
      description="상품 정보를 수정합니다."
      headerActions={
        <Button kind="neutral" variant="outline" onClick={handleCancel}>
          취소
        </Button>
      }
    >
      <ProductForm
        methods={methods}
        onSubmit={onSubmit}
        onCancel={handleCancel}
        thumbnails={thumbnails}
        onAddThumbnail={handleAddThumbnail}
        onRemoveThumbnail={handleRemoveThumbnail}
        submitButtonText="상품 수정"
        isSubmitting={updateProductMutation.isPending}
      />
    </MajorPageLayout>
  );
}

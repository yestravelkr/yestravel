/**
 * CampaignProductSection - 캠페인 상품 섹션
 *
 * 캠페인에 포함될 상품 목록을 관리하는 섹션입니다.
 * allProducts를 Map으로 변환하여 formProducts의 id로 데이터를 조회합니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { Control, useWatch } from 'react-hook-form';
import { UseFormSetValue } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import type {
  CampaignFormData,
  CampaignProductDisplay,
  CampaignProductFormData,
} from './types';

import { openProductSelectModal } from '@/components/campaign/ProductSelectModal';
import { Select } from '@/shared/components';
import { trpc } from '@/shared/trpc';

interface CampaignProductSectionProps {
  control: Control<CampaignFormData>;
  setValue: UseFormSetValue<CampaignFormData>;
}

export function CampaignProductSection({
  control,
  setValue,
}: CampaignProductSectionProps) {
  // hookForm에 저장된 간소화된 데이터 감시
  const formProducts = useWatch({
    control,
    name: 'products',
    defaultValue: [],
  });

  // 상품 리스트 조회
  const { data: allProducts } = trpc.backofficeProduct.findAll.useQuery({
    page: 1,
    limit: 100,
  });

  // allProducts를 id를 key로 하는 Map으로 변환
  const productsMap: Map<
    number,
    {
      id: number;
      name: string;
      brand: string;
      category: string;
    }
  > = useMemo(() => {
    if (!allProducts) return new Map();

    return new Map(
      allProducts.data.map((product) => [
        product.id,
        {
          id: product.id,
          name: product.name,
          brand: product.brand.name,
          category: '카테고리 미구현',
        },
      ]),
    );
  }, [allProducts]);

  // formProducts와 productsMap을 조합하여 화면 표시용 데이터 생성
  const displayProducts = useMemo(() => {
    return formProducts
      .map((formProduct) => {
        const productInfo = productsMap.get(formProduct.id);
        if (!productInfo) return null;

        return {
          ...productInfo,
          status: formProduct.status,
        } as CampaignProductDisplay;
      })
      .filter((product): product is CampaignProductDisplay => product !== null);
  }, [formProducts, productsMap]);

  const handleAddProduct = async () => {
    const currentProductIds = formProducts.map((product) => product.id);
    const selectedIds = await openProductSelectModal(currentProductIds);

    if (selectedIds) {
      // 선택한 ID로 formData 생성
      const newFormData: CampaignProductFormData[] = selectedIds.map((id) => ({
        id,
        status: 'ACTIVE' as const,
      }));

      setValue('products', newFormData, { shouldValidate: true });
    }
  };

  const handleStatusChange = (
    index: number,
    newStatus: 'ACTIVE' | 'INACTIVE',
  ) => {
    const updatedForm = [...formProducts];
    updatedForm[index] = {
      ...updatedForm[index],
      status: newStatus,
    };
    setValue('products', updatedForm, { shouldValidate: true });
  };

  const handleRemoveProduct = (index: number) => {
    const updatedForm = formProducts.filter((_, i) => i !== index);
    setValue('products', updatedForm, { shouldValidate: true });
  };

  const statusOptions = [
    { value: 'ACTIVE', label: '활성' },
    { value: 'INACTIVE', label: '비활성' },
  ];

  return (
    <FormSection>
      <SectionHeader>
        <SectionTitle>상품</SectionTitle>
        <Button
          type="button"
          onClick={handleAddProduct}
          kind="primary"
          size="medium"
          leadingIcon={<Plus size={16} />}
        >
          상품 추가
        </Button>
      </SectionHeader>
      <SectionContent>
        {displayProducts.length === 0 ? (
          <EmptyMessage>추가된 상품이 없습니다.</EmptyMessage>
        ) : (
          <ProductList>
            {displayProducts.map((product, index) => (
              <ProductItem key={product.id}>
                <ProductInfo>
                  <ProductField>
                    <FieldLabel>상품명</FieldLabel>
                    <FieldValue>{product.name}</FieldValue>
                  </ProductField>
                  <ProductField>
                    <FieldLabel>브랜드</FieldLabel>
                    <FieldValue>{product.brand}</FieldValue>
                  </ProductField>
                  <ProductField>
                    <FieldLabel>카테고리</FieldLabel>
                    <FieldValue>{product.category}</FieldValue>
                  </ProductField>
                  <ProductField>
                    <FieldLabel>상태</FieldLabel>
                    <Select
                      value={product.status}
                      onChange={(e) =>
                        handleStatusChange(
                          index,
                          e.target.value as 'ACTIVE' | 'INACTIVE',
                        )
                      }
                      options={statusOptions}
                    />
                  </ProductField>
                  <ProductField>
                    <FieldLabel>&nbsp;</FieldLabel>
                    <RemoveButton
                      type="button"
                      onClick={() => handleRemoveProduct(index)}
                      kind="critical"
                      variant="outline"
                      size="small"
                    >
                      삭제
                    </RemoveButton>
                  </ProductField>
                </ProductInfo>
              </ProductItem>
            ))}
          </ProductList>
        )}
      </SectionContent>
    </FormSection>
  );
}

const FormSection = tw.div`
  bg-white
  rounded-lg
  border
  border-[var(--stroke-neutral)]
  overflow-hidden
`;

const SectionHeader = tw.div`
  px-6
  py-4
  border-b
  border-[var(--stroke-neutral)]
  flex
  justify-between
  items-center
`;

const SectionTitle = tw.h2`
  text-base
  font-semibold
  text-[var(--fg-neutral)]
`;

const SectionContent = tw.div`
  p-0
`;

const EmptyMessage = tw.div`
  text-center
  py-12
  text-[var(--fg-muted)]
  text-sm
`;

const ProductList = tw.div`
  flex
  flex-col
  gap-3
`;

const ProductItem = tw.div`
  rounded-lg
  p-4
  bg-[var(--bg-layer)]
`;

const ProductInfo = tw.div`
  grid
  grid-cols-2
  md:grid-cols-5
  gap-4
`;

const ProductField = tw.div`
  flex
  flex-col
  gap-1
`;

const FieldLabel = tw.span`
  text-xs
  font-medium
  text-[var(--fg-muted)]
`;

const FieldValue = tw.span`
  text-sm
  text-[var(--fg-neutral)]
`;

const RemoveButton = tw(Button)`
  
`;

/**
 * Usage:
 *
 * <CampaignProductSection control={control} />
 */

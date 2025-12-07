/**
 * CampaignProductSection - 캠페인 상품 섹션
 *
 * 캠페인에 포함될 상품 목록을 관리하는 섹션입니다.
 */

import { Button } from '@yestravelkr/min-design-system';
import { Plus, X } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import type { CampaignFormData, CampaignProduct } from './types';

import { Select } from '@/shared/components';

interface CampaignProductSectionProps {
  control: Control<CampaignFormData>;
}

export function CampaignProductSection({
  control,
}: CampaignProductSectionProps) {
  const handleAddProduct = async () => {
    // TODO: 상품 선택 모달 열기
    toast.info('상품 선택 모달 구현 예정');
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
        <Controller
          name="products"
          control={control}
          rules={{
            validate: (value) =>
              value.length > 0 || '최소 1개 이상의 상품을 추가해주세요',
          }}
          render={({ field }) => (
            <>
              {field.value.length === 0 ? (
                <EmptyMessage>추가된 상품이 없습니다.</EmptyMessage>
              ) : (
                <ProductList>
                  {field.value.map((product, index) => (
                    <ProductItem key={product.id}>
                      <ProductInfo>
                        <ProductField>
                          <FieldLabel>상품명</FieldLabel>
                          <FieldValue>{product.name}</FieldValue>
                        </ProductField>
                        <ProductField>
                          <FieldLabel>브랜드</FieldLabel>
                          <FieldValue>{product.brandName}</FieldValue>
                        </ProductField>
                        <ProductField>
                          <FieldLabel>카테고리</FieldLabel>
                          <FieldValue>{product.category}</FieldValue>
                        </ProductField>
                        <ProductField>
                          <FieldLabel>상태</FieldLabel>
                          <Select
                            value={product.status}
                            onChange={(e) => {
                              const newProducts = [...field.value];
                              newProducts[index] = {
                                ...newProducts[index],
                                status: e.target.value as 'ACTIVE' | 'INACTIVE',
                              };
                              field.onChange(newProducts);
                            }}
                            options={statusOptions}
                          />
                        </ProductField>
                      </ProductInfo>
                      <RemoveButton
                        type="button"
                        onClick={() => {
                          const newProducts = field.value.filter(
                            (_, i) => i !== index,
                          );
                          field.onChange(newProducts);
                        }}
                      >
                        <X size={16} />
                      </RemoveButton>
                    </ProductItem>
                  ))}
                </ProductList>
              )}
            </>
          )}
        />
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
  p-6
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
  border
  border-[var(--stroke-neutral)]
  rounded-lg
  p-4
  flex
  items-start
  justify-between
  gap-4
  bg-[var(--bg-layer)]
`;

const ProductInfo = tw.div`
  flex-1
  grid
  grid-cols-2
  md:grid-cols-4
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

const RemoveButton = tw.button`
  p-2
  text-[var(--fg-muted)]
  hover:text-red-600
  hover:bg-red-50
  rounded
  transition-colors
  flex-shrink-0
`;

/**
 * Usage:
 *
 * <CampaignProductSection control={control} />
 */

/**
 * CampaignProductSection - 캠페인 상품 섹션
 *
 * 캠페인에 포함될 상품 목록을 관리하는 섹션입니다.
 * allProducts를 Map으로 변환하여 formProducts의 id로 데이터를 조회합니다.
 */

import {
  Button,
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
} from '@yestravelkr/min-design-system';
import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import tw from 'tailwind-styled-components';

import type {
  CampaignFormData,
  CampaignProductDisplay,
  CampaignProductFormData,
} from './types';

import { openProductSelectModal } from '@/components/campaign/ProductSelectModal';
import { Select } from '@/shared/components';
import { trpc } from '@/shared/trpc';

export function CampaignProductSection() {
  const { control, setValue } = useFormContext<CampaignFormData>();

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
  const productsMap = useMemo(() => {
    if (!allProducts) return new Map();

    return new Map(
      allProducts.data.map((product) => [
        product.id,
        {
          id: product.id,
          name: product.name,
          brand: product.brand.name,
          category: product.type || '-',
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
      // 기존 상품 상태를 유지하면서 새 상품 추가
      const mergedFormData: CampaignProductFormData[] = selectedIds.map(
        (id) => {
          const existing = formProducts.find((product) => product.id === id);
          return existing ? existing : { id, status: 'ACTIVE' as const };
        },
      );

      setValue('products', mergedFormData, { shouldValidate: true });
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
          <TableContainer>
            <Table>
              <THead>
                <TR>
                  <TH>상품명</TH>
                  <TH>브랜드</TH>
                  <TH>카테고리</TH>
                  <TH>상태</TH>
                  <TH>&nbsp;</TH>
                </TR>
              </THead>
              <TBody>
                {displayProducts.map((product, index) => (
                  <TR key={product.id}>
                    <TD>{product.name}</TD>
                    <TD>{product.brand}</TD>
                    <TD>{product.category}</TD>
                    <TD>
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
                    </TD>
                    <TD>
                      <RemoveButton
                        type="button"
                        onClick={() => handleRemoveProduct(index)}
                        kind="critical"
                        variant="outline"
                        size="small"
                      >
                        삭제
                      </RemoveButton>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableContainer>
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

const TableContainer = tw.div`
  border-t
  border-[var(--stroke-neutral)]
`;

const RemoveButton = tw(Button)`
  w-full
`;

/**
 * Usage:
 *
 * <CampaignProductSection />
 */

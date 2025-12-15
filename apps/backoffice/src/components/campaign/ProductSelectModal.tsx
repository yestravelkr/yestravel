/**
 * ProductSelectModal - 상품 선택 모달
 *
 * 캠페인에 추가할 상품을 선택하는 모달입니다.
 * 체크박스로 여러 상품을 선택할 수 있으며, 선택한 상품의 ID를 반환합니다.
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
import dayjs from 'dayjs';
import { useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { EmptyState, TableSkeleton } from '@/shared/components';
import { trpc } from '@/shared/trpc';

interface ProductSelectModalProps {
  selectedProductIds?: number[];
}

function ProductSelectModal({
  selectedProductIds = [],
}: ProductSelectModalProps) {
  const { resolveModal } = useCurrentModal();
  const [selectedIds, setSelectedIds] = useState<number[]>(selectedProductIds);

  const { data, isLoading } = trpc.backofficeProduct.findAll.useQuery({
    page: 1,
    limit: 100,
  });

  const products = data?.data || [];

  const handleToggle = (productId: number) => {
    setSelectedIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((product) => product.id));
    }
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      toast.error('최소 1개 이상의 상품을 선택해주세요.');
      return;
    }
    resolveModal(selectedIds);
  };

  const handleCancel = () => {
    resolveModal(null);
  };

  const isAllSelected =
    products.length > 0 && selectedIds.length === products.length;

  return (
    <Container>
      <Header>
        <Title>상품 선택</Title>
        <SelectedCount>{selectedIds.length}개 선택됨</SelectedCount>
      </Header>

      <Content>
        {isLoading ? (
          <TableSkeleton columns={4} rows={5} />
        ) : products.length === 0 ? (
          <EmptyState
            title="등록된 상품이 없습니다"
            description="먼저 상품을 등록해주세요."
          />
        ) : (
          <TableContainer>
            <Table>
              <THead>
                <TR>
                  <TH>
                    <Checkbox
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleAll}
                    />
                  </TH>
                  <TH>상품명</TH>
                  <TH>브랜드</TH>
                  <TH>등록일</TH>
                </TR>
              </THead>
              <TBody>
                {products.map((product) => (
                  <ClickableTR
                    key={product.id}
                    onClick={() => handleToggle(product.id)}
                  >
                    <TD>
                      <Checkbox
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleToggle(product.id)
                        }
                        onClick={(e: any) => e.stopPropagation()}
                      />
                    </TD>
                    <TD>{product.name}</TD>
                    <TD>{product.brand.name}</TD>
                    <TD>{dayjs(product.createdAt).format('YYYY-MM-DD')}</TD>
                  </ClickableTR>
                ))}
              </TBody>
            </Table>
          </TableContainer>
        )}
      </Content>

      <Footer>
        <Button
          kind="neutral"
          variant="outline"
          size="large"
          onClick={handleCancel}
        >
          취소
        </Button>
        <Button
          kind="primary"
          variant="solid"
          size="large"
          onClick={handleConfirm}
          disabled={selectedIds.length === 0}
        >
          추가 ({selectedIds.length})
        </Button>
      </Footer>
    </Container>
  );
}

export function openProductSelectModal(
  selectedProductIds?: number[],
): Promise<number[] | null> {
  return SnappyModal.show(
    <ProductSelectModal selectedProductIds={selectedProductIds} />,
    {
      position: 'center',
    },
  );
}

const Container = tw.div`
  w-[800px]
  max-h-[80vh]
  bg-white
  rounded-[20px]
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  flex
  flex-col
`;

const Header = tw.div`
  px-6
  py-4
  border-b
  border-[var(--stroke-neutral)]
  flex
  justify-between
  items-center
`;

const Title = tw.div`
  text-[var(--fg-neutral)]
  text-xl
  font-bold
  leading-7
`;

const SelectedCount = tw.div`
  text-sm
  text-[var(--fg-muted)]
  font-medium
`;

const Content = tw.div`
  flex-1
  overflow-auto
  p-6
`;

const TableContainer = tw.div`
  overflow-x-auto
  border
  border-[var(--stroke-neutral)]
  rounded-lg
`;

const ClickableTR = tw(TR)`
  cursor-pointer
  hover:bg-[var(--bg-subtle)]
  transition-colors
`;

const Checkbox = tw.input`
  w-4
  h-4
  rounded
  border-[var(--stroke-neutral)]
  text-blue-600
  focus:ring-2
  focus:ring-blue-500
  cursor-pointer
`;

const Footer = tw.div`
  px-6
  py-4
  border-t
  border-[var(--stroke-neutral)]
  flex
  justify-end
  gap-3
`;

/**
 * Usage:
 *
 * const handleAddProduct = async () => {
 *   const productIds = await openProductSelectModal();
 *   if (productIds) {
 *     console.log('Selected product IDs:', productIds);
 *     // 선택한 상품들을 폼에 추가
 *   }
 * };
 *
 * // 이미 선택된 상품 ID를 전달하여 재선택 방지
 * const productIds = await openProductSelectModal([1, 2, 3]);
 */

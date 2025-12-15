/**
 * InfluencerSelectModal - 인플루언서 선택 모달
 *
 * 캠페인에 추가할 인플루언서를 선택하는 모달입니다.
 * 체크박스로 여러 인플루언서를 선택할 수 있으며, 선택한 인플루언서의 ID를 반환합니다.
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
import { useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { EmptyState, TableSkeleton } from '@/shared/components';
import { trpc } from '@/shared/trpc';

interface InfluencerSelectModalProps {
  selectedInfluencerIds?: number[];
}

function InfluencerSelectModal({
  selectedInfluencerIds = [],
}: InfluencerSelectModalProps) {
  const { resolveModal } = useCurrentModal();
  const [selectedIds, setSelectedIds] = useState<number[]>(
    selectedInfluencerIds,
  );

  const { data, isLoading } = trpc.backofficeInfluencer.findAll.useQuery({
    page: 1,
    limit: 100,
  });

  const influencers = data?.data || [];

  const handleToggle = (influencerId: number) => {
    setSelectedIds((prev) =>
      prev.includes(influencerId)
        ? prev.filter((id) => id !== influencerId)
        : [...prev, influencerId],
    );
  };

  const handleToggleAll = () => {
    if (selectedIds.length === influencers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(influencers.map((influencer) => influencer.id));
    }
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      toast.error('최소 1개 이상의 인플루언서를 선택해주세요.');
      return;
    }
    resolveModal(selectedIds);
  };

  const handleCancel = () => {
    resolveModal(null);
  };

  const isAllSelected =
    influencers.length > 0 && selectedIds.length === influencers.length;

  return (
    <Container>
      <Header>
        <Title>인플루언서 선택</Title>
        <SelectedCount>{selectedIds.length}개 선택됨</SelectedCount>
      </Header>

      <Content>
        {isLoading ? (
          <TableSkeleton columns={4} rows={5} />
        ) : influencers.length === 0 ? (
          <EmptyState
            title="등록된 인플루언서가 없습니다"
            description="먼저 인플루언서를 등록해주세요."
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
                  <TH>이름</TH>
                  <TH>이메일</TH>
                  <TH>전화번호</TH>
                </TR>
              </THead>
              <TBody>
                {influencers.map((influencer) => (
                  <ClickableTR
                    key={influencer.id}
                    onClick={() => handleToggle(influencer.id)}
                  >
                    <TD>
                      <Checkbox
                        type="checkbox"
                        checked={selectedIds.includes(influencer.id)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleToggle(influencer.id)
                        }
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      />
                    </TD>
                    <TD>{influencer.name}</TD>
                    <TD>{influencer.email || '-'}</TD>
                    <TD>{influencer.phoneNumber || '-'}</TD>
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

export function openInfluencerSelectModal(
  selectedInfluencerIds?: number[],
): Promise<number[] | null> {
  return SnappyModal.show(
    <InfluencerSelectModal selectedInfluencerIds={selectedInfluencerIds} />,
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
 * const handleAddInfluencer = async () => {
 *   const influencerIds = await openInfluencerSelectModal();
 *   if (influencerIds) {
 *     console.log('Selected influencer IDs:', influencerIds);
 *     // 선택한 인플루언서들을 폼에 추가
 *   }
 * };
 *
 * // 이미 선택된 인플루언서 ID를 전달하여 재선택 방지
 * const influencerIds = await openInfluencerSelectModal([1, 2, 3]);
 */

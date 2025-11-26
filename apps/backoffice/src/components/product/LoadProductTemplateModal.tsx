/**
 * LoadProductTemplateModal - 품목 불러오기 모달
 *
 * 품목을 검색하고 선택하여 상품 등록 폼에 데이터를 채울 수 있는 모달입니다.
 */

/* eslint-disable react-refresh/only-export-components */

import { Button, Dropdown } from '@yestravelkr/min-design-system';
import { Search, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import { trpc } from '@/shared/trpc';

function LoadProductTemplateModal() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>();
  const { resolveModal } = useCurrentModal();

  // 품목 템플릿 리스트 조회
  const { data, isLoading } = trpc.backofficeProductTemplate.findAll.useQuery({
    page: 1,
    limit: 100,
  });

  const productTemplates = data?.data || [];

  const handleConfirm = () => {
    if (selectedTemplateId) {
      resolveModal(selectedTemplateId);
    }
  };

  const options = productTemplates.map(
    (template: { id: number; name: string; brand: { name: string } }) => ({
      value: template.id,
      label: `${template.name} (${template.brand.name})`,
    }),
  );

  return (
    <Container>
      <Header>
        <Title>품목 불러오기</Title>
      </Header>

      <Dropdown
        value={selectedTemplateId}
        onChange={setSelectedTemplateId}
        options={options}
        placeholder="품목 검색"
        searchable="label"
        leadingIcon={<Search size={20} />}
        trailingIcon={<ChevronDown size={20} />}
      />

      <Button
        kind="primary"
        variant="solid"
        size="large"
        disabled={!selectedTemplateId}
        onClick={handleConfirm}
      >
        불러오기
      </Button>
    </Container>
  );
}

export function openLoadProductTemplateModal(): Promise<number | null> {
  return SnappyModal.show(<LoadProductTemplateModal />);
}

// Styled Components
const Container = tw.div`
  w-[480px]
  p-5
  bg-[var(--bg-layer)]
  rounded-[20px]
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  inline-flex
  flex-col
  justify-start
  items-start
  gap-5
`;

const Header = tw.div`
  self-stretch
  inline-flex
  justify-start
  items-start
  gap-2
`;

const Title = tw.div`
  flex-1
  justify-start
  text-[var(--fg-neutral)]
  text-xl
  font-bold
  leading-7
`;

/**
 * Usage:
 *
 * const handleImportProduct = async () => {
 *   const templateId = await openLoadProductTemplateModal();
 *   if (templateId) {
 *     // 품목 데이터 로드하여 폼에 채우기
 *   }
 * };
 */

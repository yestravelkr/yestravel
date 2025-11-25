/**
 * LoadProductTemplateModal - 품목 불러오기 모달
 *
 * 품목을 검색하고 선택하여 상품 등록 폼에 데이터를 채울 수 있는 모달입니다.
 */

/* eslint-disable react-refresh/only-export-components */

import { Button } from '@yestravelkr/min-design-system';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import SnappyModal from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import { trpc } from '@/shared/trpc';

interface ProductTemplate {
  id: number;
  type: 'HOTEL' | 'E-TICKET' | 'DELIVERY';
  name: string;
  brand: {
    id: number;
    name: string;
  };
}

function LoadProductTemplateModal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null,
  );

  // 품목 템플릿 리스트 조회
  const { data, isLoading } = trpc.backofficeProductTemplate.findAll.useQuery({
    page: 1,
    limit: 100,
  });

  const productTemplates = data?.data || [];

  // 검색 필터링
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return productTemplates;

    const query = searchQuery.toLowerCase();
    return productTemplates.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        template.brand.name.toLowerCase().includes(query),
    );
  }, [productTemplates, searchQuery]);

  const handleConfirm = () => {
    if (selectedTemplateId) {
      SnappyModal.close(selectedTemplateId);
    }
  };

  const handleTemplateClick = (templateId: number) => {
    setSelectedTemplateId(templateId);
  };

  return (
    <Container>
      <Header>
        <Title>품목 불러오기</Title>
      </Header>

      <SearchContainer>
        <SearchInputWrapper>
          <SearchIcon>
            <Search size={20} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="품목 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchInputWrapper>
      </SearchContainer>

      <TemplateListContainer>
        {isLoading ? (
          <LoadingText>로딩 중...</LoadingText>
        ) : filteredTemplates.length === 0 ? (
          <EmptyText>품목이 없습니다</EmptyText>
        ) : (
          filteredTemplates.map((template) => (
            <TemplateItem
              key={template.id}
              $isSelected={selectedTemplateId === template.id}
              onClick={() => handleTemplateClick(template.id)}
            >
              <TemplateInfo>
                <TemplateName>{template.name}</TemplateName>
                <TemplateBrand>{template.brand.name}</TemplateBrand>
              </TemplateInfo>
              <TemplateType>{template.type}</TemplateType>
            </TemplateItem>
          ))
        )}
      </TemplateListContainer>

      <Button
        kind="neutral"
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
  console.log('openLoadProductTemplateModal');
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
  font-['Min_Sans_VF']
  leading-7
`;

const SearchContainer = tw.div`
  self-stretch
  rounded-lg
  flex
  flex-col
  justify-start
  items-start
  gap-1
`;

const SearchInputWrapper = tw.div`
  self-stretch
  h-11
  px-3
  bg-[var(--bg-field)]
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  inline-flex
  justify-start
  items-center
  gap-1
`;

const SearchIcon = tw.div`
  h-5
  flex
  justify-start
  items-center
  text-[var(--fg-neutral)]
`;

const SearchInput = tw.input`
  flex-1
  px-1
  text-[var(--fg-neutral)]
  text-base
  font-normal
  font-['Min_Sans_VF']
  leading-5
  bg-transparent
  outline-none
  placeholder:text-[var(--fg-placeholder)]
`;

const TemplateListContainer = tw.div`
  self-stretch
  max-h-[400px]
  overflow-y-auto
  flex
  flex-col
  gap-2
`;

const TemplateItem = tw.div<{ $isSelected: boolean }>`
  p-3
  rounded-lg
  border
  cursor-pointer
  transition-all
  hover:bg-[var(--bg-neutral)]
  ${(props) =>
    props.$isSelected
      ? 'border-[var(--stroke-neutral-strong)] bg-[var(--bg-neutral)]'
      : 'border-[var(--stroke-neutral)]'}
  flex
  justify-between
  items-center
  gap-3
`;

const TemplateInfo = tw.div`
  flex-1
  flex
  flex-col
  gap-1
`;

const TemplateName = tw.div`
  text-[var(--fg-neutral)]
  text-base
  font-medium
  font-['Min_Sans_VF']
  leading-5
`;

const TemplateBrand = tw.div`
  text-[var(--fg-muted)]
  text-sm
  font-normal
  font-['Min_Sans_VF']
  leading-4
`;

const TemplateType = tw.div`
  px-2
  py-1
  bg-[var(--bg-neutral)]
  rounded
  text-[var(--fg-muted)]
  text-xs
  font-medium
  font-['Min_Sans_VF']
`;

const LoadingText = tw.div`
  text-center
  text-[var(--fg-muted)]
  text-base
  font-normal
  font-['Min_Sans_VF']
  py-8
`;

const EmptyText = tw.div`
  text-center
  text-[var(--fg-muted)]
  text-base
  font-normal
  font-['Min_Sans_VF']
  py-8
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

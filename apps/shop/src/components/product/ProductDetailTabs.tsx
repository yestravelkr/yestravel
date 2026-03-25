/**
 * ProductDetailTabs - 상품 상세 탭
 *
 * 상품정보, 판매정보, 추천 탭을 표시합니다.
 */

import tw from 'tailwind-styled-components';

export type ProductDetailTab = 'info' | 'sale' | 'recommend';

export interface ProductDetailTabsProps {
  /** 현재 선택된 탭 */
  selectedTab: ProductDetailTab;
  /** 탭 선택 핸들러 */
  onTabChange: (tab: ProductDetailTab) => void;
}

const TAB_LABELS: Record<ProductDetailTab, string> = {
  info: '상품정보',
  sale: '판매정보',
  recommend: '다른 상품 보기',
};

export function ProductDetailTabs({
  selectedTab,
  onTabChange,
}: ProductDetailTabsProps) {
  const tabs: ProductDetailTab[] = ['info', 'sale', 'recommend'];

  return (
    <Container>
      {tabs.map(tab => (
        <Tab
          key={tab}
          $selected={selectedTab === tab}
          onClick={() => onTabChange(tab)}
        >
          <TabLabel $selected={selectedTab === tab}>{TAB_LABELS[tab]}</TabLabel>
        </Tab>
      ))}
    </Container>
  );
}

const Container = tw.div`
  w-full
  bg-white
  border-b
  border-stroke-neutral
  flex
`;

const Tab = tw.button<{ $selected: boolean }>`
  flex-1
  h-12
  flex
  items-center
  justify-center
  ${({ $selected }) =>
    $selected ? 'border-b-2 border-stroke-neutral-strong' : ''}
`;

const TabLabel = tw.span<{ $selected: boolean }>`
  text-base
  leading-5
  ${({ $selected }) =>
    $selected ? 'font-medium text-fg-neutral' : 'font-normal text-fg-disabled'}
`;

/**
 * Usage:
 *
 * const [selectedTab, setSelectedTab] = useState<ProductDetailTab>('info');
 *
 * <ProductDetailTabs
 *   selectedTab={selectedTab}
 *   onTabChange={setSelectedTab}
 * />
 */

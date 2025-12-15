/**
 * Tab - 탭 네비게이션 컴포넌트
 *
 * 탭 형태의 네비게이션을 제공하는 컴포넌트입니다.
 * Tabs는 탭 컨테이너, Tab은 개별 탭 버튼입니다.
 * useTabs 훅으로 간편하게 탭 상태를 관리할 수 있습니다.
 */

import { useCallback, useMemo, useState } from 'react';
import tw from 'tailwind-styled-components';

export interface TabsProps {
  children: React.ReactNode;
}

export interface TabProps {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export interface TabItem<T extends string = string> {
  label: string;
  value: T;
}

export interface UseTabsOptions<T extends string = string> {
  defaultValue?: T;
}

export interface UseTabsReturn<T extends string = string> {
  selectedTab: T;
  setSelectedTab: (value: T) => void;
  TabComponents: () => React.ReactElement;
}

/**
 * Tabs - 탭 컨테이너
 *
 * 여러 Tab 컴포넌트를 감싸는 컨테이너입니다.
 */
export function Tabs({ children }: TabsProps) {
  return <TabsContainer>{children}</TabsContainer>;
}

/**
 * Tab - 개별 탭 버튼
 *
 * 선택 상태에 따라 스타일이 변경됩니다.
 */
export function Tab({ selected = false, onClick, children }: TabProps) {
  return (
    <TabButton $selected={selected} onClick={onClick} type="button">
      {children}
    </TabButton>
  );
}

const TabsContainer = tw.div`
  self-stretch
  border-b
  border-[var(--stroke-neutral)]
  inline-flex
  justify-start
  items-start
  gap-5
`;

const TabButton = tw.button<{ $selected: boolean }>`
  py-3
  flex
  justify-start
  items-start
  gap-2
  text-base
  leading-5
  transition-colors
  ${({ $selected }) =>
    $selected
      ? 'border-b-2 border-[var(--stroke-neutral-strong)] text-[var(--fg-neutral)] font-medium'
      : 'text-[var(--fg-disabled)] font-normal'}
`;

/**
 * useTabs - 탭 상태 관리 훅
 *
 * 탭 목록과 옵션을 받아 선택된 탭 상태와 TabComponents를 반환합니다.
 *
 * @param tabs - 탭 목록 배열 [{ label: '탭1', value: 'tab1' }, ...]
 * @param options - 옵션 { defaultValue?: string }
 * @returns { selectedTab, setSelectedTab, TabComponents }
 */
export function useTabs<T extends string = string>(
  tabs: TabItem<T>[],
  options?: UseTabsOptions<T>,
): UseTabsReturn<T> {
  const defaultValue = options?.defaultValue ?? tabs[0]?.value;
  const [selectedTab, setSelectedTab] = useState<T>(defaultValue as T);

  const handleTabClick = useCallback((value: T) => {
    setSelectedTab(value);
  }, []);

  const TabComponents = useMemo(() => {
    return function TabComponentsInner() {
      return (
        <Tabs>
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              selected={selectedTab === tab.value}
              onClick={() => handleTabClick(tab.value)}
            >
              {tab.label}
            </Tab>
          ))}
        </Tabs>
      );
    };
  }, [tabs, selectedTab, handleTabClick]);

  return {
    selectedTab,
    setSelectedTab,
    TabComponents,
  };
}

/**
 * Usage (Basic):
 *
 * const [activeTab, setActiveTab] = useState<'tab1' | 'tab2'>('tab1');
 *
 * <Tabs>
 *   <Tab selected={activeTab === 'tab1'} onClick={() => setActiveTab('tab1')}>
 *     탭 1
 *   </Tab>
 *   <Tab selected={activeTab === 'tab2'} onClick={() => setActiveTab('tab2')}>
 *     탭 2
 *   </Tab>
 * </Tabs>
 *
 * Usage (with useTabs hook):
 *
 * const { selectedTab, TabComponents } = useTabs([
 *   { label: '캠페인 설정', value: 'campaign' },
 *   { label: '상품 판매 설정', value: 'productSales' },
 * ]);
 *
 * <TabComponents />
 * {selectedTab === 'campaign' && <CampaignContent />}
 * {selectedTab === 'productSales' && <ProductSalesContent />}
 */

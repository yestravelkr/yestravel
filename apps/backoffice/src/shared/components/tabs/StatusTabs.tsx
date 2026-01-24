/**
 * StatusTabs - 상태 탭 공통 컴포넌트
 *
 * 다양한 상태 필터링에 재사용 가능한 탭 컴포넌트
 */

import tw from 'tailwind-styled-components';

export interface StatusTabItem<T extends string> {
  /** 탭 식별 키 */
  key: T;
  /** 표시 라벨 */
  label: string;
  /** 카운트 (0이면 숨김) */
  count?: number;
  /** 알림 표시 여부 (빨간 점) */
  hasAlert?: boolean;
}

interface StatusTabsProps<T extends string> {
  /** 탭 목록 */
  tabs: StatusTabItem<T>[];
  /** 현재 선택된 탭 키 */
  activeTab: T;
  /** 탭 변경 핸들러 */
  onTabChange: (tab: T) => void;
}

/**
 * Usage:
 * ```tsx
 * const tabs: StatusTabItem<OrderStatusTab>[] = [
 *   { key: 'ALL', label: '전체 주문', count: 30 },
 *   { key: 'PAID', label: '결제완료', count: 5, hasAlert: true },
 * ];
 *
 * <StatusTabs
 *   tabs={tabs}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 * ```
 */
export function StatusTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: StatusTabsProps<T>) {
  return (
    <TabContainer>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TabButton
            key={tab.key}
            $active={isActive}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <TabCount $active={isActive}>{tab.count}</TabCount>
            )}
            {tab.hasAlert && <AlertDot />}
          </TabButton>
        );
      })}
    </TabContainer>
  );
}

const TabContainer = tw.div`
  flex
  gap-1
  border-b
  border-[var(--stroke-neutral-subtle)]
`;

const TabButton = tw.button<{ $active: boolean }>`
  relative
  px-3
  py-2.5
  text-sm
  font-medium
  border-b-2
  transition-colors
  whitespace-nowrap
  ${(props) =>
    props.$active
      ? 'border-[var(--fg-neutral)] text-[var(--fg-neutral)]'
      : 'border-transparent text-[var(--fg-muted)] hover:text-[var(--fg-neutral)]'}
`;

const TabCount = tw.span<{ $active: boolean }>`
  ml-1
  inline-flex
  items-center
  justify-center
  h-[22px]
  min-w-[22px]
  px-1
  rounded-full
  bg-[var(--bg-neutral,#F4F4F5)]
  text-xs
  ${(props) => (props.$active ? 'text-[var(--fg-neutral)]' : 'text-[var(--fg-muted)]')}
`;

const AlertDot = tw.span`
  absolute
  top-2
  -right-0.5
  w-1.5
  h-1.5
  bg-[#449AFC]
  rounded-full
`;

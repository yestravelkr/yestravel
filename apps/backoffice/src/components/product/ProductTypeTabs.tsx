/**
 * ProductTypeTabs - 상품 타입 탭 메뉴
 *
 * 숙박, 배송, 티켓 타입을 전환할 수 있는 탭 메뉴
 */

import { Link, useLocation } from '@tanstack/react-router';
import tw from 'tailwind-styled-components';

interface ProductTypeTabsProps {
  /** 기본 경로 ('product' 또는 'product-template') */
  basePath: 'product' | 'product-template';
}

export function ProductTypeTabs({ basePath }: ProductTypeTabsProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { type: 'hotel', label: '숙박' },
    { type: 'delivery', label: '배송' },
    { type: 'eticket', label: '티켓' },
  ];

  return (
    <TabContainer>
      {tabs.map((tab) => {
        const tabPath = `/${basePath}/${tab.type}`;
        const isActive = currentPath.startsWith(tabPath);

        return (
          <TabLink key={tab.type} to={tabPath} $active={isActive}>
            {tab.label}
          </TabLink>
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
  mb-6
`;

const TabLink = tw(Link)<{ $active: boolean }>`
  px-4
  py-2.5
  text-sm
  font-medium
  border-b-2
  transition-colors
  ${(props) =>
    props.$active
      ? 'border-blue-600 text-blue-600'
      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'}
`;

/**
 * Usage:
 *
 * <ProductTypeTabs basePath="product-template" />
 * <ProductTypeTabs basePath="product" />
 */

/**
 * MenuItem - 메뉴 아이템 컴포넌트
 *
 * 드롭다운, 컨텍스트 메뉴 등에서 사용되는 개별 메뉴 아이템입니다.
 * 왼쪽/오른쪽 아이콘, 선택/비활성화 상태, 크기 조절을 지원합니다.
 */

import { ReactNode } from 'react';
import tw from 'tailwind-styled-components';

export interface MenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 왼쪽 아이콘 */
  left?: ReactNode;
  /** 오른쪽 아이콘 */
  right?: ReactNode;
  /** 크기 */
  size?: 'medium' | 'large';
  /** 선택 상태 */
  selected?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 자식 요소 */
  children?: ReactNode;
}

export function MenuItem({
  left,
  right,
  size = 'medium',
  selected = false,
  disabled = false,
  children,
  onClick,
  ...rest
}: MenuItemProps) {
  return (
    <Container
      $size={size}
      $selected={selected}
      $disabled={disabled}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      {left && <IconWrapper $size={size}>{left}</IconWrapper>}
      <Content $size={size}>{children}</Content>
      {right && <IconWrapper $size={size}>{right}</IconWrapper>}
    </Container>
  );
}

/**
 * Usage:
 *
 * <MenuItem
 *   size="large"
 *   selected={true}
 *   left={<Check size={20} />}
 *   right={<ChevronRight size={20} />}
 *   onClick={() => console.log('clicked')}
 * >
 *   메뉴 아이템
 * </MenuItem>
 *
 * <MenuItem
 *   size="medium"
 *   disabled={true}
 * >
 *   비활성화된 아이템
 * </MenuItem>
 */

// Styled Components
const Container = tw.div<{
  $size: 'medium' | 'large';
  $selected: boolean;
  $disabled: boolean;
}>`
  ${(p) => p.$size === 'large' ? 'h-11 px-3' : 'h-9 px-2'}
  inline-flex
  justify-start
  items-center
  w-full
  gap-2
  ${(p) => p.$disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--bg-neutral)]'}
  ${(p) => p.$selected ? 'bg-[var(--bg-neutral)]' : ''}
  transition-colors
`;

const IconWrapper = tw.div<{ $size: 'medium' | 'large' }>`
  ${(p) => p.$size === 'large' ? 'h-5 w-5' : 'h-4 w-4'}
  flex
  justify-center
  items-center
  text-[var(--fg-neutral)]
`;

const Content = tw.div<{ $size: 'medium' | 'large' }>`
  flex-1
  px-1
  text-base
  font-normal
  ${(p) => p.$size === 'large' ? 'leading-5' : 'leading-4'}
  text-[var(--fg-neutral)]
`;

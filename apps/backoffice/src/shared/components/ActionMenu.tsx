/**
 * ActionMenu - 더보기 메뉴 (...)
 *
 * 테이블 행이나 카드에서 추가 액션을 제공하는 드롭다운 메뉴입니다.
 * floating-ui를 사용하여 화면 경계에서 자동으로 위치가 조정됩니다.
 */

import {
  useFloating,
  useClick,
  useDismiss,
  useInteractions,
  offset,
  flip,
  shift,
  autoUpdate,
  FloatingPortal,
} from '@floating-ui/react';
import { MoreHorizontal } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import tw from 'tailwind-styled-components';

interface ActionMenuItem {
  /** 메뉴 아이템 라벨 */
  label: string;
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 아이콘 (선택) */
  icon?: ReactNode;
  /** 위험 액션 여부 (빨간색 표시) */
  danger?: boolean;
  /** 비활성화 여부 */
  disabled?: boolean;
}

interface ActionMenuProps {
  /** 메뉴 아이템 목록 */
  items: ActionMenuItem[];
  /** 드롭다운 정렬 (기본: right) */
  align?: 'left' | 'right';
}

export function ActionMenu({ items, align = 'right' }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    placement: align === 'left' ? 'bottom-start' : 'bottom-end',
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  const handleItemClick = (item: ActionMenuItem) => {
    if (item.disabled) return;
    item.onClick();
    setIsOpen(false);
  };

  return (
    <>
      <TriggerButton
        ref={refs.setReference}
        type="button"
        onClick={(e) => e.stopPropagation()}
        {...getReferenceProps()}
      >
        <MoreHorizontal size={20} />
      </TriggerButton>

      {isOpen && (
        <FloatingPortal>
          <Dropdown
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <DropdownList>
              {items.map((item, index) => (
                <DropdownItem
                  key={index}
                  type="button"
                  $danger={item.danger}
                  $disabled={item.disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemClick(item);
                  }}
                >
                  {item.icon && (
                    <IconWrapper $danger={item.danger}>{item.icon}</IconWrapper>
                  )}
                  <ItemLabel $danger={item.danger}>{item.label}</ItemLabel>
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        </FloatingPortal>
      )}
    </>
  );
}

const TriggerButton = tw.button`
  flex items-center justify-center
  size-8
  rounded-xl
  text-[var(--fg-muted,#71717a)]
  cursor-pointer
  transition-colors
  hover:bg-[var(--bg-neutral,#f4f4f5)]
`;

const Dropdown = tw.div`
  z-50
  w-[240px]
  p-2
  bg-white
  rounded-[20px]
  shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12),0px_0px_2px_0px_rgba(0,0,0,0.12)]
`;

const DropdownList = tw.div`
  flex flex-col
`;

const DropdownItem = tw.button<{ $danger?: boolean; $disabled?: boolean }>`
  flex items-center
  gap-2
  h-9
  px-3
  rounded-xl
  text-left
  cursor-pointer
  transition-colors
  hover:bg-[var(--bg-neutral,#f4f4f5)]
  ${({ $disabled }) => $disabled && 'opacity-50 cursor-not-allowed'}
`;

const IconWrapper = tw.div<{ $danger?: boolean }>`
  flex items-center
  h-5
  ${({ $danger }) =>
    $danger
      ? 'text-[var(--fg-critical,#eb3d3d)]'
      : 'text-[var(--fg-neutral,#18181b)]'}
`;

const ItemLabel = tw.span<{ $danger?: boolean }>`
  flex-1
  text-[15px]
  leading-5
  ${({ $danger }) =>
    $danger
      ? 'text-[var(--fg-critical,#eb3d3d)]'
      : 'text-[var(--fg-neutral,#18181b)]'}
`;

/**
 * Usage:
 *
 * <ActionMenu
 *   items={[
 *     {
 *       label: '비밀번호 재설정',
 *       icon: <RefreshCw size={20} />,
 *       onClick: () => handleResetPassword(),
 *     },
 *     {
 *       label: '관리자 목록에서 제거',
 *       icon: <Trash2 size={20} />,
 *       onClick: () => handleDelete(),
 *       danger: true,
 *     },
 *   ]}
 * />
 */

/**
 * SelectDropdown - 커스텀 드롭다운 Select
 *
 * 클릭 시 드롭다운이 열리는 커스텀 Select 컴포넌트입니다.
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
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import tw from 'tailwind-styled-components';

interface SelectOption {
  /** 옵션 값 */
  value: string;
  /** 표시 라벨 */
  label: string;
}

interface SelectDropdownProps {
  /** 선택 옵션 목록 */
  options: SelectOption[];
  /** 현재 선택된 값 */
  value: string;
  /** 값 변경 핸들러 */
  onChange: (value: string) => void;
  /** 드롭다운 너비 (기본: 160px) */
  width?: number;
  /** 비활성화 여부 */
  disabled?: boolean;
}

export function SelectDropdown({
  options,
  value,
  onChange,
  width = 160,
  disabled = false,
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <>
      <Trigger
        ref={refs.setReference}
        type="button"
        style={{ width }}
        $disabled={disabled}
        {...getReferenceProps()}
      >
        <TriggerLabel>{selectedOption?.label || '선택하세요'}</TriggerLabel>
        <ChevronIcon size={20} $isOpen={isOpen} />
      </Trigger>

      {isOpen && (
        <FloatingPortal>
          <Dropdown
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <DropdownList>
              {options.map((option) => (
                <DropdownItem
                  key={option.value}
                  type="button"
                  $selected={option.value === value}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
        </FloatingPortal>
      )}
    </>
  );
}

const Trigger = tw.button<{ $disabled?: boolean }>`
  flex items-center justify-between
  gap-1
  w-full
  min-h-[44px]
  px-2 py-3
  bg-white
  text-[15px]
  text-[var(--fg-neutral,#18181b)]
  leading-5
  cursor-pointer
  ${({ $disabled }) => $disabled && 'opacity-50 cursor-not-allowed'}
`;

const TriggerLabel = tw.span`
  flex-1
  text-left
`;

const ChevronIcon = tw(ChevronDown)<{ $isOpen?: boolean }>`
  text-[var(--fg-neutral,#18181b)]
  transition-transform
  ${({ $isOpen }) => $isOpen && 'rotate-180'}
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

const DropdownItem = tw.button<{ $selected?: boolean }>`
  flex items-center
  gap-2
  h-9
  px-3
  rounded-xl
  text-[15px]
  text-[var(--fg-neutral,#18181b)]
  leading-5
  text-left
  cursor-pointer
  transition-colors
  ${({ $selected }) =>
    $selected
      ? 'bg-[var(--bg-neutral,#f4f4f5)]'
      : 'hover:bg-[var(--bg-neutral,#f4f4f5)]'}
`;

/**
 * Usage:
 *
 * const [role, setRole] = useState('admin');
 *
 * <SelectDropdown
 *   options={[
 *     { value: 'super', label: '대표 관리자' },
 *     { value: 'admin', label: '관리자' },
 *   ]}
 *   value={role}
 *   onChange={setRole}
 * />
 */

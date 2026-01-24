/**
 * FilterDropdown - 필터용 드롭다운 컴포넌트
 *
 * 기간 타입, 기간 프리셋 등의 필터 선택에 사용되는 드롭다운입니다.
 * 라벨과 선택 옵션을 표시하며, 초기화 버튼을 선택적으로 포함할 수 있습니다.
 */

import { ChevronDown, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import tw from 'tailwind-styled-components';

export interface FilterDropdownOption {
  /** 옵션 값 */
  value: string;
  /** 옵션 표시 텍스트 */
  label: string;
}

export interface FilterDropdownProps {
  /** 드롭다운 라벨 */
  label?: string;
  /** 현재 선택된 값 */
  value: string;
  /** 옵션 목록 */
  options: FilterDropdownOption[];
  /** 선택 변경 시 콜백 */
  onChange: (value: string) => void;
  /** 초기화 버튼 클릭 시 콜백 */
  onReset?: () => void;
  /** 초기화 버튼 표시 여부 */
  showReset?: boolean;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
}

/**
 * Usage:
 *
 * <FilterDropdown
 *   label="기간 타입"
 *   value={periodType}
 *   options={[
 *     { value: 'payment', label: '결제일' },
 *     { value: 'order', label: '주문일' },
 *     { value: 'usage', label: '이용일' },
 *   ]}
 *   onChange={setPeriodType}
 *   showReset
 *   onReset={() => setPeriodType('payment')}
 * />
 */
export function FilterDropdown({
  label,
  value,
  options,
  onChange,
  onReset,
  showReset = false,
  placeholder = '선택',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <Container ref={containerRef}>
      <TriggerWrapper>
        {label && <Label>{label}</Label>}
        <Trigger onClick={() => setIsOpen(!isOpen)} $isOpen={isOpen}>
          <TriggerText $hasValue={!!selectedOption}>
            {selectedOption?.label || placeholder}
          </TriggerText>
          <IconWrapper $isOpen={isOpen}>
            <ChevronDown size={16} />
          </IconWrapper>
        </Trigger>
        {showReset && onReset && (
          <ResetButton onClick={onReset} type="button">
            <RotateCcw size={14} />
          </ResetButton>
        )}
      </TriggerWrapper>

      {isOpen && (
        <DropdownMenu>
          {options.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleSelect(option.value)}
              $selected={option.value === value}
            >
              {option.label}
            </MenuItem>
          ))}
        </DropdownMenu>
      )}
    </Container>
  );
}

const Container = tw.div`
  relative
`;

const TriggerWrapper = tw.div`
  flex
  items-center
  gap-2
`;

const Label = tw.span`
  text-sm
  font-medium
  text-[var(--fg-neutral)]
  whitespace-nowrap
`;

const Trigger = tw.button<{ $isOpen?: boolean }>`
  h-9
  px-3
  bg-[var(--bg-field)]
  rounded-lg
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  inline-flex
  items-center
  gap-2
  cursor-pointer
  hover:outline-[var(--stroke-neutral-hover)]
  transition-all
  ${(p) => (p.$isOpen ? 'outline-[var(--stroke-neutral-hover)]' : '')}
`;

const TriggerText = tw.span<{ $hasValue?: boolean }>`
  text-sm
  font-normal
  whitespace-nowrap
  ${(p) => (p.$hasValue ? 'text-[var(--fg-neutral)]' : 'text-[var(--fg-placeholder)]')}
`;

const IconWrapper = tw.span<{ $isOpen?: boolean }>`
  flex
  items-center
  justify-center
  text-[var(--fg-muted)]
  transition-transform
  ${(p) => (p.$isOpen ? 'rotate-180' : '')}
`;

const ResetButton = tw.button`
  w-8
  h-8
  flex
  items-center
  justify-center
  text-[var(--fg-muted)]
  hover:text-[var(--fg-neutral)]
  hover:bg-[var(--bg-neutral-subtle)]
  rounded-lg
  transition-colors
  cursor-pointer
`;

const DropdownMenu = tw.div`
  absolute
  top-[calc(100%+4px)]
  left-0
  min-w-[120px]
  bg-[var(--bg-layer)]
  rounded-lg
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  shadow-lg
  z-50
  overflow-hidden
  py-1
`;

const MenuItem = tw.button<{ $selected?: boolean }>`
  w-full
  px-3
  py-2
  text-sm
  font-normal
  text-left
  cursor-pointer
  transition-colors
  ${(p) =>
    p.$selected
      ? 'text-[var(--fg-neutral)] bg-[var(--bg-neutral-subtle)]'
      : 'text-[var(--fg-neutral)] hover:bg-[var(--bg-neutral-subtle)]'}
`;

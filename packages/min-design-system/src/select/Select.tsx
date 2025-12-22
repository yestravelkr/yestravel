/**
 * Select - 옵션 선택 컴포넌트
 *
 * 옵션 목록을 펼쳐서 항목을 선택할 수 있는 셀렉트 컴포넌트입니다.
 * 커스텀 옵션 렌더링, 가격/재고 표시 등을 지원합니다.
 * Dropdown과 달리 옵션별 상세 정보(가격, 재고 등)를 표시할 수 있습니다.
 */

import { useState, useRef, useEffect, ReactNode } from 'react';
import tw from 'tailwind-styled-components';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface SelectOption<T = any> {
  /** 옵션 값 */
  value: T;
  /** 옵션 표시 텍스트 */
  label: string;
  /** 가격 (선택적) */
  price?: number;
  /** 재고 상태 텍스트 (선택적) */
  stockText?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

export interface SelectProps<T = any> {
  /** 선택된 값 */
  value?: T;
  /** 선택 변경 시 호출되는 콜백 */
  onSelect: (value: T) => void;
  /** 옵션 목록 */
  options: SelectOption<T>[];
  /** Placeholder 텍스트 */
  placeholder?: string;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 에러 상태 */
  error?: boolean;
  /** 드롭다운 열림 상태 (controlled) */
  isOpen?: boolean;
  /** 드롭다운 열림 상태 변경 콜백 */
  onOpenChange?: (isOpen: boolean) => void;
  /** 기본 열림 상태 (uncontrolled) */
  defaultOpen?: boolean;
  /** 왼쪽 아이콘 */
  leadingIcon?: ReactNode;
  /** 커스텀 옵션 렌더러 */
  renderOption?: (option: SelectOption<T>) => ReactNode;
}

export function Select<T = any>({
  value,
  onSelect,
  options,
  placeholder = '선택하세요',
  disabled = false,
  error = false,
  isOpen: controlledIsOpen,
  onOpenChange,
  defaultOpen = false,
  leadingIcon,
  renderOption,
}: SelectProps<T>) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const containerRef = useRef<HTMLDivElement>(null);

  // Controlled vs Uncontrolled
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(open);
    }
    onOpenChange?.(open);
  };

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option: SelectOption<T>) => {
    if (!option.disabled) {
      onSelect(option.value);
      setIsOpen(false);
    }
  };

  const defaultRenderOption = (option: SelectOption<T>) => (
    <OptionContent>
      <OptionName>{option.label}</OptionName>
      {(option.price !== undefined || option.stockText) && (
        <OptionInfoRow>
          {option.price !== undefined && (
            <OptionPrice>{option.price.toLocaleString()}원</OptionPrice>
          )}
          {option.stockText && (
            <OptionStock>{option.stockText}</OptionStock>
          )}
        </OptionInfoRow>
      )}
    </OptionContent>
  );

  return (
    <Container ref={containerRef}>
      <Trigger
        onClick={handleToggle}
        $disabled={disabled}
        $error={error}
        $isOpen={isOpen}
      >
        {leadingIcon && (
          <LeadingIconWrapper>
            {leadingIcon}
          </LeadingIconWrapper>
        )}
        <TriggerContent>
          <TriggerText $hasValue={!!selectedOption}>
            {selectedOption?.label || placeholder}
          </TriggerText>
        </TriggerContent>
        <IconWrapper>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </IconWrapper>
      </Trigger>

      {isOpen && (
        <OptionsContainer>
          {options.map((option, index) => (
            <OptionItem
              key={index}
              onClick={() => handleSelect(option)}
              $disabled={option.disabled}
              $selected={option.value === value}
            >
              {renderOption ? renderOption(option) : defaultRenderOption(option)}
            </OptionItem>
          ))}
        </OptionsContainer>
      )}
    </Container>
  );
}

/**
 * Usage:
 *
 * // 기본 사용법
 * <Select
 *   value={selectedId}
 *   onSelect={setSelectedId}
 *   options={[
 *     { value: 1, label: '기본 객실', price: 100000, stockText: '예약 가능' },
 *     { value: 2, label: '조식 포함', price: 130000, stockText: '예약 가능' },
 *   ]}
 *   placeholder="옵션"
 * />
 *
 * // Controlled 모드
 * <Select
 *   value={selectedId}
 *   onSelect={setSelectedId}
 *   options={options}
 *   isOpen={isDropdownOpen}
 *   onOpenChange={setIsDropdownOpen}
 * />
 *
 * // 커스텀 옵션 렌더링
 * <Select
 *   value={selectedId}
 *   onSelect={setSelectedId}
 *   options={options}
 *   renderOption={(option) => (
 *     <div>
 *       <strong>{option.label}</strong>
 *       <span>{option.price?.toLocaleString()}원</span>
 *     </div>
 *   )}
 * />
 */

// Styled Components
const Container = tw.div`
  relative
  w-full
  flex
  flex-col
  gap-2
`;

const Trigger = tw.button<{ $disabled?: boolean; $error?: boolean; $isOpen?: boolean }>`
  w-full
  h-11
  px-3
  bg-[var(--bg-field)]
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  inline-flex
  justify-between
  items-center
  gap-1
  ${(p) => p.$error ? 'outline-[var(--stroke-error)]' : p.$isOpen ? 'outline-[var(--stroke-primary)]' : 'outline-[var(--stroke-neutral)]'}
  ${(p) => p.$disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  transition-all
`;

const LeadingIconWrapper = tw.div`
  w-5
  h-5
  flex
  justify-center
  items-center
  text-[var(--fg-neutral)]
`;

const TriggerContent = tw.div`
  flex-1
  px-1
  flex
  justify-start
  items-center
`;

const TriggerText = tw.div<{ $hasValue?: boolean }>`
  flex-1
  text-base
  font-normal
  leading-5
  text-left
  ${(p) => p.$hasValue ? 'text-[var(--fg-neutral)]' : 'text-[var(--fg-neutral)]'}
`;

const IconWrapper = tw.div`
  w-5
  h-5
  flex
  justify-center
  items-center
  text-[var(--fg-neutral)]
`;

const OptionsContainer = tw.div`
  p-1
  bg-[var(--bg-neutral-subtle)]
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  flex
  flex-col
`;

const OptionItem = tw.button<{ $disabled?: boolean; $selected?: boolean }>`
  min-h-16
  px-3
  py-2.5
  rounded-xl
  flex
  flex-col
  justify-center
  gap-1
  text-left
  ${(p) => p.$disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--bg-neutral)]'}
  ${(p) => p.$selected ? 'bg-[var(--bg-neutral)]' : ''}
  transition-colors
`;

const OptionContent = tw.div`
  flex
  flex-col
  gap-1
`;

const OptionName = tw.div`
  text-[var(--fg-neutral)]
  text-base
  font-normal
  leading-5
`;

const OptionInfoRow = tw.div`
  flex
  items-baseline
  gap-1
`;

const OptionPrice = tw.div`
  text-[var(--fg-neutral)]
  text-base
  font-medium
  leading-5
`;

const OptionStock = tw.div`
  text-[var(--fg-muted)]
  text-sm
  font-normal
  leading-4
`;

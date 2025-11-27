/**
 * Dropdown - 드롭다운 선택 컴포넌트
 *
 * 옵션 목록을 펼쳐서 항목을 선택할 수 있는 드롭다운 컴포넌트입니다.
 * searchable이 true일 경우 Trigger 내에서 직접 검색 input이 표시됩니다.
 * 키보드 내비게이션, 커스텀 렌더링을 지원합니다.
 */

import { useState, useRef, useEffect, ReactNode } from 'react';
import tw from 'tailwind-styled-components';
import { ChevronDown } from 'lucide-react';
import { MenuItem } from '../menuitem/MenuItem';

export interface DropdownOption<T = any> {
  /** 옵션 값 */
  value: T;
  /** 옵션 표시 텍스트 */
  label: string;
  /** 비활성화 여부 */
  disabled?: boolean;
}

export interface DropdownProps<T = any> {
  /** 선택된 값 */
  value?: T;
  /** 선택 변경 시 호출되는 콜백 */
  onChange: (value: T) => void;
  /** 옵션 목록 */
  options: DropdownOption<T>[];
  /** Placeholder 텍스트 */
  placeholder?: string;
  /** 검색 기능 활성화 여부 - true: value와 label 모두 검색, 'value': value만 검색, 'label': label만 검색 */
  searchable?: boolean | 'value' | 'label';
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 에러 상태 */
  error?: boolean;
  /** 왼쪽 아이콘 */
  leadingIcon?: ReactNode;
  /** 오른쪽 아이콘 (기본: ChevronDown) */
  trailingIcon?: ReactNode;
}

export function Dropdown<T = any>({
  value,
  onChange,
  options,
  placeholder = '선택하세요',
  searchable = false,
  disabled = false,
  error = false,
  leadingIcon,
  trailingIcon,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = searchable && searchTerm
    ? options.filter(opt => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const valueString = String(opt.value).toLowerCase();
        const labelString = opt.label.toLowerCase();
        
        return searchable === true 
          ? valueString.includes(lowerSearchTerm) || labelString.includes(lowerSearchTerm)
          : searchable === 'value' 
            ? valueString.includes(lowerSearchTerm)
            : labelString.includes(lowerSearchTerm);
      })
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option: DropdownOption<T>) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <Container ref={containerRef}>
      <Trigger
        onClick={() => {
          if (searchable && searchInputRef.current) {
            searchInputRef.current.focus();
            setIsOpen(true);
          } else {
            handleToggle();
          }
        }}
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
          {searchable ? (
            <SearchInput
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchTerm(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => {
                if (!isOpen) setIsOpen(true);
              }}
              placeholder={selectedOption?.label || placeholder}
              disabled={disabled}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />
          ) : (
            <TriggerText $hasValue={!!selectedOption}>
              {selectedOption?.label || placeholder}
            </TriggerText>
          )}
        </TriggerContent>
        <IconWrapper $isOpen={isOpen}>
          {trailingIcon || <ChevronDown size={20} />}
        </IconWrapper>
      </Trigger>

      {isOpen && (
        <DropdownMenu>
          <OptionList>
            {filteredOptions.length === 0 ? (
              <EmptyState>검색 결과가 없습니다</EmptyState>
            ) : (
              filteredOptions.map((option, index) => (
                <MenuItem
                  key={index}
                  onClick={() => handleSelect(option)}
                  disabled={option.disabled}
                  selected={option.value === value}
                  size="large"
                >
                  {option.label}
                </MenuItem>
              ))
            )}
          </OptionList>
        </DropdownMenu>
      )}
    </Container>
  );
}

/**
 * Usage:
 *
 * const [selectedId, setSelectedId] = useState<number>();
 *
 * <Dropdown
 *   value={selectedId}
 *   onChange={setSelectedId}
 *   options={[
 *     { value: 1, label: '옵션 1' },
 *     { value: 2, label: '옵션 2', disabled: true },
 *     { value: 3, label: '옵션 3' },
 *   ]}
 *   placeholder="옵션을 선택하세요"
 *   searchable // true: value와 label 모두 검색, Trigger에 검색 input 표시
 *   searchable="label" // label만 검색
 *   searchable="value" // value만 검색
 *   leadingIcon={<Search size={20} />}
 *   trailingIcon={<ChevronDown size={20} />}
 * />
 */

// Styled Components
const Container = tw.div`
  relative
  w-full
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
  ${(p) => p.$error ? 'outline-[var(--stroke-error)]' : 'outline-[var(--stroke-neutral)]'}
  inline-flex
  justify-between
  items-center
  gap-1
  ${(p) => p.$disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  ${(p) => p.$isOpen ? 'outline-[var(--stroke-neutral-hover)]' : ''}
  transition-all
`;

const LeadingIconWrapper = tw.div`
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
  items-start
  gap-2
`;

const TriggerText = tw.div<{ $hasValue?: boolean }>`
  flex-1
  justify-start
  text-base
  font-normal
  leading-5
  text-left
  ${(p) => p.$hasValue ? 'text-[var(--fg-neutral)]' : 'text-[var(--fg-placeholder)]'}
`;

const IconWrapper = tw.div<{ $isOpen?: boolean }>`
  h-5
  flex
  justify-center
  items-center
  transition-transform
  ${(p) => p.$isOpen ? 'rotate-180' : ''}
  text-[var(--fg-muted)]
`;

const DropdownMenu = tw.div`
  absolute
  top-[calc(100%+4px)]
  left-0
  right-0
  bg-[var(--bg-layer)]
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  shadow-lg
  z-50
  overflow-hidden
`;

const SearchInput = tw.input`
  flex-1
  px-1
  bg-transparent
  outline-none
  text-base
  font-normal
  leading-5
  text-[var(--fg-neutral)]
  placeholder:text-[var(--fg-placeholder)]
`;

const OptionList = tw.div`
  max-h-60
  overflow-y-auto
`;

const EmptyState = tw.div`
  px-3
  py-4
  text-center
  text-[var(--fg-muted)]
  text-base
  font-normal
  leading-5
`;

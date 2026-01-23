/**
 * MultiSelectDropdown - 다중 선택 드롭다운 컴포넌트
 *
 * 인플루언서 등 다중 선택이 필요한 필터에 사용되는 드롭다운입니다.
 * 체크박스로 여러 항목을 선택할 수 있습니다.
 *
 * 표시 형식:
 * - 선택 전: "인플루언서"
 * - 1개 선택: "인플루언서: 서형준"
 * - 다중 선택: "인플루언서: 서형준 외 2개"
 */

import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import tw from 'tailwind-styled-components';

export interface MultiSelectOption {
  /** 옵션 값 */
  value: string;
  /** 옵션 표시 텍스트 */
  label: string;
}

export interface MultiSelectDropdownProps {
  /** 드롭다운 라벨 */
  label?: string;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 현재 선택된 값들 */
  values: string[];
  /** 옵션 목록 */
  options: MultiSelectOption[];
  /** 선택 변경 시 콜백 */
  onChange: (values: string[]) => void;
  /** 외부 검색 콜백 (API 연동용) */
  onSearch?: (query: string) => void;
}

/**
 * Usage:
 *
 * <MultiSelectDropdown
 *   label="인플루언서"
 *   placeholder="인플루언서 검색"
 *   values={selectedInfluencers}
 *   options={influencerOptions}
 *   onChange={setSelectedInfluencers}
 * />
 */
export function MultiSelectDropdown({
  label,
  placeholder = '검색',
  values,
  options,
  onChange,
  onSearch,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter((opt) => values.includes(opt.value));

  // 트리거 표시 텍스트
  const getTriggerDisplayText = () => {
    if (selectedOptions.length === 0) {
      return label || placeholder;
    }
    if (selectedOptions.length === 1) {
      return `${label}: ${selectedOptions[0].label}`;
    }
    const remainingCount = selectedOptions.length - 1;
    return `${label}: ${selectedOptions[0].label} 외 ${remainingCount}개`;
  };

  const triggerDisplayText = getTriggerDisplayText();
  const hasSelection = selectedOptions.length > 0;

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const lowerSearch = searchTerm.toLowerCase();
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(lowerSearch),
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  }, [searchTerm, onSearch]);

  const handleToggle = (optionValue: string) => {
    if (values.includes(optionValue)) {
      onChange(values.filter((v) => v !== optionValue));
    } else {
      onChange([...values, optionValue]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <Container ref={containerRef}>
      <Trigger
        onClick={() => setIsOpen(!isOpen)}
        $isOpen={isOpen}
        $selected={hasSelection}
      >
        <TriggerText $hasValue={hasSelection}>{triggerDisplayText}</TriggerText>
        {hasSelection ? (
          <ClearButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleClearAll();
            }}
            type="button"
          >
            <X size={14} />
          </ClearButton>
        ) : (
          <IconWrapper $isOpen={isOpen} $selected={hasSelection}>
            <ChevronDown size={16} />
          </IconWrapper>
        )}
      </Trigger>

      {isOpen && (
        <DropdownMenu>
          <SearchInputWrapper>
            <Search size={14} className="text-[var(--fg-muted)]" />
            <SearchInput
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              placeholder={placeholder}
            />
          </SearchInputWrapper>
          <OptionList>
            {filteredOptions.length === 0 ? (
              <EmptyState>검색 결과가 없습니다</EmptyState>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = values.includes(option.value);
                return (
                  <MenuItem
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                  >
                    <Checkbox $checked={isSelected}>
                      {isSelected && <Check size={12} />}
                    </Checkbox>
                    <span>{option.label}</span>
                  </MenuItem>
                );
              })
            )}
          </OptionList>
        </DropdownMenu>
      )}
    </Container>
  );
}

const Container = tw.div`
  relative
`;

const Trigger = tw.button<{ $isOpen?: boolean; $selected?: boolean }>`
  h-9
  px-2
  rounded-full
  inline-flex
  justify-center
  items-center
  gap-1
  cursor-pointer
  transition-all
  ${(p) =>
    p.$selected
      ? 'bg-[var(--bg-neutral-solid)]'
      : 'bg-[var(--bg-neutral)] hover:bg-[var(--bg-neutral-glass)]'}
`;

const TriggerText = tw.span<{ $hasValue?: boolean }>`
  text-sm
  font-normal
  whitespace-nowrap
  ${(p) => (p.$hasValue ? 'text-white' : 'text-[var(--fg-neutral)]')}
`;

const IconWrapper = tw.span<{ $isOpen?: boolean; $selected?: boolean }>`
  flex
  items-center
  justify-center
  transition-transform
  ${(p) => (p.$isOpen ? 'rotate-180' : '')}
  ${(p) => (p.$selected ? 'text-white' : 'text-[var(--fg-muted)]')}
`;

const ClearButton = tw.button`
  flex
  items-center
  justify-center
  text-white
  hover:text-white/80
  cursor-pointer
`;

const DropdownMenu = tw.div`
  absolute
  top-[calc(100%+4px)]
  left-0
  min-w-[200px]
  bg-[var(--bg-layer)]
  rounded-lg
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  shadow-lg
  z-50
  overflow-hidden
`;

const SearchInputWrapper = tw.div`
  flex
  items-center
  gap-2
  px-3
  py-2
  border-b
  border-[var(--stroke-neutral)]
`;

const SearchInput = tw.input`
  flex-1
  text-sm
  font-normal
  text-[var(--fg-neutral)]
  placeholder:text-[var(--fg-placeholder)]
  bg-transparent
  outline-none
`;

const OptionList = tw.div`
  max-h-60
  overflow-y-auto
  py-1
`;

const MenuItem = tw.button`
  w-full
  px-3
  py-2
  text-sm
  font-normal
  text-left
  text-[var(--fg-neutral)]
  hover:bg-[var(--bg-neutral-subtle)]
  cursor-pointer
  transition-colors
  flex
  items-center
  gap-2
`;

const Checkbox = tw.div<{ $checked?: boolean }>`
  w-4
  h-4
  rounded
  border
  flex
  items-center
  justify-center
  transition-colors
  ${(p) =>
    p.$checked
      ? 'bg-[var(--bg-neutral-solid)] border-[var(--bg-neutral-solid)] text-white'
      : 'border-[var(--stroke-neutral)] bg-white'}
`;

const EmptyState = tw.div`
  px-3
  py-4
  text-center
  text-[var(--fg-muted)]
  text-sm
  font-normal
`;

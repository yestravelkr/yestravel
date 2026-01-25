/**
 * SearchableSelect - 검색 기능이 있는 단일 선택 드롭다운
 *
 * 상품, 캠페인, 옵션 등의 필터에 사용되는 검색+단일 선택 드롭다운입니다.
 * 선택된 값은 태그 형태로 표시되며 X 버튼으로 선택 해제할 수 있습니다.
 */

import { ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import tw from 'tailwind-styled-components';

export interface SearchableSelectOption {
  /** 옵션 값 */
  value: string;
  /** 옵션 표시 텍스트 */
  label: string;
}

export interface SearchableSelectProps {
  /** 드롭다운 라벨 */
  label?: string;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 현재 선택된 값 (null이면 선택 안됨) */
  value: string | null;
  /** 옵션 목록 */
  options: SearchableSelectOption[];
  /** 선택 변경 시 콜백 */
  onChange: (value: string | null) => void;
  /** 외부 검색 콜백 (API 연동용) */
  onSearch?: (query: string) => void;
}

/**
 * Usage:
 *
 * <SearchableSelect
 *   label="상품"
 *   placeholder="상품 검색"
 *   value={selectedProduct}
 *   options={productOptions}
 *   onChange={setSelectedProduct}
 *   onSearch={(q) => fetchProducts(q)}
 * />
 */
export function SearchableSelect({
  label,
  placeholder = '검색',
  value,
  options,
  onChange,
  onSearch,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // 트리거 표시 텍스트
  const triggerDisplayText = selectedOption
    ? `${label}: ${selectedOption.label}`
    : label || placeholder;

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

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange(null);
  };

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const hasSelection = !!selectedOption;

  return (
    <Container ref={containerRef}>
      <Trigger
        onClick={handleTriggerClick}
        $isOpen={isOpen}
        $selected={hasSelection}
      >
        <TriggerText $hasValue={hasSelection}>{triggerDisplayText}</TriggerText>
        {hasSelection ? (
          <ClearButton
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleClear();
            }}
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
              filteredOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
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

const ClearButton = tw.span`
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
`;

const EmptyState = tw.div`
  px-3
  py-4
  text-center
  text-[var(--fg-muted)]
  text-sm
  font-normal
`;

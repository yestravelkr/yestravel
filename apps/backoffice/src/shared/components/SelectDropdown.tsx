/**
 * SelectDropdown - 커스텀 드롭다운 Select
 *
 * 클릭 시 드롭다운이 열리는 커스텀 Select 컴포넌트입니다.
 * floating-ui를 사용하여 화면 경계에서 자동으로 위치가 조정됩니다.
 *
 * Usage:
 * ```tsx
 * // 테이블 필터용 (기본)
 * <SelectDropdown
 *   options={[{ value: 'all', label: '전체' }]}
 *   value={filter}
 *   onChange={setFilter}
 * />
 *
 * // 폼용
 * <SelectDropdown
 *   variant="form"
 *   options={businessTypeOptions}
 *   value={watch('businessInfo.type')}
 *   onChange={(v) => setValue('businessInfo.type', v)}
 *   error={!!errors.businessInfo?.type}
 *   placeholder="선택해주세요"
 * />
 * ```
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
  size,
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
  value: string | null | undefined;
  /** 값 변경 핸들러 */
  onChange: (value: string) => void;
  /** 드롭다운 스타일 (default: 테이블 필터용, form: 폼 input용) */
  variant?: 'default' | 'form';
  /** 드롭다운 너비 - default variant에서만 사용 */
  width?: number;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 에러 상태 - form variant에서 사용 */
  error?: boolean;
  /** placeholder 텍스트 */
  placeholder?: string;
}

export function SelectDropdown({
  options,
  value,
  onChange,
  variant = 'default',
  width = 160,
  disabled = false,
  error = false,
  placeholder = '선택하세요',
}: SelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: disabled ? undefined : setIsOpen,
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          // form variant일 때 trigger 너비에 맞춤
          if (variant === 'form') {
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width}px`,
            });
          }
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
  });

  const click = useClick(context, { enabled: !disabled });
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

  const isFormVariant = variant === 'form';

  return (
    <>
      {isFormVariant ? (
        <FormTrigger
          ref={refs.setReference}
          type="button"
          $disabled={disabled}
          $error={error}
          $isOpen={isOpen}
          {...getReferenceProps()}
        >
          <TriggerLabel $isPlaceholder={!selectedOption}>
            {selectedOption?.label || placeholder}
          </TriggerLabel>
          <ChevronIcon size={20} $isOpen={isOpen} />
        </FormTrigger>
      ) : (
        <DefaultTrigger
          ref={refs.setReference}
          type="button"
          style={{ width }}
          $disabled={disabled}
          {...getReferenceProps()}
        >
          <TriggerLabel $isPlaceholder={!selectedOption}>
            {selectedOption?.label || placeholder}
          </TriggerLabel>
          <ChevronIcon size={20} $isOpen={isOpen} />
        </DefaultTrigger>
      )}

      {isOpen && (
        <FloatingPortal>
          <Dropdown
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              width: isFormVariant ? undefined : 240,
            }}
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

// ============================================
// Default Trigger (테이블 필터용)
// ============================================

const DefaultTrigger = tw.button<{ $disabled?: boolean }>`
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

// ============================================
// Form Trigger (폼 input용)
// ============================================

const FormTrigger = tw.button<{
  $disabled?: boolean;
  $error?: boolean;
  $isOpen?: boolean;
}>`
  flex items-center justify-between
  gap-2
  w-full
  h-11
  px-4
  bg-white
  border
  rounded-xl
  text-[16.5px]
  leading-[22px]
  text-[var(--fg-neutral,#18181B)]
  cursor-pointer
  transition-colors
  ${({ $isOpen }) => $isOpen && 'ring-2 ring-blue-500'}
  ${({ $error }) =>
    $error
      ? 'border-[var(--stroke-critical,#EB3D3D)]'
      : 'border-[var(--stroke-neutral,#E4E4E7)]'}
  ${({ $disabled }) => $disabled && 'opacity-50 cursor-not-allowed'}
`;

// ============================================
// Common Components
// ============================================

const TriggerLabel = tw.span<{ $isPlaceholder?: boolean }>`
  flex-1
  text-left
  ${({ $isPlaceholder }) =>
    $isPlaceholder && 'text-[var(--fg-placeholder,#9E9E9E)]'}
`;

const ChevronIcon = tw(ChevronDown)<{ $isOpen?: boolean }>`
  text-[var(--fg-muted,#71717A)]
  transition-transform
  shrink-0
  ${({ $isOpen }) => $isOpen && 'rotate-180'}
`;

const Dropdown = tw.div`
  z-50
  p-2
  bg-white
  rounded-[20px]
  shadow-[0px_8px_32px_0px_rgba(0,0,0,0.12),0px_0px_2px_0px_rgba(0,0,0,0.12)]
`;

const DropdownList = tw.div`
  flex flex-col
  max-h-[240px]
  overflow-y-auto
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
  shrink-0
  ${({ $selected }) =>
    $selected
      ? 'bg-[var(--bg-neutral,#f4f4f5)]'
      : 'hover:bg-[var(--bg-neutral,#f4f4f5)]'}
`;

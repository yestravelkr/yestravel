import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import tw from 'tailwind-styled-components';

import { Input } from './Input';

/**
 * TagsInput - 태그 입력 컴포넌트
 *
 * 사용자가 Enter 키 또는 콤마(,)를 눌러 여러 개의 태그를 입력하고 관리할 수 있는 컴포넌트입니다.
 * 입력된 태그는 배지 형태로 표시되며, 각 태그는 개별적으로 삭제할 수 있습니다.
 *
 * 이 컴포넌트는 내부적으로 상태를 관리하며, 단독으로 동작할 수 있습니다.
 * onChange 콜백을 제공하면 태그 변경 시 알림을 받을 수 있습니다.
 */
export interface TagsInputProps {
  /** 초기 태그 목록 (기본값: []) */
  defaultValues?: string[];
  /** 태그 목록이 변경될 때 호출되는 선택적 콜백 */
  onChange?: (tags: string[]) => void;
  /** 입력 필드의 placeholder 텍스트 */
  placeholder?: string;
  /** 최대 태그 개수 제한 */
  maxTags?: number;
  /** 비활성화 상태 */
  disabled?: boolean;
}

export function TagsInput({
  defaultValues = [],
  onChange,
  placeholder = '태그를 입력하고 Enter 또는 콤마(,)를 눌러주세요',
  maxTags,
  disabled = false,
}: TagsInputProps) {
  const [tags, setTags] = useState<string[]>(defaultValues);
  const prevDefaultValuesRef = useRef<string[]>(defaultValues);

  // defaultValues가 실제로 변경되었을 때만 내부 상태를 갱신
  useEffect(() => {
    const normalizedDefaultValues = defaultValues ?? [];
    const prevDefaultValues = prevDefaultValuesRef.current ?? [];

    if (!areArraysEqual(prevDefaultValues, normalizedDefaultValues)) {
      setTags(normalizedDefaultValues);
      prevDefaultValuesRef.current = normalizedDefaultValues;
    }
  }, [defaultValues]);

  // tags가 변경될 때마다 onChange 콜백 호출
  useEffect(() => {
    onChange?.(tags);
  }, [tags, onChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // IME 조합 중 Enter 시 마지막 글자 중복 방지
    if (e.nativeEvent.isComposing || e.key === 'Process') {
      return;
    }

    // Enter 또는 콤마(,)로 태그 확정
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const inputEl = e.currentTarget;
      const trimmedValue = inputEl.value.trim();

      // 빈 문자열, 중복 태그, 최대 개수 제한 검사
      if (!trimmedValue) {
        inputEl.value = '';
        return;
      }

      if (tags.includes(trimmedValue)) {
        inputEl.value = '';
        return;
      }

      if (maxTags && tags.length >= maxTags) {
        inputEl.value = '';
        return;
      }

      setTags((prev) => [...prev, trimmedValue]);
      inputEl.value = '';
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <Container>
      <Input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />

      {tags.length > 0 && (
        <TagsContainer>
          {tags.map((tag) => (
            <TagBadge key={tag}>
              <TagText>{tag}</TagText>
              <RemoveButton
                type="button"
                onClick={() => handleRemoveTag(tag)}
                disabled={disabled}
                aria-label={`${tag} 태그 삭제`}
              >
                ×
              </RemoveButton>
            </TagBadge>
          ))}
        </TagsContainer>
      )}
    </Container>
  );
}

const Container = tw.div`
  flex
  flex-col
  gap-3
`;

const TagsContainer = tw.div`
  flex
  flex-wrap
  gap-2
`;

const TagBadge = tw.div`
  inline-flex
  items-center
  gap-1.5
  px-3
  py-1.5
  bg-gray-100
  text-gray-800
  rounded-full
  text-sm
  font-medium
`;

const TagText = tw.span`
  select-none
`;

const RemoveButton = tw.button`
  flex
  items-center
  justify-center
  w-4
  h-4
  text-gray-500
  hover:text-gray-700
  rounded-full
  hover:bg-gray-200
  transition-colors
  disabled:opacity-50
  disabled:cursor-not-allowed
  disabled:hover:bg-transparent
  disabled:hover:text-gray-500
`;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 두 배열이 동일한 내용을 가지고 있는지 비교하는 헬퍼 함수
 * 순서는 고려하지 않고, 중복이 없다는 전제하에 Set을 활용하여 비교합니다.
 */
function areArraysEqual(arr1: string[], arr2: string[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  const set2 = new Set(arr2);
  return arr1.every((item) => set2.has(item));
}

/**
 * Usage:
 *
 * // 기본 사용 (단독 동작, 상태 관리 불필요)
 * <TagsInput />
 *
 * // 초기값 설정
 * <TagsInput defaultValues={['React', 'TypeScript']} />
 *
 * // onChange 콜백으로 태그 변경 감지
 * <TagsInput
 *   defaultValues={['React']}
 *   onChange={(tags) => console.log('현재 태그:', tags)}
 * />
 *
 * // placeholder 커스터마이징
 * <TagsInput
 *   placeholder="키워드를 입력해주세요"
 * />
 *
 * // 최대 태그 개수 제한
 * <TagsInput
 *   maxTags={5}
 *   onChange={(tags) => {
 *     if (tags.length === 5) {
 *       alert('최대 5개까지만 입력 가능합니다');
 *     }
 *   }}
 * />
 *
 * // 비활성화 상태
 * <TagsInput
 *   defaultValues={['고정된', '태그']}
 *   disabled
 * />
 *
 * // 외부 상태와 동기화 (defaultValues 변경 시 자동 갱신)
 * const [initialTags, setInitialTags] = useState(['Tag1', 'Tag2']);
 * <TagsInput
 *   defaultValues={initialTags}
 *   onChange={(newTags) => {
 *     // 필요한 경우 외부 상태 업데이트
 *     setInitialTags(newTags);
 *   }}
 * />
 */

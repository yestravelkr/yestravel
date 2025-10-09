import type { ReactNode } from 'react';
import { InputHTMLAttributes, forwardRef } from 'react';
import tw from 'tailwind-styled-components';

/**
 * Input - 기본 입력 컴포넌트
 *
 * prefix/postfix를 지원하는 입력 필드 컴포넌트입니다.
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <Input type="text" placeholder="이름을 입력하세요" />
 *
 * // prefix와 함께 사용
 * <Input prefix="https://" type="text" placeholder="domain.com" />
 *
 * // postfix와 함께 사용
 * <Input postfix="원 이상" type="number" />
 *
 * // 에러 상태
 * <Input error type="email" />
 * ```
 */
interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /** 에러 상태 표시 여부 */
  error?: boolean;
  /** 입력 필드 앞에 표시할 ReactNode (예: "https://", 아이콘 등) */
  prefix?: ReactNode;
  /** 입력 필드 뒤에 표시할 ReactNode (예: "원 이상", 버튼 등) */
  postfix?: ReactNode;
}

/**
 * ReactNode를 정규화하여 렌더링 가능한 값만 반환
 * - null/undefined/boolean은 필터링
 * - 문자열은 trim 후 빈 문자열이면 null 반환
 * - 그 외 ReactNode는 그대로 반환
 */
function normalizeAffix(affix: ReactNode): ReactNode {
  if (affix == null || typeof affix === 'boolean') {
    return null;
  }
  if (typeof affix === 'string') {
    const trimmed = affix.trim();
    return trimmed === '' ? null : trimmed;
  }
  return affix;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, prefix, postfix, type = 'text', ...props }, ref) => {
    // type이 'hidden'인 경우 래퍼 없이 바로 input만 렌더링
    if (type === 'hidden') {
      return <input ref={ref} type={type} {...props} />;
    }

    const prefixContent = normalizeAffix(prefix);
    const postfixContent = normalizeAffix(postfix);

    return (
      <InputWrapper className={className} $error={error}>
        {prefixContent && <Affix>{prefixContent}</Affix>}
        <StyledInput ref={ref} type={type} {...props} />
        {postfixContent && <Affix>{postfixContent}</Affix>}
      </InputWrapper>
    );
  },
);

Input.displayName = 'Input';

const StyledInput = tw.input`
  flex-1
  outline-none
  bg-transparent
  placeholder:text-gray-400
`;

const InputWrapper = tw.div<{ $error?: boolean }>`
  flex
  items-center
  w-full
  gap-2
  px-4
  py-2
  rounded-lg
  shadow-sm
  focus-within:ring-2
  ${(p) => (p.$error ? 'focus-within:ring-red-500' : 'focus-within:ring-blue-500')}
`;

const Affix = tw.div`
  flex
  items-center
  justify-start
  flex-[0_0_auto]
  bg-[var(--bg-field,_white)]
  rounded-xl
  text-[var(--fg-muted)]
  text-base
  font-normal
  leading-normal
  break-words
`;

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
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 에러 상태 표시 여부 */
  error?: boolean;
  /** 입력 필드 앞에 표시할 텍스트 (예: "https://") */
  prefix?: string;
  /** 입력 필드 뒤에 표시할 텍스트 (예: "원 이상") */
  postfix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, prefix, postfix, type = 'text', ...props }, ref) => {
    // type이 'hidden'인 경우 래퍼 없이 바로 input만 렌더링
    if (type === 'hidden') {
      return <input ref={ref} type={type} {...props} />;
    }

    // prefix/postfix trim 처리
    const trimmedPrefix = prefix?.trim();
    const trimmedPostfix = postfix?.trim();

    return (
      <InputWrapper className={className} $error={error}>
        {trimmedPrefix && <Affix>{trimmedPrefix}</Affix>}
        <StyledInput ref={ref} type={type} {...props} />
        {trimmedPostfix && <Affix>{trimmedPostfix}</Affix>}
      </InputWrapper>
    );
  },
);

Input.displayName = 'Input';

// 래퍼 내부에서 사용하는 input - border는 wrapper에서 처리
const StyledInput = tw.input`
  flex-1
  outline-none
  bg-transparent
  placeholder:text-gray-400
`;

// prefix/postfix 래퍼 - 포커스 스타일을 관리
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

// 명
const Affix = tw.div`
  flex
  items-center
  justify-start
  flex-[0_0_auto]
  bg-[var(--bg-field,_white)]
  rounded-xl
  text-fg-muted
  text-base
  font-normal
  leading-normal
  break-words
`;

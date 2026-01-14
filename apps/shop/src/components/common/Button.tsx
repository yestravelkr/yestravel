/**
 * Button - 공통 버튼 컴포넌트
 *
 * 다양한 variant와 size를 지원하는 버튼 컴포넌트입니다.
 *
 * Usage:
 * <Button onClick={handleClick}>확인</Button>
 * <Button variant="kakao" onClick={handleKakao}><KakaoIcon />카카오로 시작하기</Button>
 * <Button variant="naver" onClick={handleNaver}><NaverIcon />네이버로 시작하기</Button>
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';
import tw from 'tailwind-styled-components';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 스타일 variant */
  variant?: 'primary' | 'outline' | 'kakao' | 'naver';
  /** 버튼 크기 */
  size?: 'medium' | 'large' | 'xlarge';
}

/**
 * Usage:
 * <Button onClick={handleClick}>확인</Button>
 * <Button variant="kakao"><KakaoIcon />카카오로 시작하기</Button>
 * <Button disabled>비활성</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'large', children, ...props }, ref) => {
    if (variant === 'kakao') {
      return (
        <KakaoButton ref={ref} $size={size} {...props}>
          {children}
        </KakaoButton>
      );
    }

    if (variant === 'naver') {
      return (
        <NaverButton ref={ref} $size={size} {...props}>
          {children}
        </NaverButton>
      );
    }

    if (variant === 'outline') {
      return (
        <OutlineButton ref={ref} $size={size} {...props}>
          {children}
        </OutlineButton>
      );
    }

    return (
      <PrimaryButton ref={ref} $size={size} {...props}>
        {children}
      </PrimaryButton>
    );
  }
);

Button.displayName = 'Button';

// Styled Components
type ButtonSize = 'medium' | 'large' | 'xlarge';

const getButtonHeight = (size: ButtonSize) => {
  switch (size) {
    case 'xlarge':
      return 'h-[52px]';
    case 'large':
      return 'h-[52px]';
    case 'medium':
      return 'h-[44px]';
    default:
      return 'h-[52px]';
  }
};

const PrimaryButton = tw.button<{ $size: ButtonSize }>`
  w-full
  px-4
  rounded-xl
  flex
  items-center
  justify-center
  gap-1
  text-[16.5px]
  font-medium
  leading-[22px]
  transition-colors
  hover:opacity-90
  disabled:cursor-not-allowed
  bg-bg-neutral-solid
  text-fg-on-surface
  disabled:bg-bg-disabled
  disabled:text-fg-disabled
  ${({ $size }) => getButtonHeight($size)}
`;

const OutlineButton = tw.button<{ $size: ButtonSize }>`
  px-3
  rounded-xl
  flex
  items-center
  justify-center
  gap-1
  text-[16.5px]
  font-medium
  leading-[22px]
  transition-colors
  hover:bg-bg-neutral-subtle
  disabled:cursor-not-allowed
  bg-white
  text-fg-neutral
  border
  border-[var(--stroke-neutral)]
  disabled:bg-bg-disabled
  disabled:text-fg-disabled
  disabled:border-transparent
  ${({ $size }) => getButtonHeight($size)}
`;

const KakaoButton = tw.button<{ $size: ButtonSize }>`
  w-full
  px-4
  rounded-xl
  flex
  items-center
  justify-center
  gap-1
  text-[16.5px]
  font-medium
  leading-[22px]
  transition-colors
  hover:opacity-90
  disabled:cursor-not-allowed
  bg-[#FEE500]
  text-fg-neutral
  disabled:bg-bg-disabled
  disabled:text-fg-disabled
  ${({ $size }) => getButtonHeight($size)}
`;

const NaverButton = tw.button<{ $size: ButtonSize }>`
  w-full
  px-4
  rounded-xl
  flex
  items-center
  justify-center
  gap-1
  text-[16.5px]
  font-medium
  leading-[22px]
  transition-colors
  hover:opacity-90
  disabled:cursor-not-allowed
  bg-[#02C75A]
  text-white
  disabled:bg-bg-disabled
  disabled:text-fg-disabled
  ${({ $size }) => getButtonHeight($size)}
`;

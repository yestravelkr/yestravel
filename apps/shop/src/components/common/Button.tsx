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
  variant?: 'primary' | 'kakao' | 'naver';
  /** 버튼 크기 */
  size?: 'medium' | 'large';
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

    return (
      <PrimaryButton ref={ref} $size={size} {...props}>
        {children}
      </PrimaryButton>
    );
  }
);

Button.displayName = 'Button';

// Styled Components
const PrimaryButton = tw.button<{ $size: 'medium' | 'large' }>`
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
  ${({ $size }) => ($size === 'large' ? 'h-[52px]' : 'h-[44px]')}
`;

const KakaoButton = tw.button<{ $size: 'medium' | 'large' }>`
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
  ${({ $size }) => ($size === 'large' ? 'h-[52px]' : 'h-[44px]')}
`;

const NaverButton = tw.button<{ $size: 'medium' | 'large' }>`
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
  ${({ $size }) => ($size === 'large' ? 'h-[52px]' : 'h-[44px]')}
`;

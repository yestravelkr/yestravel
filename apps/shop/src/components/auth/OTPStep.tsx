/**
 * OTPStep - OTP 인증번호 입력 컴포넌트
 *
 * 6자리 인증번호 입력과 재발송 기능을 제공합니다.
 *
 * Usage:
 * <OTPStep
 *   otpCode={otpCode}
 *   onOtpChange={handleOtpChange}
 *   onVerify={handleVerifyOTP}
 *   countdown={countdown}
 *   isLoading={isLoading}
 *   error={error}
 * />
 */

import { useEffect, useRef } from 'react';
import tw from 'tailwind-styled-components';

import { Button } from '@/components/common';

export interface OTPStepProps {
  phoneNumber: string;
  otpCode: string[];
  onOtpChange: (newOtp: string[]) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  countdown: number;
  isLoading: boolean;
  error: string | null;
}

export function OTPStep({
  otpCode,
  onOtpChange,
  onVerify,
  countdown,
  isLoading,
  error,
}: OTPStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const otpValue = otpCode.join('');

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const formatCountdown = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    const newOtp = value.split('').concat(Array(6).fill('')).slice(0, 6);
    onOtpChange(newOtp);
  };

  return (
    <StepContent>
      {/* 상단 라운드 여백 */}
      <TopSpacer />

      {/* 타이틀 */}
      <Title>인증번호를 입력해 주세요.</Title>

      {/* 인증번호 입력 섹션 */}
      <Section>
        <SectionLabel>인증번호</SectionLabel>
        <InputWrapper>
          <OTPInput
            ref={inputRef}
            type="tel"
            inputMode="numeric"
            placeholder="숫자만 입력해 주세요."
            value={otpValue}
            onChange={handleInputChange}
            maxLength={6}
          />
          <TimerText>{formatCountdown(countdown)}</TimerText>
        </InputWrapper>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Section>

      <Button onClick={onVerify} disabled={otpValue.length !== 6 || isLoading}>
        {isLoading ? '확인 중...' : '확인'}
      </Button>
    </StepContent>
  );
}

// Styled Components
const StepContent = tw.div`
  px-5
  pb-5
  bg-white
  flex
  flex-col
  gap-5
`;

const TopSpacer = tw.div`
  h-3
`;

const Title = tw.h2`
  text-fg-neutral
  text-[21px]
  font-bold
  leading-7
`;

const Section = tw.div`
  flex
  flex-col
  gap-2
`;

const SectionLabel = tw.p`
  text-fg-muted
  text-[15px]
  font-normal
  leading-5
`;

const InputWrapper = tw.div`
  h-[44px]
  px-3
  bg-bg-field
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  flex
  items-center
  gap-2
  focus-within:outline-[var(--stroke-primary)]
`;

const OTPInput = tw.input`
  flex-1
  bg-transparent
  text-fg-neutral
  text-[16.5px]
  font-normal
  placeholder:text-fg-placeholder
  outline-none
`;

const TimerText = tw.span`
  text-fg-muted
  text-[16.5px]
  font-normal
  shrink-0
`;

const ErrorMessage = tw.p`
  text-fg-critical
  text-sm
`;

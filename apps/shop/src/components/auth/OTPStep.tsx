/**
 * OTPStep - OTP 인증번호 입력 컴포넌트
 *
 * 6자리 인증번호 입력과 재발송 기능을 제공합니다.
 *
 * Usage:
 * <OTPStep
 *   phoneNumber={phoneNumber}
 *   otpCode={otpCode}
 *   onOtpChange={handleOtpChange}
 *   onVerify={handleVerifyOTP}
 *   onResend={handleResendOTP}
 *   onBack={handleBack}
 *   countdown={countdown}
 *   isLoading={isLoading}
 *   error={error}
 * />
 */

import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';
import tw from 'tailwind-styled-components';

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
  phoneNumber,
  otpCode,
  onOtpChange,
  onVerify,
  onResend,
  onBack,
  countdown,
  isLoading,
  error,
}: OTPStepProps) {
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const maskedPhone = phoneNumber
    ? `${phoneNumber.slice(0, 3)}****${phoneNumber.slice(-4)}`
    : '';

  const formatCountdown = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleOtpInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    onOtpChange(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <>
      <OTPHeader>
        <BackButton onClick={onBack}>
          <ArrowLeft size={20} />
        </BackButton>
        <OTPHeaderTitle>인증번호 입력</OTPHeaderTitle>
        <BackButtonPlaceholder />
      </OTPHeader>

      <StepContent>
        <OTPDescription>
          {maskedPhone}로 발송된 인증번호를 입력해주세요
        </OTPDescription>

        <OTPInputContainer>
          {otpCode.map((digit, index) => (
            <OTPDigitInput
              key={index}
              ref={el => {
                otpInputRefs.current[index] = el;
              }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpInputChange(index, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(index, e)}
            />
          ))}
        </OTPInputContainer>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <TimerContainer>
          <TimerText>{formatCountdown(countdown)} 남음</TimerText>
          <ResendButton onClick={onResend} disabled={countdown > 0}>
            재발송
          </ResendButton>
        </TimerContainer>
      </StepContent>

      <StepFooter>
        <PrimaryButton
          onClick={onVerify}
          disabled={otpCode.join('').length !== 6 || isLoading}
        >
          {isLoading ? '확인 중...' : '확인'}
        </PrimaryButton>
      </StepFooter>
    </>
  );
}

// Styled Components
const OTPHeader = tw.div`
  px-5
  py-4
  bg-white
  flex
  items-center
  justify-between
`;

const BackButton = tw.button`
  w-10
  h-10
  flex
  items-center
  justify-center
  text-fg-neutral
  hover:bg-bg-neutral-subtle
  rounded-xl
  transition-colors
`;

const BackButtonPlaceholder = tw.div`
  w-10
  h-10
`;

const OTPHeaderTitle = tw.h2`
  text-fg-neutral
  text-lg
  font-bold
`;

const StepContent = tw.div`
  p-5
  bg-white
  flex
  flex-col
  gap-4
`;

const StepFooter = tw.div`
  p-5
  bg-white
  border-t
  border-[var(--stroke-neutral)]
`;

const OTPDescription = tw.p`
  text-fg-muted
  text-sm
  text-center
`;

const OTPInputContainer = tw.div`
  flex
  gap-2
  justify-center
  py-4
`;

const OTPDigitInput = tw.input`
  w-12
  h-14
  text-center
  text-2xl
  font-bold
  bg-bg-field
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  text-fg-neutral
  focus:outline-[var(--stroke-primary)]
`;

const TimerContainer = tw.div`
  flex
  items-center
  justify-center
  gap-3
`;

const TimerText = tw.span`
  text-fg-muted
  text-sm
`;

const ResendButton = tw.button`
  text-fg-primary
  text-sm
  font-medium
  disabled:text-fg-muted
  disabled:cursor-not-allowed
`;

const PrimaryButton = tw.button`
  w-full
  h-12
  px-4
  bg-bg-neutral-solid
  rounded-xl
  text-fg-on-surface
  text-base
  font-medium
  leading-5
  hover:opacity-90
  transition-opacity
  disabled:opacity-50
  disabled:cursor-not-allowed
`;

const ErrorMessage = tw.p`
  text-fg-critical
  text-sm
`;

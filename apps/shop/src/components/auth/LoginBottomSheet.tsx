/**
 * LoginBottomSheet - 로그인 바텀시트 컴포넌트
 *
 * SMS 인증과 소셜 로그인을 지원하는 로그인 바텀시트입니다.
 * react-snappy-modal을 사용하여 바텀시트로 표시됩니다.
 *
 * Usage:
 * const result = await openLoginBottomSheet();
 * if (result?.success) {
 *   // 로그인 성공 처리
 * }
 */

import { ArrowLeft } from 'lucide-react';
import { useRef, useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';

export interface LoginResult {
  success: boolean;
  isNewMember: boolean;
}

type Step = 'login' | 'otp';

function LoginBottomSheet() {
  const { resolveModal } = useCurrentModal();
  const keyboardHeight = useKeyboardHeight();

  const [step, setStep] = useState<Step>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(180);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 전화번호 유효성 검사
  const isValidPhoneNumber = /^01[0-9]{8,9}$/.test(phoneNumber);

  // 닫기
  const handleClose = () => {
    resolveModal(null);
  };

  // 연락처 인증 버튼 클릭
  const handleRequestOTP = () => {
    if (!isValidPhoneNumber) {
      setError('올바른 전화번호 형식이 아닙니다');
      return;
    }

    setError(null);
    setIsLoading(true);

    // TODO: API 연동 - shopAuth.requestVerification
    setTimeout(() => {
      setIsLoading(false);
      setCountdown(180);
      setStep('otp');
      // 첫 번째 OTP 입력에 포커스
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    }, 500);
  };

  // OTP 입력 핸들러
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value.slice(-1);
    setOtpCode(newOtp);

    // 다음 입력으로 포커스 이동
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // OTP 백스페이스 핸들러
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // OTP 확인
  const handleVerifyOTP = () => {
    const code = otpCode.join('');
    if (code.length !== 6) {
      setError('인증번호 6자리를 입력해주세요');
      return;
    }

    setError(null);
    setIsLoading(true);

    // TODO: API 연동 - shopAuth.verifyCode
    setTimeout(() => {
      setIsLoading(false);
      resolveModal({ success: true, isNewMember: false });
    }, 500);
  };

  // 재발송
  const handleResendOTP = () => {
    setOtpCode(['', '', '', '', '', '']);
    setCountdown(180);
    setError(null);
    // TODO: API 연동 - shopAuth.requestVerification
  };

  // 소셜 로그인
  const handleSocialLogin = (provider: 'kakao' | 'naver') => {
    // TODO: OAuth 연동
    console.log(`${provider} 로그인 시작`);
  };

  // 뒤로가기
  const handleBack = () => {
    setStep('login');
    setOtpCode(['', '', '', '', '', '']);
    setError(null);
  };

  // 마스킹된 전화번호
  const maskedPhone = phoneNumber
    ? `${phoneNumber.slice(0, 3)}****${phoneNumber.slice(-4)}`
    : '';

  // 카운트다운 포맷
  const formatCountdown = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <Overlay onClick={handleClose}>
      <BottomSheetContainer
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{ marginBottom: keyboardHeight }}
      >
        {/* 드래그 핸들 */}
        <HandleWrapper>
          <Handle />
        </HandleWrapper>

        {/* Step 1: 로그인 폼 */}
        {step === 'login' && (
          <StepContent>
            {/* 비회원 로그인 섹션 */}
            <Section>
              <SectionTitle>비회원으로 시작하기</SectionTitle>
              <PhoneInput
                type="tel"
                inputMode="numeric"
                placeholder="01012345678"
                value={phoneNumber}
                onChange={e => {
                  setPhoneNumber(e.target.value.replace(/\D/g, ''));
                  setError(null);
                }}
                maxLength={11}
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
              <PrimaryButton
                onClick={handleRequestOTP}
                disabled={!isValidPhoneNumber || isLoading}
              >
                {isLoading ? '발송 중...' : '연락처 인증'}
              </PrimaryButton>
            </Section>

            {/* 구분선 */}
            <Divider>
              <DividerLine />
              <DividerText>OR</DividerText>
              <DividerLine />
            </Divider>

            {/* SNS 로그인 섹션 */}
            <Section>
              <SectionTitle>SNS 로그인</SectionTitle>
              <SocialButton
                $provider="kakao"
                onClick={() => handleSocialLogin('kakao')}
              >
                <KakaoIcon />
                카카오로 시작하기
              </SocialButton>
              <SocialButton
                $provider="naver"
                onClick={() => handleSocialLogin('naver')}
              >
                <NaverIcon />
                네이버로 시작하기
              </SocialButton>
            </Section>
          </StepContent>
        )}

        {/* Step 2: OTP 입력 */}
        {step === 'otp' && (
          <>
            <OTPHeader>
              <BackButton onClick={handleBack}>
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
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(index, e)}
                  />
                ))}
              </OTPInputContainer>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <TimerContainer>
                <TimerText>{formatCountdown(countdown)} 남음</TimerText>
                <ResendButton
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                >
                  재발송
                </ResendButton>
              </TimerContainer>
            </StepContent>

            <StepFooter>
              <PrimaryButton
                onClick={handleVerifyOTP}
                disabled={otpCode.join('').length !== 6 || isLoading}
              >
                {isLoading ? '확인 중...' : '확인'}
              </PrimaryButton>
            </StepFooter>
          </>
        )}
      </BottomSheetContainer>
    </Overlay>
  );
}

/**
 * 카카오 아이콘 SVG
 */
function KakaoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 0.5C4.02944 0.5 0 3.69162 0 7.64706C0 10.1299 1.55878 12.3166 3.93157 13.5883L2.93553 17.0641C2.85763 17.3429 3.18066 17.5614 3.42439 17.3976L7.56836 14.6197C8.03619 14.6834 8.51375 14.7178 9 14.7178C13.9706 14.7178 18 11.5262 18 7.57088C18 3.61556 13.9706 0.5 9 0.5Z"
        fill="#191919"
      />
    </svg>
  );
}

/**
 * 네이버 아이콘 SVG
 */
function NaverIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M10.8493 8.56267L4.91733 0H0V16H5.15067V7.43733L11.0827 16H16V0H10.8493V8.56267Z"
        fill="white"
      />
    </svg>
  );
}

/**
 * 바텀시트를 여는 함수
 */
export function openLoginBottomSheet(): Promise<LoginResult | null> {
  return SnappyModal.show(<LoginBottomSheet />, {
    position: 'bottom-center',
  });
}

// Styled Components
const Overlay = tw.div`
  fixed
  inset-0
  bg-black/40
  flex
  flex-col
  justify-end
  items-center
  z-50
`;

const BottomSheetContainer = tw.div`
  w-full
  max-w-[600px]
  bg-bg-layer
  rounded-t-[32px]
  flex
  flex-col
  overflow-hidden
  transition-all
  duration-200
`;

const HandleWrapper = tw.div`
  px-5
  pt-3
  pb-2
  bg-white
  flex
  flex-col
  items-center
`;

const Handle = tw.div`
  w-12
  h-1
  bg-[var(--stroke-neutral)]
  rounded-sm
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

const Section = tw.div`
  flex
  flex-col
  gap-3
`;

const SectionTitle = tw.h3`
  text-fg-neutral
  text-base
  font-semibold
  leading-5
`;

const PhoneInput = tw.input`
  h-12
  px-4
  bg-bg-field
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  text-fg-neutral
  text-base
  font-normal
  placeholder:text-fg-muted
  focus:outline-[var(--stroke-primary)]
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

const Divider = tw.div`
  flex
  items-center
  gap-4
  py-2
`;

const DividerLine = tw.div`
  flex-1
  h-px
  bg-[var(--stroke-neutral)]
`;

const DividerText = tw.span`
  text-fg-muted
  text-sm
  font-medium
`;

const SocialButton = tw.button<{ $provider: 'kakao' | 'naver' }>`
  w-full
  h-12
  px-4
  rounded-xl
  flex
  items-center
  justify-center
  gap-2
  font-medium
  transition-opacity
  hover:opacity-90
  ${({ $provider }) =>
    $provider === 'kakao'
      ? 'bg-[#FEE500] text-[#191919]'
      : 'bg-[#03C75A] text-white'}
`;

const ErrorMessage = tw.p`
  text-fg-critical
  text-sm
`;

// OTP Step Styles
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

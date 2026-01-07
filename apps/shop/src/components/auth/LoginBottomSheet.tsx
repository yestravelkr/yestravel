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

import { useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import tw from 'tailwind-styled-components';

import { LoginStep } from './LoginStep';
import { OTPStep } from './OTPStep';

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

  const isValidPhoneNumber = /^01[0-9]{8,9}$/.test(phoneNumber);

  const handleClose = () => {
    resolveModal(null);
  };

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
    }, 500);
  };

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

  const handleResendOTP = () => {
    setOtpCode(['', '', '', '', '', '']);
    setCountdown(180);
    setError(null);
    // TODO: API 연동 - shopAuth.requestVerification
  };

  const handleSocialLogin = (provider: 'kakao' | 'naver') => {
    // TODO: OAuth 연동
    console.log(`${provider} 로그인 시작`);
  };

  const handleBack = () => {
    setStep('login');
    setOtpCode(['', '', '', '', '', '']);
    setError(null);
  };

  const handleErrorClear = () => {
    setError(null);
  };

  return (
    <Overlay onClick={handleClose}>
      <BottomSheetContainer
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{ marginBottom: keyboardHeight }}
      >
        <HandleWrapper>
          <Handle />
        </HandleWrapper>

        {step === 'login' && (
          <LoginStep
            phoneNumber={phoneNumber}
            onPhoneNumberChange={setPhoneNumber}
            onRequestOTP={handleRequestOTP}
            onSocialLogin={handleSocialLogin}
            isLoading={isLoading}
            error={error}
            onErrorClear={handleErrorClear}
          />
        )}

        {step === 'otp' && (
          <OTPStep
            phoneNumber={phoneNumber}
            otpCode={otpCode}
            onOtpChange={setOtpCode}
            onVerify={handleVerifyOTP}
            onResend={handleResendOTP}
            onBack={handleBack}
            countdown={countdown}
            isLoading={isLoading}
            error={error}
          />
        )}
      </BottomSheetContainer>
    </Overlay>
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

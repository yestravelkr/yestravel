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
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { LoginStep } from './LoginStep';
import { OTPStep } from './OTPStep';

import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import {
  EMPTY_OTP_CODE,
  isValidPhoneNumber,
  OTP_COUNTDOWN_SECONDS,
  OTP_LENGTH,
  codeToArray,
  redirectToSocialLogin,
  type SocialProvider,
} from '@/shared/auth';
import { trpc } from '@/shared/trpc/trpc';
import { useAuthStore } from '@/store/authStore';

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
  const [otpCode, setOtpCode] = useState<string[]>(EMPTY_OTP_CODE);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(OTP_COUNTDOWN_SECONDS);

  const isPhoneValid = isValidPhoneNumber(phoneNumber);

  // SMS 인증번호 요청
  const requestVerificationMutation =
    trpc.shopAuth.requestVerification.useMutation();

  // SMS 인증번호 확인 및 로그인
  const verifyCodeMutation = trpc.shopAuth.verifyCode.useMutation({
    onSuccess: data => {
      useAuthStore
        .getState()
        .login(
          { accessToken: data.accessToken, refreshToken: data.refreshToken },
          data.member
        );
      toast.success('로그인 성공!');
      resolveModal({ success: true, isNewMember: false });
    },
  });

  const handleClose = () => {
    resolveModal(null);
  };

  const handleRequestOTP = async () => {
    if (!isPhoneValid) {
      setError('올바른 전화번호 형식이 아닙니다');
      return;
    }

    setError(null);

    try {
      const result = await requestVerificationMutation.mutateAsync({
        phone: phoneNumber,
      });

      setCountdown(OTP_COUNTDOWN_SECONDS);
      setStep('otp');

      // 개발환경에서 인증번호 자동 입력
      if (result.code) {
        setOtpCode(codeToArray(result.code));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '인증번호 발송에 실패했습니다'
      );
    }
  };

  const handleVerifyOTP = async () => {
    const code = otpCode.join('');
    if (code.length !== OTP_LENGTH) {
      setError(`인증번호 ${OTP_LENGTH}자리를 입력해주세요`);
      return;
    }

    setError(null);

    try {
      await verifyCodeMutation.mutateAsync({
        phone: phoneNumber,
        code,
      });
      // 성공 시 onSuccess에서 처리됨
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증에 실패했습니다');
    }
  };

  const handleResendOTP = async () => {
    setOtpCode(EMPTY_OTP_CODE);
    setError(null);

    try {
      const result = await requestVerificationMutation.mutateAsync({
        phone: phoneNumber,
      });

      setCountdown(OTP_COUNTDOWN_SECONDS);

      // 개발환경에서 인증번호 자동 입력
      if (result.code) {
        setOtpCode(codeToArray(result.code));
      }

      toast.success('인증번호가 재발송되었습니다');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '인증번호 발송에 실패했습니다'
      );
    }
  };

  const handleSocialLogin = (provider: SocialProvider) => {
    redirectToSocialLogin(provider);
  };

  const handleBack = () => {
    setStep('login');
    setOtpCode(EMPTY_OTP_CODE);
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
        {step === 'login' && (
          <LoginStep
            phoneNumber={phoneNumber}
            onPhoneNumberChange={setPhoneNumber}
            onRequestOTP={handleRequestOTP}
            onSocialLogin={handleSocialLogin}
            isLoading={requestVerificationMutation.isPending}
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
            onClose={handleClose}
            countdown={countdown}
            isLoading={verifyCodeMutation.isPending}
            isResending={requestVerificationMutation.isPending}
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
  flex
  flex-col
  overflow-hidden
  transition-all
  duration-200
`;

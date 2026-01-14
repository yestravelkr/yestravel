/**
 * 소셜 로그인 후 연락처 인증 페이지
 *
 * 소셜 로그인 후 휴대폰 인증을 통해 회원가입을 완료합니다.
 *
 * URL: /auth/complete-profile?token={pendingToken}&name={name}&returnUrl={returnUrl}
 */

import { createFileRoute } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import SnappyModal, { useCurrentModal } from 'react-snappy-modal';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { OTPStep } from '@/components/auth/OTPStep';
import { Button } from '@/components/common';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import {
  codeToArray,
  EMPTY_OTP_CODE,
  isValidPhoneNumber,
  OTP_COUNTDOWN_SECONDS,
  OTP_LENGTH,
  redirectToSocialLogin,
  saveTokens,
} from '@/shared/auth';
import { trpc } from '@/shared/trpc/trpc';

export const Route = createFileRoute('/auth/complete-profile')({
  component: CompleteProfilePage,
});

function CompleteProfilePage() {
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token');
  const returnUrl = searchParams.get('returnUrl') || '/';

  const [phoneNumber, setPhoneNumber] = useState('');

  const isPhoneValid = isValidPhoneNumber(phoneNumber);

  // SMS 인증번호 요청
  const requestVerificationMutation =
    trpc.shopAuth.requestVerification.useMutation();

  // 소셜 가입 완료
  const completeSocialRegistrationMutation =
    trpc.shopAuth.completeSocialRegistration.useMutation({
      onSuccess: data => {
        saveTokens(data);
        toast.success('회원가입이 완료되었습니다!');
        window.location.href = returnUrl;
      },
    });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value.replace(/\D/g, ''));
  };

  const handleClose = () => {
    window.location.href = returnUrl;
  };

  // 카카오 로그인으로 리다이렉트
  const handleTokenExpired = () => {
    redirectToSocialLogin('kakao', returnUrl);
  };

  const handleRequestVerification = async () => {
    if (!isPhoneValid || !token) return;

    try {
      const result = await requestVerificationMutation.mutateAsync({
        phone: phoneNumber,
      });

      // OTP 바텀시트 열기
      await SnappyModal.show(
        <OTPBottomSheet
          phoneNumber={phoneNumber}
          pendingToken={token}
          returnUrl={returnUrl}
          initialCode={result.code}
          completeSocialRegistrationMutation={
            completeSocialRegistrationMutation
          }
          requestVerificationMutation={requestVerificationMutation}
          onTokenExpired={handleTokenExpired}
        />,
        { position: 'bottom-center' }
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : '인증번호 발송에 실패했습니다'
      );
    }
  };

  // 토큰이 없으면 에러
  if (!token) {
    return (
      <Container>
        <PageWrapper>
          <ErrorContainer>
            <ErrorIconWrapper>!</ErrorIconWrapper>
            <ErrorText>잘못된 접근입니다.</ErrorText>
            <GoBackButton onClick={() => (window.location.href = '/')}>
              홈으로 이동
            </GoBackButton>
          </ErrorContainer>
        </PageWrapper>
      </Container>
    );
  }

  return (
    <Container>
      <PageWrapper>
        {/* 헤더 */}
        <Header>
          <CloseButton onClick={handleClose}>
            <X size={24} />
          </CloseButton>
        </Header>

        <Content>
          {/* 타이틀 */}
          <TitleSection>
            <Title>
              안전한 거래를 위해
              <br />
              연락처 인증이 필요해요.
            </Title>
          </TitleSection>

          {/* 연락처 입력 */}
          <InputSection>
            <InputLabel>연락처</InputLabel>
            <PhoneInput
              type="tel"
              inputMode="numeric"
              placeholder="010"
              value={phoneNumber}
              onChange={handlePhoneChange}
              maxLength={11}
            />
          </InputSection>
        </Content>

        {/* 하단 버튼 */}
        <BottomSection>
          <Button
            size="xlarge"
            onClick={handleRequestVerification}
            disabled={!isPhoneValid || requestVerificationMutation.isPending}
          >
            {requestVerificationMutation.isPending
              ? '발송 중...'
              : '연락처 인증'}
          </Button>
        </BottomSection>
      </PageWrapper>
    </Container>
  );
}

/**
 * OTP 인증 바텀시트
 */
interface OTPBottomSheetProps {
  phoneNumber: string;
  pendingToken: string;
  returnUrl: string;
  initialCode?: string;
  completeSocialRegistrationMutation: ReturnType<
    typeof trpc.shopAuth.completeSocialRegistration.useMutation
  >;
  requestVerificationMutation: ReturnType<
    typeof trpc.shopAuth.requestVerification.useMutation
  >;
  onTokenExpired: () => void;
}

function OTPBottomSheet({
  phoneNumber,
  pendingToken,
  initialCode,
  completeSocialRegistrationMutation,
  requestVerificationMutation,
  onTokenExpired,
}: OTPBottomSheetProps) {
  const { resolveModal } = useCurrentModal();
  const keyboardHeight = useKeyboardHeight();

  const [otpCode, setOtpCode] = useState<string[]>(
    initialCode ? codeToArray(initialCode) : EMPTY_OTP_CODE
  );
  const [countdown, setCountdown] = useState(OTP_COUNTDOWN_SECONDS);
  const [error, setError] = useState<string | null>(null);

  // 카운트다운 타이머
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleClose = () => {
    resolveModal(null);
  };

  const handleVerify = async () => {
    const code = otpCode.join('');
    if (code.length !== OTP_LENGTH) {
      setError(`인증번호 ${OTP_LENGTH}자리를 입력해주세요`);
      return;
    }

    setError(null);

    try {
      await completeSocialRegistrationMutation.mutateAsync({
        pendingToken,
        phone: phoneNumber,
        code,
      });
      // 성공 시 onSuccess에서 처리됨
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '인증에 실패했습니다';

      // pendingToken 만료 에러 처리
      if (
        errorMessage.includes('만료') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('invalid')
      ) {
        resolveModal(null);
        window.alert('인증 시간이 만료되었습니다. 다시 로그인해주세요.');
        onTokenExpired();
        return;
      }

      setError(errorMessage);
    }
  };

  const handleResend = async () => {
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

  return (
    <Overlay onClick={handleClose}>
      <BottomSheetContainer
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        style={{ marginBottom: keyboardHeight }}
      >
        <OTPStep
          otpCode={otpCode}
          onOtpChange={setOtpCode}
          onVerify={handleVerify}
          onResend={handleResend}
          onClose={handleClose}
          countdown={countdown}
          isLoading={completeSocialRegistrationMutation.isPending}
          isResending={requestVerificationMutation.isPending}
          error={error}
        />
      </BottomSheetContainer>
    </Overlay>
  );
}

// Styled Components
const Container = tw.div`
  min-h-screen
  bg-bg-layer-base
  max-w-[600px]
  mx-auto
`;

const PageWrapper = tw.div`
  min-h-screen
  bg-white
  flex
  flex-col
`;

const Header = tw.header`
  flex
  items-center
  h-16
  px-5
`;

const CloseButton = tw.button`
  w-6
  h-6
  flex
  items-center
  justify-center
  text-fg-neutral
`;

const Content = tw.div`
  flex-1
  flex
  flex-col
  px-5
  gap-5
`;

const TitleSection = tw.div`
  flex
  flex-col
`;

const Title = tw.h1`
  text-fg-neutral
  text-[21px]
  font-bold
  leading-7
`;

const InputSection = tw.div`
  flex
  flex-col
  gap-2
`;

const InputLabel = tw.p`
  text-fg-muted
  text-[15px]
  font-normal
  leading-5
`;

const PhoneInput = tw.input`
  h-[44px]
  px-3
  bg-bg-field
  rounded-xl
  outline
  outline-1
  outline-offset-[-1px]
  outline-[var(--stroke-neutral)]
  text-fg-neutral
  text-[16.5px]
  font-normal
  placeholder:text-fg-placeholder
  focus:outline-[var(--stroke-primary)]
`;

const BottomSection = tw.div`
  px-5
  py-5
`;

const ErrorContainer = tw.div`
  flex-1
  flex
  flex-col
  items-center
  justify-center
  gap-4
`;

const ErrorIconWrapper = tw.div`
  w-12
  h-12
  rounded-full
  bg-red-100
  text-red-500
  flex
  items-center
  justify-center
  text-2xl
  font-bold
`;

const ErrorText = tw.p`
  text-gray-800
  text-lg
  text-center
  px-4
`;

const GoBackButton = tw.button`
  mt-4
  px-6
  py-2
  bg-gray-100
  text-gray-700
  rounded-lg
  hover:bg-gray-200
  transition-colors
`;

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

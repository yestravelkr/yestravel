/**
 * 카카오 로그인 콜백 페이지
 *
 * 카카오 인증 후 리다이렉트되는 페이지입니다.
 * Authorization Code를 받아서 백엔드 API로 토큰을 발급받고,
 * 로그인 버튼을 눌렀던 원래 페이지로 돌아갑니다.
 */

import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import tw from 'tailwind-styled-components';

import { redirectToSocialLogin } from '@/shared/auth';
import { trpc } from '@/shared/trpc/trpc';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/auth/kakao/callback')({
  component: KakaoCallbackPage,
});

function KakaoCallbackPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state'); // 원래 페이지 URL

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isCalledRef = useRef(false);

  const kakaoLoginMutation = trpc.shopAuth.kakaoLogin.useMutation({
    onSuccess: data => {
      // 성공 시 재시도 카운터 초기화
      sessionStorage.removeItem('kakaoLoginRetry');

      if (data.status === 'complete') {
        // 기존 회원 - 토큰 저장 후 원래 페이지로 이동
        useAuthStore
          .getState()
          .login(
            { accessToken: data.accessToken, refreshToken: data.refreshToken },
            data.member
          );
        toast.success('로그인 성공!');

        const returnUrl = state || '/';
        window.location.href = returnUrl;
      } else {
        // 신규 회원 - 휴대폰 인증 페이지로 이동
        const returnUrl = state || '/';
        const params = new URLSearchParams({
          token: data.pendingToken,
          returnUrl,
        });
        if (data.name) {
          params.set('name', data.name);
        }
        window.location.href = `/auth/complete-profile?${params.toString()}`;
      }
    },
    onError: err => {
      // 인증 코드 만료/재사용 에러는 자동으로 카카오 로그인 재시도
      if (err.message.includes('인증 코드가 유효하지 않거나 만료')) {
        handleRetryKakaoLogin();
        return;
      }
      setErrorMessage(err.message || '카카오 로그인에 실패했습니다');
    },
  });

  const handleRetryKakaoLogin = () => {
    // 무한 루프 방지: 최대 1회만 자동 재시도
    const retryCount = Number(sessionStorage.getItem('kakaoLoginRetry') || 0);
    if (retryCount >= 1) {
      sessionStorage.removeItem('kakaoLoginRetry');
      setErrorMessage('카카오 로그인에 실패했습니다. 다시 시도해주세요.');
      return;
    }
    sessionStorage.setItem('kakaoLoginRetry', String(retryCount + 1));

    const returnUrl = state || '/';
    redirectToSocialLogin('kakao', returnUrl);
  };

  useEffect(() => {
    // StrictMode 중복 호출 방지
    if (isCalledRef.current) return;

    if (error) {
      setErrorMessage('카카오 로그인이 취소되었습니다');
      return;
    }

    if (code) {
      isCalledRef.current = true;
      const redirectUri = `${window.location.origin}/auth/kakao/callback`;
      kakaoLoginMutation.mutate({ code, redirectUri });
    }
  }, []);

  const handleGoBack = () => {
    const returnUrl = state || '/';
    window.location.href = returnUrl;
  };

  if (errorMessage) {
    return (
      <Container>
        <ErrorIcon>!</ErrorIcon>
        <ErrorText>{errorMessage}</ErrorText>
        <GoBackButton onClick={handleGoBack}>돌아가기</GoBackButton>
      </Container>
    );
  }

  return (
    <Container>
      <LoadingSpinner />
      <LoadingText>카카오 로그인 중...</LoadingText>
    </Container>
  );
}

const Container = tw.div`
  min-h-screen
  flex
  flex-col
  items-center
  justify-center
  gap-4
  bg-white
`;

const LoadingSpinner = tw.div`
  w-10
  h-10
  border-4
  border-gray-200
  border-t-yellow-400
  rounded-full
  animate-spin
`;

const LoadingText = tw.p`
  text-gray-600
  text-lg
`;

const ErrorIcon = tw.div`
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

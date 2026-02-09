/**
 * AuthLayout - 인증 보호 레이아웃 라우트
 *
 * TanStack Router의 pathless 레이아웃 라우트로,
 * 하위 라우트에 대한 인증 보호를 제공합니다.
 *
 * - 로그인됨: Outlet 렌더링
 * - 로그인 안됨: LoginBottomSheet를 자동으로 열어서 로그인 유도
 * - Hydration 전: null 반환 (로딩 대기)
 *
 * Usage:
 * routes/_auth/ 디렉토리 내 라우트 파일들이 자동으로 보호됩니다.
 * URL 경로는 변경되지 않습니다. (_auth는 pathless)
 */

import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { openLoginBottomSheet } from '@/components/auth/LoginBottomSheet';
import { useAuthStore } from '@/store/authStore';

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
});

/**
 * AuthLayout - 인증 상태에 따라 Outlet 또는 로그인 유도를 표시
 */
function AuthLayout() {
  const { isLoggedIn, isHydrated } = useAuthStore();

  if (!isHydrated) {
    return null;
  }

  if (!isLoggedIn) {
    return <LoginRequiredView />;
  }

  return <Outlet />;
}

/**
 * LoginRequiredView - 미인증 사용자에게 LoginBottomSheet를 자동으로 표시
 *
 * 마운트 시 LoginBottomSheet를 열고, 닫히면 이전 페이지로 이동합니다.
 */
function LoginRequiredView() {
  const navigate = useNavigate();
  const hasOpened = useRef(false);

  useEffect(() => {
    if (hasOpened.current) return;
    hasOpened.current = true;

    const openLogin = async () => {
      const result = await openLoginBottomSheet();

      if (result?.success) {
        window.location.reload();
      } else {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          navigate({ to: '/' });
        }
      }
    };

    openLogin();
  }, [navigate]);

  return null;
}
